import type { TimelineProps } from './Timeline.types'
import { PhaseMarker } from './PhaseMarker'
import { PlaybackControls } from './PlaybackControls'
import { EventFeed } from './EventFeed'
import { formatDateRange } from '@/utils/formatUtils'
import { useTimeline } from '@/hooks/useTimeline'

export function Timeline({
  phases, currentIndex, isPlaying, speed,
  onSeek, onPlayPause, onStepForward, onStepBack, onSpeedChange,
}: TimelineProps) {
  // Activate the rAF loop
  useTimeline()

  const currentPhase = phases[currentIndex]

  return (
    <div
      className="absolute bottom-0 left-0 right-0 z-20 bg-map-panel/95 backdrop-blur-sm border-t border-map-panelBorder"
      style={{ height: 'var(--timeline-height, 120px)' }}
    >
      <div className="flex flex-col h-full px-4 py-2 gap-2">
        {/* Top row: controls + phase info */}
        <div className="flex items-center gap-4">
          <PlaybackControls
            isPlaying={isPlaying}
            speed={speed}
            canStepBack={currentIndex > 0}
            canStepForward={currentIndex < phases.length - 1}
            onPlay={onPlayPause}
            onPause={onPlayPause}
            onStepBack={onStepBack}
            onStepForward={onStepForward}
            onSpeedChange={onSpeedChange}
          />
          {currentPhase && (
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-slate-200 truncate">{currentPhase.label}</p>
              <p className="text-[10px] text-slate-400">{formatDateRange(currentPhase.date_range)}</p>
            </div>
          )}
          <div className="text-[10px] text-slate-500 font-mono">
            {currentIndex + 1} / {phases.length}
          </div>
        </div>

        {/* Scrubber bar */}
        <div className="relative h-6 flex items-center px-4">
          {/* Track */}
          <div className="absolute inset-x-4 h-0.5 bg-slate-700 rounded" />
          {/* Progress fill */}
          <div
            className="absolute left-4 h-0.5 bg-un-light rounded transition-all duration-300"
            style={{ width: `calc(${phases.length > 1 ? (currentIndex / (phases.length - 1)) * 100 : 0}% * (100% - 2rem) / 100%)` }}
          />
          {/* Phase markers */}
          {phases.map((phase, i) => (
            <PhaseMarker
              key={phase.id}
              phase={phase}
              index={i}
              total={phases.length}
              isCurrent={i === currentIndex}
              onClick={() => onSeek(i)}
            />
          ))}
        </div>

        {/* Event feed */}
        {currentPhase && <EventFeed phase={currentPhase} />}
      </div>
    </div>
  )
}
