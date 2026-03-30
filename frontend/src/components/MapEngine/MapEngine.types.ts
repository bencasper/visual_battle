import type { Map as MapLibreMap } from 'maplibre-gl'
import type { Battle, Phase } from '@/types/battle'

export interface MapEngineProps {
  battle: Battle
  currentPhase: Phase
  previousPhase: Phase | null
  terrain: object | null
  showTerrain: boolean
  onUnitClick?: (unitId: string, anchor: { x: number; y: number }) => void
  onMapReady?: (map: MapLibreMap) => void
}
