import { useRef, useEffect, useCallback } from 'react'
import maplibregl, { Map as MapLibreMap } from 'maplibre-gl'
import type { MapBounds } from '@/types/battle'
import { boundsToMapLibre } from '@/utils/geoUtils'

interface UseMapLibreOptions {
  containerId: string
  styleUrl: string
  bounds: MapBounds
  onReady?: (map: MapLibreMap) => void
}

/**
 * Manages a MapLibre GL instance lifecycle.
 * Returns a stable ref to the map instance.
 */
export function useMapLibre({ containerId, styleUrl, bounds, onReady }: UseMapLibreOptions) {
  const mapRef = useRef<MapLibreMap | null>(null)

  useEffect(() => {
    if (mapRef.current) return // already initialized

    const map = new maplibregl.Map({
      container: containerId,
      style: styleUrl,
      bounds: boundsToMapLibre(bounds),
      fitBoundsOptions: { padding: 60 },
      attributionControl: false,
    })

    map.on('load', () => {
      mapRef.current = map
      onReady?.(map)
    })

    return () => {
      map.remove()
      mapRef.current = null
    }
  // Only run on mount/unmount
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const flyToBounds = useCallback((b: MapBounds) => {
    mapRef.current?.fitBounds(boundsToMapLibre(b), { padding: 60, duration: 1200 })
  }, [])

  return { mapRef, flyToBounds }
}
