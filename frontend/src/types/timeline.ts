export type PlaybackSpeed = 1 | 2 | 4

export type PlaybackStatus = 'idle' | 'playing' | 'paused' | 'ended'

export interface TimelineState {
  currentPhaseIndex: number
  totalPhases: number
  isPlaying: boolean
  speed: PlaybackSpeed
  status: PlaybackStatus
  loop: boolean
}

export interface TimelineEvent {
  phaseIndex: number
  type: 'phase_enter' | 'phase_exit' | 'playback_start' | 'playback_pause' | 'playback_end'
  timestamp: number
}

export interface PhaseTransition {
  fromIndex: number
  toIndex: number
  direction: 'forward' | 'backward' | 'seek'
}
