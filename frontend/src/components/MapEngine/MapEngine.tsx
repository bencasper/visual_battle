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

const DEM_SOURCE = 'terrain-dem'

export function MapEngine({ battle, currentPhase, previousPhase, terrain, showTerrain, onUnitClick, onMapReady }: MapEngineProps) {
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
    console.log('[3D] effect fired, is3D=', is3D, 'map=', !!map)
    if (!map) return

    if (is3D) {
      console.log('[3D] enabling terrain')
      if (!map.getSource(DEM_SOURCE)) {
        map.addSource(DEM_SOURCE, {
          type: 'raster-dem',
          tiles: ['https://s3.amazonaws.com/elevation-tiles-prod/terrarium/{z}/{x}/{y}.png'],
          tileSize: 256,
          maxzoom: 14,
          encoding: 'terrarium',
        })
      }
      map.setTerrain({ source: DEM_SOURCE, exaggeration: 1.8 })
      map.easeTo({ pitch: 55, bearing: -15, duration: 800 })
    } else {
      console.log('[3D] disabling terrain')
      map.setTerrain(null)
      setTimeout(() => {
        try { if (mapRef.current?.getSource(DEM_SOURCE)) mapRef.current.removeSource(DEM_SOURCE) } catch { /* */ }
      }, 200)
      map.easeTo({ pitch: 0, bearing: 0, duration: 600 })
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [is3D, mapInstance])  // mapInstance triggers re-run once map is ready  // deliberately only depend on is3D — mapRef is a stable ref

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

      {/* Movement arrows — from previous phase positions to current */}
      {mapInstance && (
        <MovementArrowLayer
          map={mapInstance}
          battle={battle}
          currentPhase={currentPhase}
          previousPhase={previousPhase}
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
