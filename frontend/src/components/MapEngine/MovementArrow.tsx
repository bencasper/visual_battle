// MovementArrow — bold Wikipedia-style filled arrowhead showing unit movement direction
// Rendered as a MapLibre overlay via a DOM element marker

import { useEffect, useRef } from 'react'
import maplibregl, { type Map as MapLibreMap } from 'maplibre-gl'
import { WIKI_COLOURS } from '@/utils/wikiMapStyle'

interface MovementArrowProps {
  map: MapLibreMap
  fromLat: number
  fromLng: number
  toLat: number
  toLng: number
  color: string
}

/** Map dark faction colour to Wikipedia-accurate colour */
function wikiColor(hex: string): string {
  const h = hex.toLowerCase()
  if (h.includes('1a3') || h.includes('003')) return WIKI_COLOURS.unBlue
  if (h.includes('8b1') || h.includes('aa0')) return WIKI_COLOURS.pvaRed
  return hex
}

export function MovementArrow({ map, fromLat, fromLng, toLat, toLng, color }: MovementArrowProps) {
  const markerRef = useRef<maplibregl.Marker | null>(null)

  useEffect(() => {
    const midLat = (fromLat + toLat) / 2
    const midLng = (fromLng + toLng) / 2
    const angle  = Math.atan2(toLat - fromLat, toLng - fromLng) * (180 / Math.PI)
    const fill   = wikiColor(color)

    const el = document.createElement('div')
    el.style.pointerEvents = 'none'
    // Bold Wikipedia-style arrowhead: wider, flat, black outline
    el.innerHTML = `
      <svg width="36" height="36" viewBox="0 0 36 36"
           style="transform:rotate(${angle}deg); display:block; overflow:visible">
        <!-- Arrow body (tail) -->
        <line x1="4" y1="18" x2="22" y2="18"
              stroke="${fill}" stroke-width="5"
              stroke-linecap="round" opacity="0.9"/>
        <line x1="4" y1="18" x2="22" y2="18"
              stroke="#1a1008" stroke-width="7"
              stroke-linecap="round" opacity="0.35"/>
        <!-- Arrowhead -->
        <polygon points="36,18 20,10 20,26"
                 fill="${fill}" stroke="#1a1008" stroke-width="1.2"
                 stroke-linejoin="round" opacity="0.95"/>
      </svg>
    `

    const marker = new maplibregl.Marker({ element: el, anchor: 'center' })
      .setLngLat([midLng, midLat])
      .addTo(map)

    markerRef.current = marker
    return () => marker.remove()
  }, [map, fromLat, fromLng, toLat, toLng, color])

  return null
}
