import type { CommanderQuoteProps } from './InsightPanel.types'
import { Badge } from '@/components/shared/Badge'

export function CommanderQuote({ figure }: CommanderQuoteProps) {
  const side = figure.faction.includes('un') ? 'un' : 'pva'
  return (
    <div className="glass-panel p-2.5">
      <Badge label={side.toUpperCase()} variant={side} size="xs" />
      <p className="text-xs font-semibold text-slate-200 mt-1.5">{figure.name}</p>
      <p className="text-[10px] text-slate-400">{figure.role}</p>
      <p className="text-[10px] text-slate-300 mt-2 leading-snug italic">"{figure.significance}"</p>
    </div>
  )
}
