import type { FactionCardProps } from './ArmyPanel.types'
import { Badge } from '@/components/shared/Badge'
import { getFactionStrengthPct } from '@/utils/phaseUtils'
import { strengthColor } from '@/utils/colorUtils'
import { formatNumber, formatPct } from '@/utils/formatUtils'
import { WIKI_COLOURS } from '@/utils/wikiMapStyle'

export function FactionCard({ faction, currentPhase, isSelected, onClick }: FactionCardProps) {
  const strengthPct = getFactionStrengthPct(currentPhase, faction.id)
  const side = faction.side.toLowerCase() as 'un' | 'pva'
  const wikiColor = side === 'un' ? WIKI_COLOURS.unBlue : WIKI_COLOURS.pvaRed

  return (
    <button
      onClick={onClick}
      className="w-full text-left p-2 rounded-lg border transition-all duration-200"
      style={{
        borderColor: isSelected ? wikiColor : WIKI_COLOURS.panelBorder,
        backgroundColor: isSelected ? `${wikiColor}18` : WIKI_COLOURS.parchment,
      }}
    >
      {/* Header */}
      <div className="flex items-center justify-between gap-1 mb-1.5">
        <Badge label={faction.side} variant={side} size="xs" />
        <span className="text-[10px] text-wiki-textMuted font-mono">{formatPct(strengthPct)} strength</span>
      </div>

      {/* Name */}
      <p className="text-xs font-bold text-wiki-text leading-tight mb-0.5">{faction.name}</p>
      <p className="text-[10px] text-wiki-textMuted leading-tight mb-2">{faction.commander}</p>

      {/* Strength bar */}
      <div className="h-1.5 bg-wiki-hillShade rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-700"
          style={{
            width: `${strengthPct * 100}%`,
            backgroundColor: strengthColor(strengthPct),
          }}
        />
      </div>

      {/* Troop count */}
      <p className="text-[10px] text-wiki-textMuted mt-1">
        {formatNumber(faction.strength.total_troops)} troops total
      </p>
    </button>
  )
}
