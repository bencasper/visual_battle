import type { Map as MapLibreMap } from 'maplibre-gl'
import type { Battle, Phase } from '@/types/battle'
import type { TerrainCollection } from '@/types/geojson'

export interface MapEngineProps {
  battle: Battle
  currentPhase: Phase
  terrain: TerrainCollection | null
  showTerrain: boolean
  onUnitClick?: (unitId: string) => void
  onMapReady?: (map: MapLibreMap) => void
}
