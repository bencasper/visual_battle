import { useEffect, useRef } from 'react'
import maplibregl from 'maplibre-gl'
import type { StrategyOverlayProps } from './StrategyOverlay.types'
import { createAnnotationElement } from './AnnotationPin'

export function StrategyOverlay({ phase, mapRef, visible }: StrategyOverlayProps) {
  const markersRef = useRef<maplibregl.Marker[]>([])

  useEffect(() => {
    markersRef.current.forEach((m) => m.remove())
    markersRef.current = []

    if (!visible || !mapRef.current) return

    phase.events.forEach((event) => {
      const el = createAnnotationElement(event)

      const popup = new maplibregl.Popup({
        offset: 14,
        closeButton: true,
        maxWidth: '240px',
        className: 'annotation-popup',
      }).setHTML(`
        <div style="font-family:'Linux Libertine',Georgia,serif;font-size:11px;color:#1a1008">
          <p style="font-weight:700;margin:0 0 5px 0;font-size:12px">${event.label}</p>
          <p style="color:#5c4a2a;margin:0;line-height:1.5">${event.description}</p>
        </div>
      `)

      const marker = new maplibregl.Marker({ element: el, anchor: 'center' })
        .setLngLat([event.location.lng, event.location.lat])
        .setPopup(popup)
        .addTo(mapRef.current!)

      markersRef.current.push(marker)
    })

    return () => {
      markersRef.current.forEach((m) => m.remove())
      markersRef.current = []
    }
  }, [phase, visible, mapRef])

  return null
}
