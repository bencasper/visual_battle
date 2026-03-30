import type { Map as MapLibreMap } from 'maplibre-gl'
import type { Battle, Phase } from '@/types/battle'

export interface MapEngineProps {
  battle: Battle
  currentPhase: Phase
  terrain: object | null
  showTerrain: boolean
  onUnitClick?: (unitId: string) => void
  onMapReady?: (map: MapLibreMap) => void
}
