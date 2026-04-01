import type { MapEngineProps } from './MapEngine.types'
import { useMapLibre } from '@/hooks/useMapLibre'
import { useUIStore } from '@/store/useUIStore'
import { TerrainLayer } from './TerrainLayer'
import { UnitMarker } from './UnitMarker'
import { MovementArrowLayer } from './MovementArrowLayer'
import { MapControls } from './MapControls'
import { MapLegend } from './MapLegend'
import { MapScaleBar } from './MapScaleBar'
import { NorthArrow } from './NorthArrow'
import { wikiMapStyle, WIKI_COLOURS } from '@/utils/wikiMapStyle'
import { useEffect } from 'react'

const DEM_SOURCE       = 'terrain-dem'
const SAT_SOURCE       = 'esri-satellite'
const HILLSHADE_LAYER  = 'terrain-hillshade'
const SAT_LAYER        = 'satellite-layer'

export function MapEngine({ battle, currentPhase, previousPhase, nextPhase, terrain, showTerrain, onUnitClick, onMapReady }: MapEngineProps) {
  const setMapView = useUIStore((s) => s.setMapView)
  const is3D       = useUIStore((s) => s.is3D)
  const toggle3D   = useUIStore((s) => s.toggle3D)

  const { containerRef, mapRef, mapInstance, flyToBounds } = useMapLibre({
    style: wikiMapStyle,
    bounds: battle.map_bounds,
    onReady: (map) => {
      onMapReady?.(map)
      map.on('zoom',   () => setMapView({ mapZoom:    map.getZoom() }))
      map.on('rotate', () => setMapView({ mapBearing: map.getBearing() }))
      map.on('pitch',  () => setMapView({ mapPitch:   map.getPitch() }))
    },
  })

  // ── 2D / 3D toggle ────────────────────────────────────────────────────────
  useEffect(() => {
    const map = mapRef.current
    if (!map) return

    if (is3D) {
      // ── DEM source for terrain extrusion ────────────────────────────────
      if (!map.getSource(DEM_SOURCE)) {
        map.addSource(DEM_SOURCE, {
          type: 'raster-dem',
          tiles: ['https://s3.amazonaws.com/elevation-tiles-prod/terrarium/{z}/{x}/{y}.png'],
          tileSize: 256,
          maxzoom: 14,
          encoding: 'terrarium',
        })
      }

      // ── ESRI World Imagery — free satellite, no API key ──────────────────
      if (!map.getSource(SAT_SOURCE)) {
        map.addSource(SAT_SOURCE, {
          type: 'raster',
          tiles: ['https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}'],
          tileSize: 256,
          maxzoom: 19,
          attribution: 'Esri, Maxar, Earthstar Geographics',
        })
      }

      // Insert satellite layer just above background, beneath Carto
      if (!map.getLayer(SAT_LAYER)) {
        map.addLayer({ id: SAT_LAYER, type: 'raster', source: SAT_SOURCE,
          paint: { 'raster-opacity': 0 },
        }, 'carto-tiles')
        // Fade satellite in
        map.setPaintProperty(SAT_LAYER, 'raster-opacity-transition', { duration: 700, delay: 0 })
        map.setPaintProperty(SAT_LAYER, 'raster-opacity', 1)
      }

      // Hide the Carto street tiles — satellite is the base now
      map.setPaintProperty('carto-tiles', 'raster-opacity', 0)

      // ── Terrain extrusion ───────────────────────────────────────────────
      map.setTerrain({ source: DEM_SOURCE, exaggeration: 2.8 })

      // ── Hillshade — subtle, so satellite photo stays visible ─────────────
      if (!map.getLayer(HILLSHADE_LAYER)) {
        map.addLayer({
          id:     HILLSHADE_LAYER,
          type:   'hillshade',
          source: DEM_SOURCE,
          paint: {
            'hillshade-exaggeration':           0.35,
            'hillshade-shadow-color':           '#000000',
            'hillshade-highlight-color':        '#ffffff',
            'hillshade-accent-color':           '#000000',
            'hillshade-illumination-direction': 315,
            'hillshade-illumination-anchor':    'viewport',
          },
        })
      }

      // ── Sky ──────────────────────────────────────────────────────────────
      map.setSky({ 'sky-color': '#87ceeb', 'sky-horizon-blend': 0.5 } as Parameters<typeof map.setSky>[0])

      // ── Cinematic pitch + bearing ────────────────────────────────────────
      map.easeTo({ pitch: 65, bearing: -20, duration: 1000, easing: (t) => t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t })

    } else {
      // ── Teardown ─────────────────────────────────────────────────────────
      for (const layer of [HILLSHADE_LAYER, SAT_LAYER]) {
        if (map.getLayer(layer)) try { map.removeLayer(layer) } catch { /* */ }
      }

      // Restore Carto street map
      map.setPaintProperty('carto-tiles', 'raster-opacity', 1)

      map.setTerrain(null)
      map.setSky(null as unknown as Parameters<typeof map.setSky>[0])

      setTimeout(() => {
        const m = mapRef.current
        if (!m) return
        for (const src of [DEM_SOURCE, SAT_SOURCE]) {
          try { if (m.getSource(src)) m.removeSource(src) } catch { /* */ }
        }
      }, 250)

      map.easeTo({ pitch: 0, bearing: 0, duration: 700 })
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [is3D, mapInstance])

  // Fly to battle bounds when battle changes
  useEffect(() => {
    flyToBounds(battle.map_bounds)
  }, [battle.id, flyToBounds])

  // Build unit positions for the current phase
  const allPositions = currentPhase.unit_positions.flatMap((up) => {
    const faction = battle.factions.find((f) => f.id === up.faction_id)
    if (!faction) return []
    const unit = faction.units.find((u) => u.id === up.unit_id)
    return up.positions.map((pos) => ({
      unitId:     up.unit_id,
      factionId:  up.faction_id,
      unitType:   unit?.type ?? 'infantry_regiment',
      color:      faction.color,
      colorLight: faction.color_light,
      ...pos,
    }))
  })

  return (
    <div style={{ position: 'absolute', inset: 0 }}>
      {/* MapLibre canvas container */}
      <div ref={containerRef} style={{ position: 'absolute', inset: 0, background: WIKI_COLOURS.parchment }} />

      {/* Terrain layer (2D GeoJSON overlays) */}
      {mapInstance && terrain && showTerrain && (
        <TerrainLayer map={mapInstance} terrain={terrain} />
      )}

      {/* Movement arrows — hint where units will move in the next phase */}
      {mapInstance && (
        <MovementArrowLayer
          map={mapInstance}
          battle={battle}
          currentPhase={currentPhase}
          nextPhase={nextPhase}
        />
      )}

      {/* Unit markers — keyed by unitId+factionId so they persist across phases and lerp */}
      {mapInstance && allPositions.map((pos) => (
        <UnitMarker
          key={`${pos.unitId}-${pos.factionId}`}
          map={mapInstance}
          lat={pos.lat}
          lng={pos.lng}
          label={pos.location}
          unitType={pos.unitType}
          color={pos.color}
          posture={pos.posture}
          strengthPct={pos.strength_pct}
          isSelected={false}
          onClick={(anchor) => onUnitClick?.(pos.unitId, anchor)}
        />
      ))}

      {/* Map controls */}
      <MapControls
        onZoomIn={()       => mapRef.current?.zoomIn()}
        onZoomOut={()      => mapRef.current?.zoomOut()}
        onResetBearing={() => mapRef.current?.resetNorth()}
        onFitBounds={()    => flyToBounds(battle.map_bounds)}
        is3D={is3D}
        onToggle3D={toggle3D}
      />

      {/* Scale bar */}
      {mapInstance && <MapScaleBar map={mapInstance} />}

      {/* Map legend */}
      <MapLegend factions={battle.factions} />

      {/* North arrow */}
      <NorthArrow />
    </div>
  )
}
