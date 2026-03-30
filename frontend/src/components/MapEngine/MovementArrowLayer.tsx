// MovementArrowLayer — Wikipedia-style broad tapered movement arrows.
// Each arrow is a single SVG element positioned as a MapLibre marker at the
// midpoint of the path, sized and rotated to span from→to.
// Visual style matches https://upload.wikimedia.org/wikipedia/commons/6/64/Battle_of_Chishui_River-zh.png:
//   • Broad, tapered body (wide at tail, narrows toward tip)
//   • Bold filled triangle arrowhead
//   • Dark outline/shadow for legibility on parchment
//   • UN blue / PVA red

import { useEffect, useRef } from 'react'
import maplibregl, { type Map as MapLibreMap } from 'maplibre-gl'
import type { Battle, Phase } from '@/types/battle'
import { WIKI_COLOURS } from '@/utils/wikiMapStyle'

interface MovementArrowLayerProps {
  map: MapLibreMap
  battle: Battle
  currentPhase: Phase
  previousPhase: Phase | null
}

function wikiColor(hex: string): string {
  const h = hex.toLowerCase()
  if (h.includes('003') || h.includes('1a3') || h.includes('197')) return WIKI_COLOURS.unBlue
  if (h.includes('8b1') || h.includes('aa0') || h.includes('c62') || h.includes('922')) return WIKI_COLOURS.pvaRed
  return hex
}

// Project a [lng,lat] to pixel coords using the map's current projection
function project(map: MapLibreMap, lng: number, lat: number): { x: number; y: number } {
  return map.project([lng, lat])
}

// Build an SVG arrow from pixel (x1,y1) to (x2,y2).
// The arrow is a tapered polygon: wide at the tail, tapering to zero just before
// the arrowhead, then a bold filled triangle for the head.
// All coordinates are in the SVG local coordinate system (centred on the midpoint).
function buildArrowSVG(
  x1: number, y1: number,
  x2: number, y2: number,
  color: string,
): { svg: string; width: number; height: number; offsetX: number; offsetY: number } {
  const dx = x2 - x1
  const dy = y2 - y1
  const length = Math.sqrt(dx * dx + dy * dy)
  if (length < 2) return { svg: '', width: 0, height: 0, offsetX: 0, offsetY: 0 }

  // Arrow dimensions (in pixels)
  const tailWidth  = Math.max(6, Math.min(14, length * 0.08))  // taper from this at tail
  const bodyEnd    = length * 0.72     // where body (tapered part) ends
  const headLen    = length * 0.28     // arrowhead takes last 28% of length
  const headWidth  = tailWidth * 2.6   // arrowhead is significantly wider than tail

  // Unit vectors
  const ux = dx / length, uy = dy / length   // along arrow
  const px = -uy,         py =  ux           // perpendicular (left)

  // We build the shape in a rotated local frame where the arrow goes from (0,0) to (length,0),
  // then we'll bake the rotation into an SVG transform.

  // Body polygon points (tapered trapezoid):
  //   tail-left, body-end-left, body-end-right, tail-right  (going round)
  const bodyPts = [
    [0,           tailWidth],
    [bodyEnd,     tailWidth * 0.15],
    [bodyEnd,    -tailWidth * 0.15],
    [0,          -tailWidth],
  ]

  // Arrowhead triangle:
  //   head-base-left, tip, head-base-right
  const headPts = [
    [bodyEnd,  headWidth / 2],
    [length,   0],
    [bodyEnd, -headWidth / 2],
  ]

  // Convert to SVG path strings (in the rotated frame, x=along arrow, y=perpendicular)
  const bodyPath = bodyPts.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p[0].toFixed(1)} ${p[1].toFixed(1)}`).join(' ') + ' Z'
  const headPath = headPts.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p[0].toFixed(1)} ${p[1].toFixed(1)}`).join(' ') + ' Z'

  // Bounding box in the rotated frame
  const margin = headWidth / 2 + 4
  const svgW = Math.ceil(length + margin * 2)
  const svgH = Math.ceil(headWidth + margin * 2)

  // The rotation angle (from east/right to the actual arrow direction)
  const angleDeg = Math.atan2(dy, dx) * (180 / Math.PI)

  // The SVG is centred on the midpoint of the arrow.
  // In the rotated frame, the arrow starts at x=0 and ends at x=length.
  // We need to offset so the midpoint (length/2, 0) maps to the SVG centre.
  const cx = svgW / 2
  const cy = svgH / 2
  const shiftX = cx - length / 2
  const shiftY = cy

  const svg = `
<svg xmlns="http://www.w3.org/2000/svg"
     width="${svgW}" height="${svgH}"
     style="overflow:visible; display:block"
     viewBox="0 0 ${svgW} ${svgH}">
  <g transform="translate(${shiftX.toFixed(1)},${shiftY.toFixed(1)}) rotate(0)">
    <!-- shadow / dark outline -->
    <path d="${bodyPath}" fill="none" stroke="#1a1008" stroke-width="3.5" stroke-linejoin="round" opacity="0.5"/>
    <path d="${headPath}" fill="#1a1008" stroke="none" opacity="0.4"/>
    <!-- white halo -->
    <path d="${bodyPath}" fill="none" stroke="#ffffff" stroke-width="2.5" stroke-linejoin="round" opacity="0.7"/>
    <!-- coloured body fill -->
    <path d="${bodyPath}" fill="${color}" stroke="${color}" stroke-width="0.5" stroke-linejoin="round" opacity="0.88"/>
    <!-- coloured arrowhead -->
    <path d="${headPath}" fill="${color}" stroke="#1a1008" stroke-width="1" stroke-linejoin="round" opacity="0.95"/>
  </g>
</svg>`

  return {
    svg,
    width:   svgW,
    height:  svgH,
    // offset from marker anchor (midpoint lng/lat projected) to SVG top-left, pre-rotation
    offsetX: -svgW / 2,
    offsetY: -svgH / 2,
  }
}

