// MovementArrowLayer — Wikipedia-style broad tapered movement arrows.
// Arrows show where units are headed NEXT (current → next phase positions).

import { useEffect, useRef } from 'react'
import maplibregl, { type Map as MapLibreMap } from 'maplibre-gl'
import type { Battle, Phase } from '@/types/battle'
import { WIKI_COLOURS } from '@/utils/wikiMapStyle'

interface MovementArrowLayerProps {
  map: MapLibreMap
  battle: Battle
  currentPhase: Phase
  nextPhase: Phase | null
}

// ── Unit-size scale factor ─────────────────────────────────────────────────
// Maps unit type + effective troop strength to a 0–1 arrow thickness scale.
// Corps/Army = fattest; company/battalion = thinnest.
const TYPE_BASE_SCALE: Record<string, number> = {
  hq:                  0.55,
  army_corps:          1.00,
  infantry_division:   0.80,
  infantry_regiment:   0.55,
  infantry_task_force: 0.50,
  infantry_battalion:  0.35,
  infantry_company:    0.22,
  commando:            0.25,
  artillery_regiment:  0.45,
  artillery_battalion: 0.30,
  armor_company:       0.28,
  air_wing:            0.00,   // no ground movement arrow
}

/** Returns a 0–1 size scale for this unit based on type + current effective strength */
function unitSizeScale(unitType: string, effectiveStrength: number): number {
  const typeBase = TYPE_BASE_SCALE[unitType] ?? 0.40
  // Troop-count modifier: log-scale from 100 (min) to 40,000 (max)
  const strengthScale = Math.max(0, Math.min(1,
    (Math.log10(Math.max(100, effectiveStrength)) - Math.log10(100)) /
    (Math.log10(40000)                           - Math.log10(100))
  ))
  // Blend: 70% type-driven, 30% strength-driven
  return typeBase * 0.70 + strengthScale * 0.30
}

function wikiColor(hex: string): string {
  const h = hex.toLowerCase()
  if (h.includes('003') || h.includes('1a3') || h.includes('197')) return WIKI_COLOURS.unBlue
  if (h.includes('8b1') || h.includes('aa0') || h.includes('c62') || h.includes('922')) return WIKI_COLOURS.pvaRed
  return hex
}

function lighten(hex: string, amount: number): string {
  const r = parseInt(hex.slice(1, 3), 16)
  const g = parseInt(hex.slice(3, 5), 16)
  const b = parseInt(hex.slice(5, 7), 16)
  return `rgb(${Math.round(r + (255 - r) * amount)},${Math.round(g + (255 - g) * amount)},${Math.round(b + (255 - b) * amount)})`
}

/**
 * Build an SVG arrow from pixel (x1,y1) to (x2,y2).
 *
 * The SVG is sized to the full bounding box of the arrow.
 * The marker is anchored at the geographic mid-point, so we return the
 * pixel offset from the SVG top-left to the mid-point of the arrow.
 */
