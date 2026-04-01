// MovementArrowLayer — thin, crisp movement arrows in the style of a printed
// military atlas.  A slender curved stroke + small arrowhead; no filled blobs.
// Phase transitions: new arrows draw on (stroke-dashoffset), old ones fade out.

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

// ── Stroke widths: readable but not dominant ───────────────────────────────
const TYPE_STROKE: Record<string, number> = {
  hq:                  2.0,
  army_corps:          3.0,
  infantry_division:   2.5,
  infantry_regiment:   2.0,
  infantry_task_force: 2.0,
  infantry_battalion:  1.8,
  infantry_company:    1.6,
  commando:            1.8,
  artillery_regiment:  2.0,
  artillery_battalion: 1.8,
  armor_company:       1.8,
  air_wing:            0.0,   // skip
}

// Maximum arrow length in screen pixels — clamp very long moves so they
// don't become confusing scratches across the whole map.
const MAX_ARROW_PX = 180

function strokeWidth(unitType: string): number {
  return TYPE_STROKE[unitType] ?? 2.0
}

function wikiColor(hex: string): string {
  const h = hex.toLowerCase()
  if (h.includes('003') || h.includes('1a3') || h.includes('197')) return WIKI_COLOURS.unBlue
  if (h.includes('8b1') || h.includes('aa0') || h.includes('c62') || h.includes('922')) return WIKI_COLOURS.pvaRed
  return hex
}

/** Approximate quadratic-bezier arc length (for stroke-dasharray draw-on). */
function bezierLen(
  x0: number, y0: number,
  cx: number, cy: number,
  x1: number, y1: number,
  steps = 32,
): number {
  let len = 0, px = x0, py = y0
  for (let i = 1; i <= steps; i++) {
    const t = i / steps, mt = 1 - t
    const nx = mt * mt * x0 + 2 * mt * t * cx + t * t * x1
    const ny = mt * mt * y0 + 2 * mt * t * cy + t * t * y1
    len += Math.hypot(nx - px, ny - py)
    px = nx; py = ny
  }
  return len
}

/**
 * Build a minimal SVG: a thin curved arrow from (x1,y1) to (x2,y2).
 * Returns the SVG string and where to anchor the MapLibre marker.
 */
