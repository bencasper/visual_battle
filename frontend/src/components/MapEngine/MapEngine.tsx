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

const DEM_SOURCE      = 'terrain-dem'
const HILLSHADE_LAYER = 'terrain-hillshade'

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

      // Enable terrain extrusion — higher exaggeration makes mountains clearly visible
      map.setTerrain({ source: DEM_SOURCE, exaggeration: 2.5 })

      // Fade the base raster so the hillshade can show through it
      map.setPaintProperty('carto-tiles', 'raster-opacity', 0.55)

      // Hillshade ON TOP of the raster tiles — this is what makes relief visible
      if (!map.getLayer(HILLSHADE_LAYER)) {
        map.addLayer({
          id:     HILLSHADE_LAYER,
          type:   'hillshade',
          source: DEM_SOURCE,
          paint: {
            'hillshade-exaggeration':        0.75,
            'hillshade-shadow-color':        '#2a1a08',
            'hillshade-highlight-color':     '#fffaf0',
            'hillshade-accent-color':        '#6b5030',
            'hillshade-illumination-direction': 315,
            'hillshade-illumination-anchor': 'viewport',
          },
        })  // no second arg = appended on top of all current layers
      }

      // Steep pitch + bearing for dramatic mountain perspective
      map.easeTo({ pitch: 62, bearing: -20, duration: 800 })

    } else {
      // Remove hillshade
      if (map.getLayer(HILLSHADE_LAYER)) {
        try { map.removeLayer(HILLSHADE_LAYER) } catch { /* */ }
      }

      // Restore full raster opacity
      map.setPaintProperty('carto-tiles', 'raster-opacity', 1)

      // Disable terrain
      map.setTerrain(null)

      // Remove DEM source after a tick
      setTimeout(() => {
        try { if (mapRef.current?.getSource(DEM_SOURCE)) mapRef.current.removeSource(DEM_SOURCE) } catch { /* */ }
      }, 200)

      // Return to flat 2D
      map.easeTo({ pitch: 0, bearing: 0, duration: 600 })
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

      {/* Unit markers — keyed by unitId+location so they remount on phase change */}
      {mapInstance && allPositions.map((pos, i) => (
        <UnitMarker
          key={`${pos.unitId}-${pos.location}-${i}`}
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
