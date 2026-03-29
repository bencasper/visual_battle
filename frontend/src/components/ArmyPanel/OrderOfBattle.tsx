import { useState } from 'react'
import type { OrderOfBattleProps } from './ArmyPanel.types'
import { Badge } from '@/components/shared/Badge'
import { formatNumber, formatPct } from '@/utils/formatUtils'

const UNIT_ICONS: Record<string, string> = {
  infantry_division: '🪖',
  infantry_regiment: '🪖',
  infantry_battalion: '🪖',
  army_corps: '⚔️',
  commando: '🎯',
  armored_division: '🛡️',
  artillery_regiment: '💥',
  naval_force: '⚓',
  air_wing: '✈️',
}

export function OrderOfBattle({ faction }: OrderOfBattleProps) {
  const [expanded, setExpanded] = useState(false)
  const visible = expanded ? faction.units : faction.units.slice(0, 2)

  return (
    <div className="mt-2">
      <p className="text-[9px] uppercase tracking-widest text-slate-500 mb-1">Order of Battle</p>
      <div className="space-y-1">
        {visible.map((unit) => (
          <div key={unit.id} className="flex items-center gap-1.5 text-[10px] text-slate-300 bg-slate-800/40 rounded px-1.5 py-1">
            <span>{UNIT_ICONS[unit.type] ?? '🪖'}</span>
            <span className="flex-1 truncate font-medium">{unit.name}</span>
            <span className="text-slate-500 font-mono">{formatNumber(unit.strength)}</span>
          </div>
        ))}
      </div>
      {faction.units.length > 2 && (
        <button
          onClick={() => setExpanded((e) => !e)}
          className="text-[10px] text-un-light hover:underline mt-1"
        >
          {expanded ? 'Show less' : `+${faction.units.length - 2} more units`}
        </button>
      )}
    </div>
  )
}
