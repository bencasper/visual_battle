import type { PhaseMarkerProps } from './Timeline.types'
import { Tooltip } from '@/components/shared/Tooltip'
import { Badge } from '@/components/shared/Badge'
import { formatDateRange } from '@/utils/formatUtils'

export function PhaseMarker({ phase, index, total, isCurrent, onClick }: PhaseMarkerProps) {
  const leftPct = total > 1 ? (index / (total - 1)) * 100 : 0
  const criticalEvents = phase.events.filter((e) => e.significance === 'critical').length

  return (
    <Tooltip
      content={
        <div className="max-w-xs">
          <p className="font-semibold text-wiki-text">{phase.label}</p>
          <p className="text-wiki-textMuted text-[10px] mt-0.5">{formatDateRange(phase.date_range)}</p>
          {criticalEvents > 0 && (
            <Badge label={`${criticalEvents} critical event${criticalEvents > 1 ? 's' : ''}`} variant="critical" size="xs" />
          )}
        </div>
      }
      side="top"
    >
      <button
        onClick={onClick}
        className="absolute -translate-x-1/2 -translate-y-1/2 top-1/2"
        style={{ left: `${leftPct}%` }}
        aria-label={`Phase ${index + 1}: ${phase.label}`}
      >
        <div
          className={`
            w-3 h-3 rounded-full border-2 transition-all duration-200
            ${isCurrent
              ? 'bg-un border-wiki-text scale-150 shadow-md'
              : 'bg-wiki-hillShade border-wiki-mountain hover:bg-wiki-mountain hover:scale-125'}
          `}
        />
        {isCurrent && (
          <div className="absolute -bottom-5 left-1/2 -translate-x-1/2 text-[9px] text-un whitespace-nowrap font-bold">
            {index + 1}/{total}
          </div>
        )}
      </button>
    </Tooltip>
  )
}
