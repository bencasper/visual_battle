import { useEffect, useRef } from 'react'
import { useTimelineStore } from '@/store/useTimelineStore'

// Phase duration in ms at speed 1x
const PHASE_DURATION_MS = 3000

/**
 * Drives the timeline playback loop using requestAnimationFrame.
 * Advances phases based on elapsed time and current speed.
 */
export function useTimeline() {
  const { isPlaying, speed, advancePhase } = useTimelineStore()
  const lastTickRef = useRef<number | null>(null)
  const accumulatedRef = useRef<number>(0)
  const rafRef = useRef<number | null>(null)

  useEffect(() => {
    if (!isPlaying) {
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
      lastTickRef.current = null
      accumulatedRef.current = 0
      return
    }

    const tick = (now: number) => {
      if (lastTickRef.current !== null) {
        const delta = now - lastTickRef.current
        accumulatedRef.current += delta * speed

        if (accumulatedRef.current >= PHASE_DURATION_MS) {
          accumulatedRef.current = 0
          advancePhase()
        }
      }
      lastTickRef.current = now
      rafRef.current = requestAnimationFrame(tick)
    }

    rafRef.current = requestAnimationFrame(tick)
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
    }
  }, [isPlaying, speed, advancePhase])
}
