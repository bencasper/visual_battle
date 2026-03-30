import { useRef, useCallback } from 'react'
import { useParams } from 'react-router-dom'
import type { Map as MapLibreMap } from 'maplibre-gl'
import { useBattleData } from '@/hooks/useBattleData'
import { useTimelineStore } from '@/store/useTimelineStore'
import { useUIStore } from '@/store/useUIStore'
import { MapEngine } from '@/components/MapEngine/MapEngine'
import { Timeline } from '@/components/Timeline/Timeline'
import { LoadingSpinner } from '@/components/shared/LoadingSpinner'
import { ErrorBoundary } from '@/components/shared/ErrorBoundary'

const DEFAULT_BATTLE_ID = 'chosin-reservoir-1950'

export function BattleView() {
  const { battleId = DEFAULT_BATTLE_ID } = useParams<{ battleId: string }>()
  const { battle, terrain, loading, error } = useBattleData(battleId)

  const { currentPhaseIndex, isPlaying, speed, play, pause, stepForward, stepBack, seekToPhase, setSpeed } = useTimelineStore()
  const { showTerrain } = useUIStore()

  const mapRef = useRef<MapLibreMap | null>(null)
  const handleMapReady = useCallback((map: MapLibreMap) => { mapRef.current = map }, [])

  if (loading) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-wiki-parchment">
        <LoadingSpinner size="lg" label="Loading battle data…" />
      </div>
    )
  }

  if (error || !battle) {
    return (
      <div className="w-full h-full flex items-center justify-center text-pva text-sm bg-wiki-parchment">
        {error ?? 'Battle not found'}
      </div>
    )
  }

  const currentPhase = battle.phases[currentPhaseIndex]

  return (
    <div style={{ position: 'fixed', inset: 0, overflow: 'hidden' }}>
      {/* ── MAP ENGINE (full viewport) ── */}
      <ErrorBoundary>
        <MapEngine
          battle={battle}
          currentPhase={currentPhase}
          terrain={terrain}
          showTerrain={showTerrain}
          onMapReady={handleMapReady}
        />
      </ErrorBoundary>

      {/* ── Title chip (top-left) ── */}
      <div className="absolute top-3 left-3 z-20">
        <div className="glass-panel px-3 py-1.5 shadow-md">
          <p className="text-[9px] uppercase tracking-widest text-wiki-textMuted font-semibold">{battle.theater}</p>
          <p className="text-sm font-bold text-wiki-text" style={{ fontFamily: '"Linux Libertine", Georgia, serif' }}>
            {battle.name}
          </p>
        </div>
      </div>

      {/* ── TIMELINE (bottom dock) ── */}
      <Timeline
        phases={battle.phases}
        currentIndex={currentPhaseIndex}
        isPlaying={isPlaying}
        speed={speed}
        onSeek={seekToPhase}
        onPlayPause={isPlaying ? pause : play}
        onStepForward={stepForward}
        onStepBack={stepBack}
        onSpeedChange={setSpeed}
      />
    </div>
  )
}
