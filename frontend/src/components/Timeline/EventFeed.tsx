import type { Phase } from '@/types/battle'
import { Badge } from '@/components/shared/Badge'
import { snakeToTitle } from '@/utils/formatUtils'

interface EventFeedProps {
  phase: Phase
}

const sigVariant = (sig: string): 'critical' | 'high' | 'medium' | 'low' => {
  if (sig === 'critical') return 'critical'
  if (sig === 'high') return 'high'
  if (sig === 'medium') return 'medium'
  return 'low'
}

export function EventFeed({ phase }: EventFeedProps) {
  const sorted = [...phase.events].sort((a, b) => a.timestamp_offset_hours - b.timestamp_offset_hours)

  return (
    <div className="flex gap-3 overflow-x-auto pb-1 panel-scroll">
      {sorted.map((evt) => (
        <div
          key={evt.id}
          className="flex-shrink-0 w-48 bg-wiki-parchment border border-wiki-border rounded-md p-2 border-l-2 shadow-sm"
          style={{
            borderLeftColor:
              evt.significance === 'critical' ? '#cc0000' :
              evt.significance === 'high'     ? '#b35800' : '#c8b49a',
          }}
        >
          <div className="flex items-center justify-between gap-1 mb-1">
            <Badge label={snakeToTitle(evt.type)} variant="neutral" />
            <Badge label={evt.significance} variant={sigVariant(evt.significance)} />
          </div>
          <p className="text-[11px] font-semibold text-wiki-text leading-tight">{evt.label}</p>
          <p className="text-[10px] text-wiki-textMuted mt-1 leading-snug line-clamp-3">{evt.description}</p>
        </div>
      ))}
    </div>
  )
}
