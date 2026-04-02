import { useTranslation } from 'react-i18next'
import type { ArmyPanelProps } from './ArmyPanel.types'
import { Panel } from '@/components/shared/Panel'
import { FactionCard } from './FactionCard'
import { StrengthBar } from './StrengthBar'
import { OrderOfBattle } from './OrderOfBattle'

export function ArmyPanel({ factions, currentPhase, selectedFactionId, onSelectFaction }: ArmyPanelProps) {
  const { t } = useTranslation()
  // Default: show first faction if none selected
  const activeFactionId = selectedFactionId ?? factions[0]?.id ?? null
  const activeFaction = factions.find((f) => f.id === activeFactionId)

  return (
    <Panel title={t('armyPanel.title')} icon="⚔️" className="w-full">
      {/* Force strength comparison */}
      <div className="mb-2">
        <p className="text-[9px] uppercase tracking-widest text-wiki-textMuted font-semibold mb-1">{t('armyPanel.forceStrength')}</p>
        <StrengthBar factions={factions} currentPhase={currentPhase} />
      </div>

      {/* Faction selector tabs */}
      <div className="flex gap-1.5 mb-2">
        {factions.map((faction) => (
          <FactionCard
            key={faction.id}
            faction={faction}
            currentPhase={currentPhase}
            isSelected={activeFactionId === faction.id}
            onClick={() => onSelectFaction(faction.id)}
          />
        ))}
      </div>

      {/* Order of battle for active faction */}
      {activeFaction && (
        <OrderOfBattle faction={activeFaction} currentPhase={currentPhase} />
      )}
    </Panel>
  )
}
