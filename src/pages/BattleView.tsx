import { useRef, useCallback } from 'react'
import { useParams } from 'react-router-dom'
import type { Map as MapLibreMap } from 'maplibre-gl'
import { useBattleData } from '@/hooks/useBattleData'
import { useBattleStore } from '@/store/useBattleStore'
import { useTimelineStore } from '@/store/useTimelineStore'
import { useUIStore } from '@/store/useUIStore'
import { MapEngine } from '@/components/MapEngine/MapEngine'
import { Timeline } from '@/components/Timeline/Timeline'
import { ArmyPanel } from '@/components/ArmyPanel/ArmyPanel'
import { WeaponComparison } from '@/components/WeaponComparison/WeaponComparison'
import { StrategyOverlay } from '@/components/StrategyOverlay/StrategyOverlay'
import { InsightPanel } from '@/components/InsightPanel/InsightPanel'
import { LoadingSpinner } from '@/components/shared/LoadingSpinner'
import { ErrorBoundary } from '@/components/shared/ErrorBoundary'

const DEFAULT_BATTLE_ID = 'chosin-reservoir-1950'

export function BattleView() {
  const { battleId = DEFAULT_BATTLE_ID } = useParams<{ battleId: string }>()
  const { battle, loading, error } = useBattleData(battleId)
  const terrain = useBattleStore((s) => s.terrain)

  const { currentPhaseIndex, isPlaying, speed, play, pause, stepForward, stepBack, seekToPhase, setSpeed } = useTimelineStore()
  const { activePanel, selectedFactionId, showTerrain, showAnnotations, togglePanel, selectFaction } = useUIStore()

  const mapRef = useRef<MapLibreMap | null>(null)
  const handleMapReady = useCallback((map: MapLibreMap) => { mapRef.current = map }, [])

  if (loading) {
    return (
      <div className="w-full h-full flex items-center justify-center">
        <LoadingSpinner size="lg" label="Loading battle data…" />
      </div>
    )
  }

  if (error || !battle) {
    return (
      <div className="w-full h-full flex items-center justify-center text-red-400 text-sm">
        {error ?? 'Battle not found'}
      </div>
    )
  }

  const currentPhase = battle.phases[currentPhaseIndex]

  return (
    <div className="relative w-full h-full overflow-hidden">
      {/* ── MAP ENGINE (full viewport) ── */}
      <ErrorBoundary>
        <MapEngine
          battle={battle}
          currentPhase={currentPhase}
          terrain={terrain}
          showTerrain={showTerrain}
          onUnitClick={(unitId) => selectFaction(battle.factions.find((f) => f.units.some((u) => u.id === unitId))?.id ?? null)}
          onMapReady={handleMapReady}
        />
      </ErrorBoundary>

      {/* ── STRATEGY OVERLAY ── */}
      <StrategyOverlay phase={currentPhase} mapRef={mapRef} visible={showAnnotations} />

      {/* ── TOP-LEFT: Battle title + panel toggles ── */}
      <div className="absolute top-3 left-3 z-20 flex flex-col gap-2">
        {/* Title chip */}
        <div className="glass-panel px-3 py-1.5">
          <p className="text-[9px] uppercase tracking-widest text-slate-500">{battle.theater}</p>
          <p className="text-sm font-semibold text-slate-100">{battle.name}</p>
        </div>

        {/* Panel toggle buttons */}
        <div className="flex gap-1.5">
          {[
            { key: 'army',     icon: '⚔️',  label: 'Army' },
            { key: 'weapons',  icon: '🏹',  label: 'Weapons' },
            { key: 'insights', icon: '📚',  label: 'Insights' },
          ].map(({ key, icon, label }) => (
            <button
              key={key}
              onClick={() => togglePanel(key as 'army' | 'weapons' | 'insights')}
              className={`px-2 py-1 rounded text-xs font-medium transition-colors border ${
                activePanel === key
                  ? 'bg-un text-white border-un-light'
                  : 'glass-panel text-slate-300 border-slate-700 hover:border-slate-500'
              }`}
            >
              {icon} {label}
            </button>
          ))}
          <button
            onClick={() => useUIStore.getState().toggleAnnotations()}
            className={`px-2 py-1 rounded text-xs font-medium transition-colors border ${
              showAnnotations ? 'bg-un text-white border-un-light' : 'glass-panel text-slate-300 border-slate-700'
            }`}
          >
            📍 Events
          </button>
        </div>
      </div>

      {/* ── ARMY PANEL (top-left, below toggles) ── */}
      {activePanel === 'army' && (
        <div className="absolute top-28 left-3 z-20">
          <ErrorBoundary>
            <ArmyPanel
              factions={battle.factions}
              currentPhase={currentPhase}
              selectedFactionId={selectedFactionId}
              onSelectFaction={selectFaction}
            />
          </ErrorBoundary>
        </div>
      )}

      {/* ── WEAPON COMPARISON (top-right) ── */}
      {activePanel === 'weapons' && (
        <div className="absolute top-3 right-3 z-20">
          <ErrorBoundary>
            <WeaponComparison factions={battle.factions} />
          </ErrorBoundary>
        </div>
      )}

      {/* ── INSIGHT PANEL (slide-in from right) ── */}
      <InsightPanel
        phase={currentPhase}
        battle={battle}
        visible={activePanel === 'insights'}
        onClose={() => togglePanel('insights')}
      />

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

      {/* ── OUTCOME CHIP (bottom-left above timeline) ── */}
      <div className="absolute bottom-32 left-3 z-20">
        <div className="glass-panel px-2 py-1 max-w-xs">
          <p className="text-[9px] text-slate-500 uppercase tracking-wide">Outcome</p>
          <p className="text-[10px] text-slate-300 leading-snug">{battle.result_summary}</p>
        </div>
      </div>
    </div>
  )
}
