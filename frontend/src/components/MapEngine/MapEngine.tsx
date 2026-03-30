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

export function MapEngine({ battle, currentPhase, previousPhase, terrain, showTerrain, onUnitClick, onMapReady }: MapEngineProps) {
  const setMapView = useUIStore((s) => s.setMapView)

  // mapInstance is React state — guaranteed non-null when set, triggers re-render
  const { containerRef, mapRef, mapInstance, flyToBounds } = useMapLibre({
    style: wikiMapStyle,
    bounds: battle.map_bounds,
    onReady: (map) => {
      onMapReady?.(map)
      map.on('zoom',   () => setMapView({ mapZoom:    map.getZoom() }))
      map.on('rotate', () => setMapView({ mapBearing: map.getBearing() }))
    },
  })

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

      {/* Terrain layer */}
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
      />

      {/* Scale bar — bottom-left, above timeline */}
      {mapInstance && <MapScaleBar map={mapInstance} />}

      {/* Map legend — bottom-left, beside scale bar */}
      <MapLegend factions={battle.factions} />

      {/* North arrow — bottom-left, above scale bar */}
      <NorthArrow />
    </div>
  )
}