function buildArrowSVG(
  x1: number, y1: number,
  x2: number, y2: number,
  color: string,
  sizeScale: number,       // 0–1 driven by unit type + strength
): { svg: string; anchorOffsetX: number; anchorOffsetY: number } | null {
  const dx = x2 - x1
  const dy = y2 - y1
  const length = Math.sqrt(dx * dx + dy * dy)
  if (length < 10) return null

  // Body width: purely unit-size driven (2–8 px), NOT length-driven
  const bodyW   = 2 + sizeScale * 6           // 2 px (company) → 8 px (corps)
  const headLen = Math.max(bodyW * 2.0, 6 + sizeScale * 10)    // proportional head
  const headW   = bodyW * 2.4

  // Unit vectors
  const ux = dx / length, uy = dy / length   // along
  const px = -uy,         py =  ux           // perpendicular

  // Bezier control point — subtle arc
  const arcAmt = length * 0.10
  const qcX = (x1 + x2) / 2 + px * arcAmt
  const qcY = (y1 + y2) / 2 + py * arcAmt

  // Arrow tip
  const tipX = x2, tipY = y2

  // Head base centre (step back from tip)
  const hbX = tipX - ux * headLen
  const hbY = tipY - uy * headLen

  // Head base corners
  const hlX = hbX + px * headW, hlY = hbY + py * headW
  const hrX = hbX - px * headW, hrY = hbY - py * headW

  // Tail corners
  const tlX = x1 + px * bodyW, tlY = y1 + py * bodyW
  const trX = x1 - px * bodyW, trY = y1 - py * bodyW

  // Body-end corners (narrowed where it meets head)
  const beW = bodyW * 0.55
  const belX = hbX + px * beW, belY = hbY + py * beW
  const berX = hbX - px * beW, berY = hbY - py * beW

  // Bezier side control points (parallel offset of qc)
  const qclX = qcX + px * bodyW, qclY = qcY + py * bodyW
  const qcrX = qcX - px * bodyW, qcrY = qcY - py * bodyW

  // Compute bounding box with margin
  const margin = headW + 10
  const allX = [x1, x2, qcX, tlX, trX, hlX, hrX, belX, berX]
  const allY = [y1, y2, qcY, tlY, trY, hlY, hrY, belY, berY]
  const minX = Math.min(...allX) - margin
  const minY = Math.min(...allY) - margin
  const maxX = Math.max(...allX) + margin
  const maxY = Math.max(...allY) + margin
  const svgW = Math.ceil(maxX - minX)
  const svgH = Math.ceil(maxY - minY)

  const ox = -minX, oy = -minY

  // Shift helpers
  const p  = (x: number, y: number) => `${(x+ox).toFixed(1)},${(y+oy).toFixed(1)}`
  const ps = (x: number, y: number) => `${(x+ox).toFixed(1)} ${(y+oy).toFixed(1)}`

  // Body path: tapered quad-bezier outline
  const bodyPath =
    `M ${p(tlX,tlY)} ` +
    `Q ${ps(qclX,qclY)} ${p(belX,belY)} ` +
    `L ${p(berX,berY)} ` +
    `Q ${ps(qcrX,qcrY)} ${p(trX,trY)} Z`

  // Head: filled triangle
  const headPath = `M ${p(hlX,hlY)} L ${p(tipX,tipY)} L ${p(hrX,hrY)} Z`

  // Centreline path for march-line animation
  const centrePath = `M ${ps(x1,y1)} Q ${ps(qcX,qcY)} ${ps(hbX,hbY)}`

  const colorLight = lighten(color, 0.50)
  const gradId  = `g${Math.random().toString(36).slice(2,8)}`
  const animDur = '1.5s'
  const dashLen = Math.max(4, Math.round(bodyW * 1.4))
  const gapLen  = Math.max(3, Math.round(bodyW * 1.0))

  // Anchor offset: pixel distance from SVG top-left to geographic midpoint
  const midScreenX = (x1 + x2) / 2
  const midScreenY = (y1 + y2) / 2
  const anchorOffsetX = midScreenX + ox
  const anchorOffsetY = midScreenY + oy

  const svg = `<svg xmlns="http://www.w3.org/2000/svg"
     width="${svgW}" height="${svgH}"
     style="overflow:visible;display:block;pointer-events:none"
     viewBox="0 0 ${svgW} ${svgH}">
  <defs>
    <linearGradient id="${gradId}" gradientUnits="userSpaceOnUse"
        x1="${(x1+ox).toFixed(1)}" y1="${(y1+oy).toFixed(1)}"
        x2="${(x2+ox).toFixed(1)}" y2="${(y2+oy).toFixed(1)}">
      <stop offset="0%"   stop-color="${colorLight}" stop-opacity="0.70"/>
      <stop offset="55%"  stop-color="${color}"      stop-opacity="0.90"/>
      <stop offset="100%" stop-color="${color}"      stop-opacity="0.98"/>
    </linearGradient>
  </defs>

  <!-- Drop shadow -->
  <path d="${bodyPath}" fill="#000" opacity="0.20" transform="translate(1.5,2.5)"/>
  <path d="${headPath}" fill="#000" opacity="0.20" transform="translate(1.5,2.5)"/>

  <!-- Dark outline (readability on sat/terrain) -->
  <path d="${bodyPath}" fill="none" stroke="#000"
        stroke-width="${(bodyW * 1.05).toFixed(1)}"
        stroke-linejoin="round" stroke-linecap="round" opacity="0.38"/>
  <path d="${headPath}" fill="#000" opacity="0.28"/>

  <!-- White halo -->
  <path d="${bodyPath}" fill="none" stroke="#fff"
        stroke-width="${(bodyW * 0.70).toFixed(1)}"
        stroke-linejoin="round" stroke-linecap="round" opacity="0.60"/>

  <!-- Body gradient fill -->
  <path d="${bodyPath}" fill="url(#${gradId})"
        stroke="${color}" stroke-width="0.5"
        stroke-linejoin="round" opacity="0.95"/>

  <!-- Animated march-line dashes -->
  <path d="${centrePath}" fill="none"
        stroke="#fff" stroke-width="${(bodyW * 0.24).toFixed(1)}"
        stroke-linecap="round" opacity="0.60"
        stroke-dasharray="${dashLen} ${gapLen}">
    <animate attributeName="stroke-dashoffset"
             from="0" to="${-(dashLen + gapLen)}"
             dur="${animDur}" repeatCount="indefinite"/>
  </path>

  <!-- Arrowhead -->
  <path d="${headPath}" fill="${color}"
        stroke="#fff" stroke-width="1.4"
        stroke-linejoin="round" opacity="0.98"/>

  <!-- Arrowhead centre highlight -->
  <line x1="${(hlX*0.6 + tipX*0.4 + ox).toFixed(1)}" y1="${(hlY*0.6 + tipY*0.4 + oy).toFixed(1)}"
        x2="${(tipX+ox).toFixed(1)}" y2="${(tipY+oy).toFixed(1)}"
        stroke="#fff" stroke-width="1.8" stroke-linecap="round" opacity="0.38"/>
</svg>`

  return { svg, anchorOffsetX, anchorOffsetY }
}

