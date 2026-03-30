import type { CommanderQuoteProps } from './InsightPanel.types'
import { Badge } from '@/components/shared/Badge'

export function CommanderQuote({ figure }: CommanderQuoteProps) {
  const side = figure.faction.includes('un') ? 'un' : 'pva'
  return (
    <div className="glass-panel p-2.5">
      <Badge label={side.toUpperCase()} variant={side} size="xs" />
      <p className="text-xs font-bold text-wiki-text mt-1.5">{figure.name}</p>
      <p className="text-[10px] text-wiki-textMuted">{figure.role}</p>
      <p className="text-[10px] text-wiki-text mt-2 leading-snug italic">"{figure.significance}"</p>
    </div>
  )
}
