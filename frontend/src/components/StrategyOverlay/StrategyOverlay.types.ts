import type { Phase } from '@/types/battle'
import type { Map as MapLibreMap } from 'maplibre-gl'

export interface StrategyOverlayProps {
  phase: Phase
  mapRef: React.RefObject<MapLibreMap | null>
  visible: boolean
}

export interface AnnotationPinProps {
  event: Phase['events'][number]
  onClick?: () => void
}

export interface ManeuverArrowProps {
  fromLat: number
  fromLng: number
  toLat: number
  toLng: number
  color: string
  label?: string
}
