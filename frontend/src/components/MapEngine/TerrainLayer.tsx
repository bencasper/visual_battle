import { useEffect } from 'react'
import type { Map as MapLibreMap } from 'maplibre-gl'
import type { TerrainCollection } from '@/types/geojson'

interface TerrainLayerProps {
  map: MapLibreMap
  terrain: TerrainCollection
}

const SOURCE_ID = 'terrain-source'
const FILL_LAYER_ID = 'terrain-fill'
const LINE_LAYER_ID = 'terrain-line'

export function TerrainLayer({ map, terrain }: TerrainLayerProps) {
  useEffect(() => {
    if (!map.isStyleLoaded()) return

    // Add or update source
    if (map.getSource(SOURCE_ID)) {
      (map.getSource(SOURCE_ID) as maplibregl.GeoJSONSource).setData(terrain)
    } else {
      map.addSource(SOURCE_ID, { type: 'geojson', data: terrain })
    }

    // Fill layer for polygon terrain (water, forests)
    if (!map.getLayer(FILL_LAYER_ID)) {
      map.addLayer({
        id: FILL_LAYER_ID,
        type: 'fill',
        source: SOURCE_ID,
        filter: ['in', '$type', 'Polygon'],
        paint: {
          'fill-color': [
            'match', ['get', 'type'],
            'reservoir', '#3b82f6',
            'lake', '#60a5fa',
            'forest', '#166534',
            '#94a3b8',
          ],
          'fill-opacity': 0.45,
        },
      })
    }

    // Line layer for roads, ridges, rivers
    if (!map.getLayer(LINE_LAYER_ID)) {
      map.addLayer({
        id: LINE_LAYER_ID,
        type: 'line',
        source: SOURCE_ID,
        filter: ['in', '$type', 'LineString'],
        paint: {
          'line-color': [
            'match', ['get', 'type'],
            'road', '#d4c5a9',
            'ridge', '#78716c',
            'river', '#3b82f6',
            'pass', '#f59e0b',
            '#94a3b8',
          ],
          'line-width': [
            'match', ['get', 'type'],
            'road', 3,
            'pass', 4,
            1.5,
          ],
          'line-dasharray': [
            'match', ['get', 'type'],
            'ridge', ['literal', [2, 2]],
            ['literal', [1]],
          ],
        },
      })
    }

    return () => {
      if (map.getLayer(FILL_LAYER_ID)) map.removeLayer(FILL_LAYER_ID)
      if (map.getLayer(LINE_LAYER_ID)) map.removeLayer(LINE_LAYER_ID)
      if (map.getSource(SOURCE_ID)) map.removeSource(SOURCE_ID)
    }
  }, [map, terrain])

  return null
}

// Need this import for the cast above
import maplibregl from 'maplibre-gl'
