import { useEffect, useRef } from 'react'
import maplibregl from 'maplibre-gl'
import type { StrategyOverlayProps } from './StrategyOverlay.types'
import { createAnnotationElement } from './AnnotationPin'

export function StrategyOverlay({ phase, mapRef, visible }: StrategyOverlayProps) {
  const markersRef = useRef<maplibregl.Marker[]>([])

  useEffect(() => {
    // Cleanup previous markers
    markersRef.current.forEach((m) => m.remove())
    markersRef.current = []

    if (!visible || !mapRef.current) return

    phase.events.forEach((event) => {
      const el = createAnnotationElement(event)

      const popup = new maplibregl.Popup({
        offset: 12,
        closeButton: true,
        maxWidth: '220px',
        className: 'annotation-popup',
      }).setHTML(`
        <div style="font-family: Inter, sans-serif; font-size: 11px; color: #e2e8f0; background: #0f172a; padding: 8px; border-radius: 6px;">
          <p style="font-weight: 600; margin: 0 0 4px 0;">${event.label}</p>
          <p style="color: #94a3b8; margin: 0; line-height: 1.4;">${event.description}</p>
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
