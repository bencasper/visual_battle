import type { Faction } from '@/types/battle'

export interface WeaponComparisonProps {
  factions: Faction[]
}

export interface WeaponCardProps {
  weapon: Faction['weapons'][number]
  factionColor: string
}

export interface WeaponRadarChartProps {
  weapons: Array<{ weapon: Faction['weapons'][number]; color: string; label: string }>
}
