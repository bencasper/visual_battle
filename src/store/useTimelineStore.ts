import { create } from 'zustand'
import type { PlaybackSpeed, PlaybackStatus } from '@/types/timeline'

interface TimelineState {
  currentPhaseIndex: number
  totalPhases: number
  isPlaying: boolean
  speed: PlaybackSpeed
  status: PlaybackStatus
  loop: boolean
}

interface TimelineActions {
  setTotalPhases: (n: number) => void
  play: () => void
  pause: () => void
  stop: () => void
  stepForward: () => void
  stepBack: () => void
  seekToPhase: (index: number) => void
  setSpeed: (speed: PlaybackSpeed) => void
  toggleLoop: () => void
  advancePhase: () => void // called by the rAF loop in useTimeline
}

export const useTimelineStore = create<TimelineState & TimelineActions>((set, get) => ({
  currentPhaseIndex: 0,
  totalPhases: 0,
  isPlaying: false,
  speed: 1,
  status: 'idle',
  loop: false,

  setTotalPhases: (n) => set({ totalPhases: n }),

  play: () => {
    const { status, currentPhaseIndex, totalPhases } = get()
    if (currentPhaseIndex >= totalPhases - 1 && !get().loop) return
    set({ isPlaying: true, status: 'playing' })
  },

  pause: () => set({ isPlaying: false, status: 'paused' }),

  stop: () => set({ isPlaying: false, status: 'idle', currentPhaseIndex: 0 }),

  stepForward: () => {
    const { currentPhaseIndex, totalPhases } = get()
    if (currentPhaseIndex < totalPhases - 1) {
      set({ currentPhaseIndex: currentPhaseIndex + 1, status: 'paused' })
    }
  },

  stepBack: () => {
    const { currentPhaseIndex } = get()
    if (currentPhaseIndex > 0) {
      set({ currentPhaseIndex: currentPhaseIndex - 1, status: 'paused' })
    }
  },

  seekToPhase: (index) => {
    const { totalPhases } = get()
    const clamped = Math.max(0, Math.min(index, totalPhases - 1))
    set({ currentPhaseIndex: clamped, isPlaying: false, status: 'paused' })
  },

  setSpeed: (speed) => set({ speed }),

  toggleLoop: () => set((s) => ({ loop: !s.loop })),

  advancePhase: () => {
    const { currentPhaseIndex, totalPhases, loop } = get()
    if (currentPhaseIndex < totalPhases - 1) {
      set({ currentPhaseIndex: currentPhaseIndex + 1 })
    } else if (loop) {
      set({ currentPhaseIndex: 0 })
    } else {
      set({ isPlaying: false, status: 'ended' })
    }
  },
}))
