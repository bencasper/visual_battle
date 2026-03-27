// FrontlineLayer — renders a visual dividing line between opposing forces
import { useEffect } from 'react'
import type { Map as MapLibreMap } from 'maplibre-gl'
import type { Phase } from '@/types/battle'

interface FrontlineLayerProps {
  map: MapLibreMap
  phase: Phase
  unColor: string
  pvaColor: string
}

const SOURCE_ID = 'frontline-source'
const LAYER_ID = 'frontline-layer'

export function FrontlineLayer({ map, phase, unColor, pvaColor }: FrontlineLayerProps) {
  useEffect(() => {
    if (!map.isStyleLoaded()) return

    // Derive a simple frontline from the average lat of opposing unit positions
    const unPositions = phase.unit_positions
      .filter((up) => up.faction_id === 'un-x-corps')
      .flatMap((up) => up.positions)
    const pvaPositions = phase.unit_positions
      .filter((up) => up.faction_id === 'pva-9th-army')
      .flatMap((up) => up.positions)

    if (!unPositions.length || !pvaPositions.length) return

    const avgUnLat = unPositions.reduce((s, p) => s + p.lat, 0) / unPositions.length
    const avgPvaLat = pvaPositions.reduce((s, p) => s + p.lat, 0) / pvaPositions.length
    const frontLat = (avgUnLat + avgPvaLat) / 2

    const geojson: GeoJSON.FeatureCollection = {
      type: 'FeatureCollection',
      features: [{
        type: 'Feature',
        properties: {},
        geometry: {
          type: 'LineString',
          coordinates: [[126.8, frontLat], [127.8, frontLat]],
        },
      }],
    }

    if (map.getSource(SOURCE_ID)) {
      (map.getSource(SOURCE_ID) as maplibregl.GeoJSONSource).setData(geojson)
    } else {
      map.addSource(SOURCE_ID, { type: 'geojson', data: geojson })
      map.addLayer({
        id: LAYER_ID,
        type: 'line',
        source: SOURCE_ID,
        paint: {
          'line-color': '#f59e0b',
          'line-width': 2,
          'line-dasharray': [4, 3],
          'line-opacity': 0.7,
        },
      })
    }

    return () => {
      if (map.getLayer(LAYER_ID)) map.removeLayer(LAYER_ID)
      if (map.getSource(SOURCE_ID)) map.removeSource(SOURCE_ID)
    }
  }, [map, phase])

  return null
}

import maplibregl from 'maplibre-gl'
import type GeoJSON from 'geojson'
