import type { TimelineProps } from './Timeline.types'
import { useTranslation } from 'react-i18next'
import { PlaybackControls } from './PlaybackControls'
import { EventFeed } from './EventFeed'
import { formatDateRange } from '@/utils/formatUtils'
import { useTimeline } from '@/hooks/useTimeline'

export function Timeline({
  phases, currentIndex, isPlaying, speed,
  onSeek, onPlayPause, onStepForward, onStepBack, onSpeedChange,
}: TimelineProps) {
  useTimeline()
  const { t } = useTranslation()
  const currentPhase = phases[currentIndex]

  return (
    <div
      className="shrink-0 backdrop-blur-sm border-t"
      style={{
        background: 'rgba(245,234,213,0.97)',
        borderTopColor: 'var(--color-panel-border)',
      }}
    >
      {/* ── Phase tabs ── */}
      <div className="flex items-stretch border-b" style={{ borderColor: 'var(--color-panel-border)' }}>
        {phases.map((phase, i) => {
          const isCurrent = i === currentIndex
          const criticalCount = phase.events.filter((e) => e.significance === 'critical').length
          return (
            <button
              key={phase.id}
              onClick={() => onSeek(i)}
              className="flex-1 flex flex-col items-start px-3 py-2 text-left transition-all duration-150 relative group"
              style={{
                background: isCurrent ? 'rgba(26,58,92,0.08)' : 'transparent',
                borderRight: i < phases.length - 1 ? '1px solid var(--color-panel-border)' : undefined,
              }}
              aria-label={t('timeline.goToPhase', { n: i + 1, label: phase.label })}
            >
              {/* active indicator bar */}
              {isCurrent && (
                <div
                  className="absolute top-0 left-0 right-0 h-0.5"
                  style={{ background: 'var(--color-un, #1a3a5c)' }}
                />
              )}
              <div className="flex items-center gap-1.5 w-full">
                <span
                  className="text-[10px] font-bold font-mono shrink-0"
                  style={{ color: isCurrent ? 'var(--color-un, #1a3a5c)' : '#aaa' }}
                >
                  {i + 1}
                </span>
                <span
                  className="text-[11px] font-semibold leading-tight line-clamp-1 flex-1"
                  style={{ color: isCurrent ? 'var(--color-wiki-text, #202122)' : '#666' }}
                >
                  {phase.label}
                </span>
                {criticalCount > 0 && (
                  <span
                    className="text-[9px] font-bold px-1 py-0.5 rounded shrink-0"
                    style={{
                      background: isCurrent ? '#cc000022' : '#00000010',
                      color: isCurrent ? '#cc0000' : '#999',
                    }}
                  >
                    {criticalCount}★
                  </span>
                )}
              </div>
              <span
                className="text-[9px] mt-0.5 leading-none"
                style={{ color: isCurrent ? 'var(--color-wiki-textMuted, #72777d)' : '#bbb' }}
              >
                {formatDateRange(phase.date_range)}
              </span>
              {/* hover highlight for inactive tabs */}
              {!isCurrent && (
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity"
                  style={{ background: 'rgba(0,0,0,0.04)' }} />
              )}
            </button>
          )
        })}

        {/* Playback controls pinned to the right */}
        <div className="flex items-center px-3 shrink-0 border-l" style={{ borderColor: 'var(--color-panel-border)' }}>
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
        </div>
      </div>

      {/* ── Event feed ── */}
      {currentPhase && (
        <div className="px-4 py-2">
          <EventFeed phase={currentPhase} />
        </div>
      )}
    </div>
  )
}
