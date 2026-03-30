import type { Faction, Phase } from '@/types/battle'

export interface ArmyPanelProps {
  factions: Faction[]
  currentPhase: Phase
  selectedFactionId: string | null
  onSelectFaction: (id: string) => void
}

export interface FactionCardProps {
  faction: Faction
  currentPhase: Phase
  isSelected: boolean
  onClick: () => void
}

export interface StrengthBarProps {
  factions: Faction[]
  currentPhase: Phase
}

export interface OrderOfBattleProps {
  faction: Faction
  currentPhase: Phase
}
