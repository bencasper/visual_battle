// MovementArrow — SVG curved arrow showing unit movement direction
// Rendered as a MapLibre overlay via a DOM element marker

import { useEffect, useRef } from 'react'
import maplibregl, { type Map as MapLibreMap } from 'maplibre-gl'

interface MovementArrowProps {
  map: MapLibreMap
  fromLat: number
  fromLng: number
  toLat: number
  toLng: number
  color: string
}

export function MovementArrow({ map, fromLat, fromLng, toLat, toLng, color }: MovementArrowProps) {
  const markerRef = useRef<maplibregl.Marker | null>(null)

  useEffect(() => {
    const midLat = (fromLat + toLat) / 2
    const midLng = (fromLng + toLng) / 2

    // Arrow at midpoint pointing from→to
    const angle = Math.atan2(toLat - fromLat, toLng - fromLng) * (180 / Math.PI)

    const el = document.createElement('div')
    el.innerHTML = `<svg width="20" height="20" viewBox="0 0 20 20" style="transform:rotate(${angle}deg)">
      <polygon points="10,2 18,18 10,14 2,18" fill="${color}" opacity="0.8"/>
    </svg>`
    el.style.pointerEvents = 'none'

    const marker = new maplibregl.Marker({ element: el, anchor: 'center' })
      .setLngLat([midLng, midLat])
      .addTo(map)

    markerRef.current = marker
    return () => marker.remove()
  }, [map, fromLat, fromLng, toLat, toLng, color])

  return null
}
