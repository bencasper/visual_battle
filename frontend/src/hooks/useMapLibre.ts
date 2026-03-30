import { useRef, useEffect, useCallback, useState } from 'react'
import maplibregl, { Map as MapLibreMap } from 'maplibre-gl'
import type { StyleSpecification } from 'maplibre-gl'
import type { MapBounds } from '@/types/battle'
import { boundsToMapLibre } from '@/utils/geoUtils'

interface UseMapLibreOptions {
  style: string | StyleSpecification
  bounds: MapBounds
  onReady?: (map: MapLibreMap) => void
}

export function useMapLibre({ style, bounds, onReady }: UseMapLibreOptions) {
  const containerRef = useRef<HTMLDivElement | null>(null)
  const mapRef       = useRef<MapLibreMap | null>(null)
  // Store map in STATE so components re-render with the real instance
  const [mapInstance, setMapInstance] = useState<MapLibreMap | null>(null)

  useEffect(() => {
    let active = true
    let map: MapLibreMap | null = null

    const timer = requestAnimationFrame(() => {
      const container = containerRef.current
      if (!container || !active) return

      map = new maplibregl.Map({
        container,
        style: style as string | StyleSpecification,
        bounds: boundsToMapLibre(bounds),
        fitBoundsOptions: { padding: { top: 80, bottom: 180, left: 80, right: 80 } },
        attributionControl: false,
        maxPitch: 85,
        antialias: true,
      })

      map.on('load', () => {
        if (!active) return
        mapRef.current = map
        map!.resize()
        setMapInstance(map)   // ← state update — triggers re-render with real map
        onReady?.(map!)
      })

      map.on('error', (e) => {
        console.error('[MapLibre] error:', e.error?.message ?? e)
      })
    })

    const onResize = () => mapRef.current?.resize()
    window.addEventListener('resize', onResize)

    return () => {
      active = false
      cancelAnimationFrame(timer)
      window.removeEventListener('resize', onResize)
      if (map) {
        map.remove()
        map = null
      }
      mapRef.current = null
      setMapInstance(null)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [style])

  const flyToBounds = useCallback((b: MapBounds) => {
    mapRef.current?.fitBounds(boundsToMapLibre(b), { padding: { top: 80, bottom: 180, left: 80, right: 80 }, duration: 1200 })
  }, [])

  return { containerRef, mapRef, mapInstance, flyToBounds }
}
