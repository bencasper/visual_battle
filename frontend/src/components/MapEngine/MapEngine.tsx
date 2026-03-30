import type { MapEngineProps } from './MapEngine.types'
import { useMapLibre } from '@/hooks/useMapLibre'
import { useUIStore } from '@/store/useUIStore'
import { TerrainLayer } from './TerrainLayer'
import { UnitMarker } from './UnitMarker'
import { MapControls } from './MapControls'
import { wikiMapStyle, WIKI_COLOURS } from '@/utils/wikiMapStyle'
import { useEffect } from 'react'

export function MapEngine({ battle, currentPhase, terrain, showTerrain, onUnitClick, onMapReady }: MapEngineProps) {
  const setMapView = useUIStore((s) => s.setMapView)

  const { containerRef, mapRef, mapReady, flyToBounds } = useMapLibre({
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
    <div style={{ position: 'absolute', inset: 0, overflow: 'hidden' }}>
      {/* MapLibre canvas */}
      <div ref={containerRef} style={{ position: 'absolute', inset: 0, background: WIKI_COLOURS.parchment }} />

      {/* Terrain layer — only after map is ready */}
      {mapReady && terrain && showTerrain && mapRef.current && (
        <TerrainLayer map={mapRef.current} terrain={terrain} />
      )}

      {/* Unit markers — only after map is ready */}
      {mapReady && mapRef.current && allPositions.map((pos, i) => (
        <UnitMarker
          key={`${pos.unitId}-${pos.location}-${i}`}
          map={mapRef.current!}
          lat={pos.lat}
          lng={pos.lng}
          label={pos.location}
          unitType={pos.unitType}
          color={pos.color}
          colorLight={pos.colorLight}
          posture={pos.posture}
          strengthPct={pos.strength_pct}
          onClick={() => onUnitClick?.(pos.unitId)}
        />
      ))}

      {/* Map controls */}
      <MapControls
        onZoomIn={()       => mapRef.current?.zoomIn()}
        onZoomOut={()      => mapRef.current?.zoomOut()}
        onResetBearing={() => mapRef.current?.resetNorth()}
        onFitBounds={()    => flyToBounds(battle.map_bounds)}
      />
    </div>
  )
}
