import type { ArmyPanelProps } from './ArmyPanel.types'
import { Panel } from '@/components/shared/Panel'
import { FactionCard } from './FactionCard'
import { StrengthBar } from './StrengthBar'
import { OrderOfBattle } from './OrderOfBattle'

export function ArmyPanel({ factions, currentPhase, selectedFactionId, onSelectFaction }: ArmyPanelProps) {
  const selectedFaction = factions.find((f) => f.id === selectedFactionId)

  return (
    <Panel title="Order of Battle" icon="⚔️" className="w-64">
      {/* Strength comparison bar */}
      <div className="mb-2">
        <p className="text-[9px] uppercase tracking-widest text-slate-500 mb-1">Force Strength</p>
        <StrengthBar factions={factions} currentPhase={currentPhase} />
      </div>

      {/* Faction cards */}
      <div className="space-y-1.5">
        {factions.map((faction) => (
          <FactionCard
            key={faction.id}
            faction={faction}
            currentPhase={currentPhase}
            isSelected={selectedFactionId === faction.id}
            onClick={() => onSelectFaction(faction.id)}
          />
        ))}
      </div>

      {/* Expanded order of battle for selected faction */}
      {selectedFaction && (
        <OrderOfBattle faction={selectedFaction} />
      )}
    </Panel>
  )
}