export function MovementArrowLayer({ map, battle, currentPhase, nextPhase }: MovementArrowLayerProps) {
  const markersRef = useRef<maplibregl.Marker[]>([])

  useEffect(() => {
    markersRef.current.forEach((m) => m.remove())
    markersRef.current = []

    if (!map || !nextPhase) return

    function draw() {
      type Arrow = {
        fromLng: number; fromLat: number
        toLng: number;   toLat: number
        color: string
        sizeScale: number
      }
      const arrows: Arrow[] = []

      for (const up of currentPhase.unit_positions) {
        const cur = up.positions[0]
        if (!cur) continue
        const nextUp = nextPhase!.unit_positions.find(
          (p) => p.unit_id === up.unit_id && p.faction_id === up.faction_id,
        )
        const next = nextUp?.positions[0]
        if (!next) continue
        if (Math.abs(cur.lat - next.lat) < 0.001 && Math.abs(cur.lng - next.lng) < 0.001) continue

        const faction = battle.factions.find((f) => f.id === up.faction_id)
        const unit    = faction?.units.find((u) => u.id === up.unit_id)

        // Skip air wings — no ground movement arrow
        if (unit?.type === 'air_wing') continue

        const effectiveStrength = unit
          ? Math.round(unit.strength * cur.strength_pct)
          : 1000

        const sizeScale = unit
          ? unitSizeScale(unit.type, effectiveStrength)
          : 0.40

        arrows.push({
          fromLat: cur.lat,  fromLng: cur.lng,
          toLat:   next.lat, toLng:   next.lng,
          color:     faction ? wikiColor(faction.color) : '#555',
          sizeScale,
        })
      }

      for (const a of arrows) {
        const p1 = map.project([a.fromLng, a.fromLat])
        const p2 = map.project([a.toLng,   a.toLat])

        const result = buildArrowSVG(p1.x, p1.y, p2.x, p2.y, a.color, a.sizeScale)
        if (!result) continue
        const { svg, anchorOffsetX, anchorOffsetY } = result

        const el = document.createElement('div')
        el.style.cssText = 'pointer-events:none; position:absolute;'
        el.innerHTML = svg

        // Place marker at geographic midpoint; offset the element so the
        // SVG draws correctly relative to that anchor point.
        const midLng = (a.fromLng + a.toLng) / 2
        const midLat = (a.fromLat + a.toLat) / 2

        const marker = new maplibregl.Marker({
          element: el,
          anchor: 'top-left',
          offset: [-anchorOffsetX, -anchorOffsetY],
          rotationAlignment: 'viewport',
          pitchAlignment: 'viewport',
        })
          .setLngLat([midLng, midLat])
          .addTo(map)

        markersRef.current.push(marker)
      }
    }

    function onMapMove() {
      markersRef.current.forEach((m) => m.remove())
      markersRef.current = []
      draw()
    }

    draw()
    map.on('move', onMapMove)
    map.on('zoom', onMapMove)

    return () => {
      map.off('move', onMapMove)
      map.off('zoom', onMapMove)
      markersRef.current.forEach((m) => m.remove())
      markersRef.current = []
    }
  }, [map, battle, currentPhase, nextPhase])

  return null
}
