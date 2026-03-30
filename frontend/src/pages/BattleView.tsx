import { useRef, useCallback } from 'react'
import { useParams } from 'react-router-dom'
import { AnimatePresence } from 'framer-motion'
import type { Map as MapLibreMap } from 'maplibre-gl'
import { useBattleData } from '@/hooks/useBattleData'
import { useTimelineStore } from '@/store/useTimelineStore'
import { useUIStore } from '@/store/useUIStore'
import { MapEngine } from '@/components/MapEngine/MapEngine'
import { UnitDrawer } from '@/components/MapEngine/UnitDrawer'
import { Timeline } from '@/components/Timeline/Timeline'
import { ArmyPanel } from '@/components/ArmyPanel/ArmyPanel'
import { LoadingSpinner } from '@/components/shared/LoadingSpinner'
import { ErrorBoundary } from '@/components/shared/ErrorBoundary'

const DEFAULT_BATTLE_ID = 'chosin-reservoir-1950'

export function BattleView() {
  const { battleId = DEFAULT_BATTLE_ID } = useParams<{ battleId: string }>()
  const { battle, terrain, loading, error } = useBattleData(battleId)

  const { currentPhaseIndex, isPlaying, speed, play, pause, stepForward, stepBack, seekToPhase, setSpeed } = useTimelineStore()
  const { showTerrain, selectedFactionId, selectFaction, selectedUnitId, selectedUnitAnchor, selectUnit } = useUIStore()

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

  const currentPhase  = battle.phases[currentPhaseIndex]
  const previousPhase = currentPhaseIndex > 0 ? battle.phases[currentPhaseIndex - 1] : null
  const nextPhase     = currentPhaseIndex < battle.phases.length - 1 ? battle.phases[currentPhaseIndex + 1] : null

  // Resolve selected unit + its current phase position data
  const selectedUnit = selectedUnitId
    ? battle.factions.flatMap((f) => f.units).find((u) => u.id === selectedUnitId) ?? null
    : null
  const selectedFaction = selectedUnit
    ? battle.factions.find((f) => f.units.some((u) => u.id === selectedUnit.id)) ?? null
    : null
  const selectedPosition = selectedUnitId
    ? currentPhase.unit_positions.find((up) => up.unit_id === selectedUnitId)?.positions[0] ?? null
    : null

  return (
    <div style={{ position: 'fixed', inset: 0, overflow: 'hidden' }}>
      {/* ── MAP ENGINE (full viewport) ── */}
      <ErrorBoundary>
        <MapEngine
          battle={battle}
          currentPhase={currentPhase}
          previousPhase={previousPhase}
          nextPhase={nextPhase}
          terrain={terrain}
          showTerrain={showTerrain}
          onUnitClick={(id, anchor) => selectUnit(selectedUnitId === id ? null : id, anchor)}
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

      {/* ── ARMY PANEL (right side, scrollable) ── */}
      <div className="absolute top-3 right-3 bottom-24 z-20 flex flex-col" style={{ width: 268 }}>
        <div className="flex-1 overflow-y-auto overflow-x-hidden">
          <ArmyPanel
            factions={battle.factions}
            currentPhase={currentPhase}
            selectedFactionId={selectedFactionId}
            onSelectFaction={(id) => selectFaction(selectedFactionId === id ? null : id)}
          />
        </div>
      </div>

      {/* ── UNIT INFO DRAWER (bottom-left, above timeline) ── */}
      <AnimatePresence>
        {selectedUnit && selectedFaction && selectedUnitAnchor && (
          <UnitDrawer
            unit={selectedUnit}
            faction={selectedFaction}
            positionLabel={selectedPosition?.location}
            posture={selectedPosition?.posture}
            strengthPct={selectedPosition?.strength_pct}
            anchor={selectedUnitAnchor}
            onClose={() => selectUnit(null)}
          />
        )}
      </AnimatePresence>

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
