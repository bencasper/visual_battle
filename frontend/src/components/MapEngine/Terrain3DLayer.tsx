// Terrain3DLayer — enables MapLibre GL's 3D terrain extrusion when is3D is true.
// Uses AWS Open Data Terrain Tiles (terrarium encoding, no API key required).

import { useEffect, useRef } from 'react'
import type { Map as MapLibreMap } from 'maplibre-gl'

const DEM_SOURCE = 'terrain-dem'

interface Terrain3DLayerProps {
  map: MapLibreMap
  is3D: boolean
}

export function Terrain3DLayer({ map, is3D }: Terrain3DLayerProps) {
  // Track whether we've actually activated 3D so we only clean up when needed
  const activated = useRef(false)

  useEffect(() => {
    if (!map) return

    if (is3D) {
      activated.current = true

      // Add DEM source
      if (!map.getSource(DEM_SOURCE)) {
        map.addSource(DEM_SOURCE, {
          type: 'raster-dem',
          tiles: ['https://s3.amazonaws.com/elevation-tiles-prod/terrarium/{z}/{x}/{y}.png'],
          tileSize: 256,
          maxzoom: 14,
          encoding: 'terrarium',
        })
      }

      // Enable terrain extrusion
      map.setTerrain({ source: DEM_SOURCE, exaggeration: 1.8 })

      // Tilt to perspective view
      map.easeTo({ pitch: 55, bearing: -15, duration: 800 })

    } else if (activated.current) {
      // Only run teardown if we actually enabled 3D before
      activated.current = false

      // Disable terrain first
      map.setTerrain(null)

      // Remove DEM source after a tick
      setTimeout(() => {
        try {
          if (map.getSource(DEM_SOURCE)) map.removeSource(DEM_SOURCE)
        } catch { /* map may be mid-destroy */ }
      }, 200)

      // Return to flat 2D
      map.easeTo({ pitch: 0, bearing: 0, duration: 600 })
    }
  }, [map, is3D])

  return null
}
