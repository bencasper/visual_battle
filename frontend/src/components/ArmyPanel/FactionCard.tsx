import type { FactionCardProps } from './ArmyPanel.types'
import { Badge } from '@/components/shared/Badge'
import { getFactionStrengthPct } from '@/utils/phaseUtils'
import { strengthColor, factionColor } from '@/utils/colorUtils'
import { formatNumber, formatPct } from '@/utils/formatUtils'

export function FactionCard({ faction, currentPhase, isSelected, onClick }: FactionCardProps) {
  const strengthPct = getFactionStrengthPct(currentPhase, faction.id)
  const side = faction.side.toLowerCase() as 'un' | 'pva'

  return (
    <button
      onClick={onClick}
      className={`
        w-full text-left p-2 rounded-lg border transition-all duration-200
        ${isSelected
          ? `border-[${faction.color}] bg-[${faction.color}]/10`
          : 'border-slate-700 hover:border-slate-500 bg-slate-800/50'}
      `}
    >
      {/* Header */}
      <div className="flex items-center justify-between gap-1 mb-1.5">
        <Badge label={faction.side} variant={side} size="xs" />
        <span className="text-[10px] text-slate-400 font-mono">{formatPct(strengthPct)} strength</span>
      </div>

      {/* Name */}
      <p className="text-xs font-semibold text-slate-100 leading-tight mb-0.5">{faction.name}</p>
      <p className="text-[10px] text-slate-400 leading-tight mb-2">{faction.commander}</p>

      {/* Strength bar */}
      <div className="h-1.5 bg-slate-700 rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-700"
          style={{
            width: `${strengthPct * 100}%`,
            backgroundColor: strengthColor(strengthPct),
          }}
        />
      </div>

      {/* Troop count */}
      <p className="text-[10px] text-slate-400 mt-1">
        {formatNumber(faction.strength.total_troops)} troops total
      </p>
    </button>
  )
}
