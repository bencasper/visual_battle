import { useEffect } from 'react'
import type { Map as MapLibreMap } from 'maplibre-gl'
import type * as GeoJSON from 'geojson'
import { WIKI_COLOURS } from '@/utils/wikiMapStyle'

interface TerrainLayerProps {
  map: MapLibreMap
  /** GeoJSON data as a plain object — will be stringified for MapLibre worker */
  terrain: object
}

const SOURCE_ID      = 'terrain-source'
const FILL_LAYER_ID  = 'terrain-fill'
const LINE_LAYER_ID  = 'terrain-line'
const RIDGE_LAYER_ID = 'terrain-ridge'
const PT_LAYER_ID    = 'terrain-points'
const LBL_LAYER_ID   = 'terrain-labels'

export function TerrainLayer({ map, terrain }: TerrainLayerProps) {
  useEffect(() => {
    if (!map || !map.isStyleLoaded()) return

    // Pass the GeoJSON object directly — MapLibre serialises it via postMessage
    // to the worker, where it is parsed correctly.
    // (Passing a string also fails: MapLibre treats any string data value as a URL
    //  and tries to fetch it, producing a 404 for the stringified JSON.)
    if (map.getSource(SOURCE_ID)) {
      // Source already exists — nothing to do
    } else {
      map.addSource(SOURCE_ID, { type: 'geojson', data: terrain as GeoJSON.FeatureCollection })
    }

    // ── Fill layer — water + forest polygons ──────────────────────────
    if (!map.getLayer(FILL_LAYER_ID)) {
      map.addLayer({
        id:     FILL_LAYER_ID,
        type:   'fill',
        source: SOURCE_ID,
        filter: ['==', ['geometry-type'], 'Polygon'],
        paint: {
          'fill-color': [
            'match', ['get', 'type'],
            'reservoir', WIKI_COLOURS.water,
            'lake',      WIKI_COLOURS.water,
            'forest',    WIKI_COLOURS.forest,
            'marsh',     '#c8ddb0',
            WIKI_COLOURS.hillShade,
          ],
          'fill-opacity': 0.72,
          'fill-outline-color': [
            'match', ['get', 'type'],
            'reservoir', WIKI_COLOURS.waterDk,
            'lake',      WIKI_COLOURS.waterDk,
            'forest',    '#7aaa6e',
            'rgba(0,0,0,0)',
          ],
        },
      })
    }

    // ── Line layer — roads, rivers, passes (solid) ───────────────────
    if (!map.getLayer(LINE_LAYER_ID)) {
      map.addLayer({
        id:     LINE_LAYER_ID,
        type:   'line',
        source: SOURCE_ID,
        filter: ['all',
          ['==', ['geometry-type'], 'LineString'],
          ['!=', ['get', 'type'], 'ridge'],
        ],
        paint: {
          'line-color': [
            'match', ['get', 'type'],
            'road',  WIKI_COLOURS.road,
            'pass',  WIKI_COLOURS.road,
            'river', WIKI_COLOURS.water,
            '#999',
          ],
          'line-width': [
            'match', ['get', 'type'],
            'road',  3,
            'pass',  3,
            'river', 2,
            1.5,
          ],
          'line-opacity': 0.9,
        },
      })
    }

    // ── Ridge layer — dashed (static dasharray — data expressions not allowed) ──
    if (!map.getLayer(RIDGE_LAYER_ID)) {
      map.addLayer({
        id:     RIDGE_LAYER_ID,
        type:   'line',
        source: SOURCE_ID,
        filter: ['all',
          ['==', ['geometry-type'], 'LineString'],
          ['==', ['get', 'type'], 'ridge'],
        ],
        paint: {
          'line-color':     WIKI_COLOURS.mountain,
          'line-width':     2,
          'line-dasharray': [3, 2],
          'line-opacity':   0.7,
        },
      })
    }

    // ── Point layer — settlement dots ─────────────────────────────────
    if (!map.getLayer(PT_LAYER_ID)) {
      map.addLayer({
        id:     PT_LAYER_ID,
        type:   'circle',
        source: SOURCE_ID,
        filter: ['==', ['geometry-type'], 'Point'],
        paint: {
          'circle-radius': [
            'match', ['get', 'strategic_value'],
            'critical', 5,
            'high',     4,
            3,
          ],
          'circle-color': '#ffffff',
          'circle-stroke-color': '#000000',
          'circle-stroke-width': 1.5,
        },
      })
    }

    // ── Label layer — settlement names ────────────────────────────────
    // Note: symbol layers require glyphs to be configured in the map style.
    // Disabled until glyph CDN is confirmed working to avoid triggering
    // tile-load errors on the label source.
    /*
    if (!map.getLayer(LBL_LAYER_ID)) {
      map.addLayer({
        id:     LBL_LAYER_ID,
        type:   'symbol',
        source: SOURCE_ID,
        filter: ['==', ['geometry-type'], 'Point'],
        layout: {
          'text-field':     ['get', 'name'],
          'text-size':      11,
          'text-font':      ['Open Sans Bold', 'Arial Unicode MS Regular'],
          'text-anchor':    'top',
          'text-offset':    [0, 0.6],
          'text-max-width': 8,
        },
        paint: {
          'text-color':      '#000000',
          'text-halo-color': WIKI_COLOURS.parchment,
          'text-halo-width': 1.5,
          'text-halo-blur':  0.5,
        },
      })
    }
    */

    return () => {
      for (const id of [PT_LAYER_ID, RIDGE_LAYER_ID, LINE_LAYER_ID, FILL_LAYER_ID]) {
        if (map.getLayer(id))  map.removeLayer(id)
      }
      if (map.getSource(SOURCE_ID)) map.removeSource(SOURCE_ID)
    }
  }, [map, terrain])

  return null
}
