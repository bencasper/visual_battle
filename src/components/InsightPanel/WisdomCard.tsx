import type { WisdomCardProps } from './InsightPanel.types'
import { Badge } from '@/components/shared/Badge'
import { snakeToTitle } from '@/utils/formatUtils'

export function WisdomCard({ wisdom }: WisdomCardProps) {
  return (
    <div className="glass-panel p-2.5 border-l-2 border-un-light/60">
      <div className="flex items-center gap-1.5 mb-1.5">
        <Badge label={snakeToTitle(wisdom.category)} variant="neutral" size="xs" />
      </div>
      <p className="text-xs font-semibold text-slate-100 mb-1 leading-tight">{wisdom.title}</p>
      <p className="text-[10px] text-slate-400 leading-snug">{wisdom.body}</p>
    </div>
  )
}