export function MovementArrowLayer({ map, battle, currentPhase, previousPhase }: MovementArrowLayerProps) {
  const markersRef = useRef<maplibregl.Marker[]>([])

  useEffect(() => {
    // Remove previous markers
    markersRef.current.forEach((m) => m.remove())
    markersRef.current = []

    if (!map || !previousPhase) return

    function draw() {
      // collect arrows
      type Arrow = { fromLng: number; fromLat: number; toLng: number; toLat: number; color: string }
      const arrows: Arrow[] = []

      for (const up of currentPhase.unit_positions) {
        const cur = up.positions[0]
        if (!cur) continue
        const prevUp = previousPhase!.unit_positions.find(
          (p) => p.unit_id === up.unit_id && p.faction_id === up.faction_id,
        )
        const prev = prevUp?.positions[0]
        if (!prev) continue
        if (Math.abs(cur.lat - prev.lat) < 0.001 && Math.abs(cur.lng - prev.lng) < 0.001) continue

        const faction = battle.factions.find((f) => f.id === up.faction_id)
        arrows.push({
          fromLat: prev.lat, fromLng: prev.lng,
          toLat: cur.lat,    toLng: cur.lng,
          color: faction ? wikiColor(faction.color) : '#555',
        })
      }

      // For each arrow: project to pixels, build SVG, place marker at midpoint
      for (const a of arrows) {
        const p1 = project(map, a.fromLng, a.fromLat)
        const p2 = project(map, a.toLng,   a.toLat)

        const dx = p2.x - p1.x
        const dy = p2.y - p1.y
        const angleDeg = Math.atan2(dy, dx) * (180 / Math.PI)
        const length = Math.sqrt(dx * dx + dy * dy)
        if (length < 5) continue

        const { svg, width, height } = buildArrowSVG(p1.x, p1.y, p2.x, p2.y, a.color)
        if (!svg) continue

        const el = document.createElement('div')
        el.style.cssText = 'pointer-events:none; position:absolute;'
        el.innerHTML = svg

        // Rotate the SVG element around its centre to point from→to
        const svgEl = el.firstElementChild as HTMLElement
        if (svgEl) {
          svgEl.style.transform = `rotate(${angleDeg.toFixed(1)}deg)`
          svgEl.style.transformOrigin = '50% 50%'
        }

        // Place marker at geographic midpoint
        const midLng = (a.fromLng + a.toLng) / 2
        const midLat = (a.fromLat + a.toLat) / 2

        const marker = new maplibregl.Marker({
          element: el,
          anchor: 'center',
          rotationAlignment: 'viewport',
          pitchAlignment: 'viewport',
        })
          .setLngLat([midLng, midLat])
          .addTo(map)

        markersRef.current.push(marker)
      }
    }

    // Redraw whenever the map moves/zooms (pixel positions change)
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
  }, [map, battle, currentPhase, previousPhase])

  return null
}