function buildArrow(
  x1: number, y1: number,
  x2: number, y2: number,
  color: string,
  sw: number,   // stroke width in px
): { svg: string; anchorOffsetX: number; anchorOffsetY: number } | null {
  const dx = x2 - x1, dy = y2 - y1
  let len = Math.hypot(dx, dy)
  if (len < 12) return null

  // Clamp very long arrows — shorten to MAX_ARROW_PX along the same direction
  // so distant movements still show direction without a distracting long line.
  if (len > MAX_ARROW_PX) {
    const scale = MAX_ARROW_PX / len
    x2 = x1 + dx * scale
    y2 = y1 + dy * scale
    len = MAX_ARROW_PX
  }

  const ux = dx / len, uy = dy / len   // unit vector along arrow
  const px = -uy,      py =  ux        // perpendicular (for arc bow)

  // Gentle arc — bow perpendicular to the arrow, 8% of length
  const bow = len * 0.08
  const cx = (x1 + x2) / 2 + px * bow
  const cy = (y1 + y2) / 2 + py * bow

  // Arrowhead: small open chevron at the tip
  // Step back from tip along the tangent at t=1 of the bezier
  const headLen = Math.max(7, sw * 4.0)   // scales gently with stroke
  const headAngle = 25                     // half-angle in degrees

  // Tangent at t=1: direction from control point to end point
  const tx = x2 - cx, ty = y2 - cy
  const tLen = Math.hypot(tx, ty)
  const tux = tx / tLen, tuy = ty / tLen

  const rad = (headAngle * Math.PI) / 180
  const cos = Math.cos(rad), sin = Math.sin(rad)
  // Left and right barbs
  const lx = x2 - headLen * (tux * cos - tuy * sin)
  const ly = y2 - headLen * (tuy * cos + tux * sin)
  const rx = x2 - headLen * (tux * cos + tuy * sin)
  const ry = y2 - headLen * (tuy * cos - tux * sin)

  // Arc length for the draw-on animation
  const arcLen = Math.round(bezierLen(x1, y1, cx, cy, x2, y2))

  // Bounding box with margin for the stroke + arrowhead
  const margin = headLen + sw * 3 + 4
  const allX = [x1, x2, cx, lx, rx]
  const allY = [y1, y2, cy, ly, ry]
  const minX = Math.min(...allX) - margin
  const minY = Math.min(...allY) - margin
  const svgW = Math.ceil(Math.max(...allX) + margin - minX)
  const svgH = Math.ceil(Math.max(...allY) + margin - minY)
  const ox = -minX, oy = -minY

  const pt = (x: number, y: number) => `${(x + ox).toFixed(1)},${(y + oy).toFixed(1)}`
  const ps = (x: number, y: number) => `${(x + ox).toFixed(1)} ${(y + oy).toFixed(1)}`

  const curvePath = `M ${pt(x1, y1)} Q ${ps(cx, cy)} ${pt(x2, y2)}`

  // Draw-on: animate stroke-dashoffset from arcLen → 0
  const drawDur = '0.5s'
  const headDelay = '0.38s'  // arrowhead appears near the end

  // White halo outline width
  const haloW = (sw + 1.5).toFixed(1)
  const strokeW = sw.toFixed(1)
  // Arrowhead stroke (open chevron, no fill)
  const headW = (sw * 0.9).toFixed(1)

  // anchor at the geographic midpoint of the arrow
  const midX = (x1 + x2) / 2
  const midY = (y1 + y2) / 2

  const svg = `<svg xmlns="http://www.w3.org/2000/svg"
    width="${svgW}" height="${svgH}"
    style="overflow:visible;display:block;pointer-events:none"
    viewBox="0 0 ${svgW} ${svgH}">

  <!-- White halo for contrast on any basemap -->
  <path d="${curvePath}" fill="none"
        stroke="#fff" stroke-width="${haloW}"
        stroke-linecap="round" stroke-linejoin="round"
        opacity="0.70"
        stroke-dasharray="${arcLen} ${arcLen}"
        stroke-dashoffset="${arcLen}">
    <animate attributeName="stroke-dashoffset"
             from="${arcLen}" to="0"
             dur="${drawDur}" fill="freeze"
             calcMode="spline" keySplines="0.25 0.1 0.25 1" keyTimes="0;1"/>
  </path>

  <!-- Main coloured stroke -->
  <path d="${curvePath}" fill="none"
        stroke="${color}" stroke-width="${strokeW}"
        stroke-linecap="round" stroke-linejoin="round"
        opacity="0.92"
        stroke-dasharray="${arcLen} ${arcLen}"
        stroke-dashoffset="${arcLen}">
    <animate attributeName="stroke-dashoffset"
             from="${arcLen}" to="0"
             dur="${drawDur}" fill="freeze"
             calcMode="spline" keySplines="0.25 0.1 0.25 1" keyTimes="0;1"/>
  </path>

  <!-- Arrowhead (open chevron) — fades in at the end of the draw-on -->
  <g opacity="0">
    <animate attributeName="opacity" from="0" to="1"
             begin="${headDelay}" dur="0.12s" fill="freeze"/>

    <!-- halo -->
    <polyline points="${pt(lx,ly)} ${pt(x2,y2)} ${pt(rx,ry)}"
              fill="none" stroke="#fff" stroke-width="${(sw + 1.5).toFixed(1)}"
              stroke-linecap="round" stroke-linejoin="round" opacity="0.70"/>
    <!-- coloured chevron -->
    <polyline points="${pt(lx,ly)} ${pt(x2,y2)} ${pt(rx,ry)}"
              fill="none" stroke="${color}" stroke-width="${headW}"
              stroke-linecap="round" stroke-linejoin="round" opacity="0.92"/>
  </g>
</svg>`

  return {
    svg,
    anchorOffsetX: midX + ox,
    anchorOffsetY: midY + oy,
  }
}

