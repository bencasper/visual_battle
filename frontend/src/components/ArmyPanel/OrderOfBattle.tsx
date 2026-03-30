import { useState } from 'react'
import type { OrderOfBattleProps } from './ArmyPanel.types'
import { formatNumber } from '@/utils/formatUtils'

const UNIT_ICONS: Record<string, string> = {
  infantry_division:  '🪖',
  infantry_regiment:  '🪖',
  infantry_battalion: '🪖',
  army_corps:         '⚔️',
  commando:           '🎯',
  armored_division:   '🛡️',
  artillery_regiment: '💥',
  naval_force:        '⚓',
  air_wing:           '✈️',
}

export function OrderOfBattle({ faction }: OrderOfBattleProps) {
  const [expanded, setExpanded] = useState(false)
  const visible = expanded ? faction.units : faction.units.slice(0, 2)

  return (
    <div className="mt-2">
      <p className="text-[9px] uppercase tracking-widest text-wiki-textMuted font-semibold mb-1">Order of Battle</p>
      <div className="space-y-1">
        {visible.map((unit) => (
          <div
            key={unit.id}
            className="flex items-center gap-1.5 text-[10px] text-wiki-text rounded px-1.5 py-1"
            style={{ background: 'rgba(200,180,154,0.25)' }}
          >
            <span>{UNIT_ICONS[unit.type] ?? '🪖'}</span>
            <span className="flex-1 truncate font-medium">{unit.name}</span>
            <span className="text-wiki-textMuted font-mono">{formatNumber(unit.strength)}</span>
          </div>
        ))}
      </div>
      {faction.units.length > 2 && (
        <button
          onClick={() => setExpanded((e) => !e)}
          className="text-[10px] text-un hover:underline mt-1 font-medium"
        >
          {expanded ? 'Show less' : `+${faction.units.length - 2} more units`}
        </button>
      )}
    </div>
  )
}
