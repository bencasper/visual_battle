import { useEffect, useRef, useId } from 'react'
import maplibregl from 'maplibre-gl'
import type { MapEngineProps } from './MapEngine.types'
import { useMapLibre } from '@/hooks/useMapLibre'
import { useUIStore } from '@/store/useUIStore'
import { boundsToMapLibre } from '@/utils/geoUtils'
import { factionColor } from '@/utils/colorUtils'
import { TerrainLayer } from './TerrainLayer'
import { UnitMarker } from './UnitMarker'
import { MapControls } from './MapControls'

const MAP_STYLE = import.meta.env.VITE_MAP_STYLE ?? 'https://demotiles.maplibre.org/style.json'

export function MapEngine({ battle, currentPhase, terrain, showTerrain, onUnitClick, onMapReady }: MapEngineProps) {
  const containerId = useId()
  const setMapView = useUIStore((s) => s.setMapView)

  const { mapRef, flyToBounds } = useMapLibre({
    containerId,
    styleUrl: MAP_STYLE,
    bounds: battle.map_bounds,
    onReady: (map) => {
      onMapReady?.(map)
      map.on('zoom', () => setMapView({ mapZoom: map.getZoom() }))
      map.on('rotate', () => setMapView({ mapBearing: map.getBearing() }))
    },
  })

  // Fly to battle bounds whenever the battle changes
  useEffect(() => {
    flyToBounds(battle.map_bounds)
  }, [battle.id, flyToBounds])

  // Build unit position features for the current phase
  const allPositions = currentPhase.unit_positions.flatMap((up) => {
    const faction = battle.factions.find((f) => f.id === up.faction_id)
    if (!faction) return []
    return up.positions.map((pos) => ({
      unitId: up.unit_id,
      factionId: up.faction_id,
      color: faction.color,
      colorLight: faction.color_light,
      ...pos,
    }))
  })

  return (
    <div className="relative w-full h-full">
      {/* MapLibre container */}
      <div id={containerId} className="w-full h-full" />

      {/* Terrain layer (rendered via MapLibre source/layer) */}
      {terrain && showTerrain && mapRef.current && (
        <TerrainLayer map={mapRef.current} terrain={terrain} />
      )}

      {/* Unit markers */}
      {mapRef.current && allPositions.map((pos, i) => (
        <UnitMarker
          key={`${pos.unitId}-${pos.location}-${i}`}
          map={mapRef.current!}
          lat={pos.lat}
          lng={pos.lng}
          label={pos.location}
          color={pos.color}
          colorLight={pos.colorLight}
          posture={pos.posture}
          strengthPct={pos.strength_pct}
          onClick={() => onUnitClick?.(pos.unitId)}
        />
      ))}

      {/* Map controls overlay */}
      <MapControls
        onZoomIn={() => mapRef.current?.zoomIn()}
        onZoomOut={() => mapRef.current?.zoomOut()}
        onResetBearing={() => mapRef.current?.resetNorth()}
        onFitBounds={() => flyToBounds(battle.map_bounds)}
      />
    </div>
  )
}
