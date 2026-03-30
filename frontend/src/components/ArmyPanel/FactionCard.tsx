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
      className="flex-1 text-left p-2 rounded-lg border transition-all duration-200"
      style={{
        borderColor: isSelected ? wikiColor : WIKI_COLOURS.panelBorder,
        backgroundColor: isSelected ? `${wikiColor}18` : WIKI_COLOURS.parchment,
        borderWidth: isSelected ? 2 : 1,
      }}
    >
      {/* Side badge */}
      <div className="flex items-center justify-between gap-1 mb-1">
        <Badge label={faction.side} variant={side} size="xs" />
        <span className="text-[9px] text-wiki-textMuted font-mono">{formatPct(strengthPct)}</span>
      </div>

      {/* Short name */}
      <p className="text-[10px] font-bold text-wiki-text leading-tight">{faction.name}</p>
      <p className="text-[9px] text-wiki-textMuted leading-tight mt-0.5 truncate">{faction.commander}</p>

      {/* Strength bar */}
      <div className="h-1 bg-wiki-hillShade rounded-full overflow-hidden mt-1.5">
        <div
          className="h-full rounded-full transition-all duration-700"
          style={{ width: `${strengthPct * 100}%`, backgroundColor: strengthColor(strengthPct) }}
        />
      </div>

      {/* Troop count */}
      <p className="text-[9px] text-wiki-textMuted mt-1">
        {formatNumber(faction.strength.total_troops)} troops
      </p>
    </button>
  )
}