export function MovementArrowLayer({ map, battle, currentPhase, nextPhase }: MovementArrowLayerProps) {
  const markersRef    = useRef<maplibregl.Marker[]>([])
  const fadingRef     = useRef<maplibregl.Marker[]>([])
  const fadeTimersRef = useRef<ReturnType<typeof setTimeout>[]>([])

  useEffect(() => {
    // ── Fade out the previous set of arrows ───────────────────────────────
    fadeTimersRef.current.forEach(clearTimeout)
    fadeTimersRef.current = []

    fadingRef.current.forEach((m) => m.remove())
    fadingRef.current = []

    if (markersRef.current.length > 0) {
      const outgoing = markersRef.current
      markersRef.current = []

      outgoing.forEach((m) => {
        const el = m.getElement()
        el.style.transition = 'opacity 180ms ease-out'
        el.style.opacity = '0'
      })

      const t = setTimeout(() => {
        outgoing.forEach((m) => m.remove())
        fadingRef.current = fadingRef.current.filter((x) => !outgoing.includes(x))
      }, 200)

      fadeTimersRef.current.push(t)
      fadingRef.current = outgoing
    }

    if (!map || !nextPhase) return

    // ── Collect movements ─────────────────────────────────────────────────
    type Arrow = {
      fromLng: number; fromLat: number
      toLng:   number; toLat:   number
      color:   string
      sw:      number
    }
    const arrows: Arrow[] = []

    for (const up of currentPhase.unit_positions) {
      const cur = up.positions[0]
      if (!cur) continue

      const nextUp = nextPhase.unit_positions.find(
        (p) => p.unit_id === up.unit_id && p.faction_id === up.faction_id,
      )
      const next = nextUp?.positions[0]
      if (!next) continue
      if (Math.abs(cur.lat - next.lat) < 0.001 && Math.abs(cur.lng - next.lng) < 0.001) continue

      const faction = battle.factions.find((f) => f.id === up.faction_id)
      const unit    = faction?.units.find((u) => u.id === up.unit_id)

      if (unit?.type === 'air_wing') continue

      const sw = strokeWidth(unit?.type ?? '')
      if (sw === 0) continue

      arrows.push({
        fromLat: cur.lat,  fromLng: cur.lng,
        toLat:   next.lat, toLng:   next.lng,
        color:   faction ? wikiColor(faction.color) : '#555',
        sw,
      })
    }

    // ── Draw arrows ───────────────────────────────────────────────────────
    function draw() {
      markersRef.current.forEach((m) => m.remove())
      markersRef.current = []

      for (const a of arrows) {
        const p1 = map.project([a.fromLng, a.fromLat])
        const p2 = map.project([a.toLng,   a.toLat])

        const result = buildArrow(p1.x, p1.y, p2.x, p2.y, a.color, a.sw)
        if (!result) continue
        const { svg, anchorOffsetX, anchorOffsetY } = result

        const el = document.createElement('div')
        el.style.cssText = 'pointer-events:none;position:absolute;'
        el.innerHTML = svg

        const marker = new maplibregl.Marker({
          element: el,
          anchor: 'top-left',
          offset: [-anchorOffsetX, -anchorOffsetY],
          rotationAlignment: 'viewport',
          pitchAlignment: 'viewport',
        })
          .setLngLat([(a.fromLng + a.toLng) / 2, (a.fromLat + a.toLat) / 2])
          .addTo(map)

        markersRef.current.push(marker)
      }
    }

    function onMapMove() { draw() }

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
