import type { Phase } from '@/types/battle'

export interface TimelineProps {
  phases: Phase[]
  currentIndex: number
  isPlaying: boolean
  onSeek: (index: number) => void
  onPlayPause: () => void
  onStepForward: () => void
  onStepBack: () => void
  onSpeedChange: (speed: 1 | 2 | 4) => void
  speed: 1 | 2 | 4
}

export interface PhaseMarkerProps {
  phase: Phase
  index: number
  total: number
  isCurrent: boolean
  onClick: () => void
}

export interface PlaybackControlsProps {
  isPlaying: boolean
  speed: 1 | 2 | 4
  canStepBack: boolean
  canStepForward: boolean
  onPlay: () => void
  onPause: () => void
  onStepBack: () => void
  onStepForward: () => void
  onSpeedChange: (speed: 1 | 2 | 4) => void
}
