// Core battle domain types for Visual Battle
// Mirrors server/models/battle.py Pydantic models exactly

export type UnitType =
  | 'infantry_division'
  | 'infantry_regiment'
  | 'infantry_battalion'
  | 'army_corps'
  | 'commando'
  | 'armored_division'
  | 'artillery_regiment'
  | 'naval_force'
  | 'air_wing'

export type SupplyStatus = 'full' | 'adequate' | 'low' | 'critical' | 'depleted'

export type Posture =
  | 'advancing'
  | 'attacking'
  | 'attacking_south'
  | 'defending'
  | 'holding'
  | 'moving'
  | 'retreating'
  | 'encircled'
  | 'pursuing'
  | 'blocking'
  | 'consolidating'
  | 'evacuating'
  | 'infiltrating'

export type EventType =
  | 'combat'
  | 'movement'
  | 'command'
  | 'logistics'
  | 'air_support'
  | 'destruction'
  | 'engineering'
  | 'demolition'

export type Significance = 'critical' | 'high' | 'medium' | 'low'

export type WisdomCategory =
  | 'logistics'
  | 'intelligence'
  | 'combined_arms'
  | 'morale'
  | 'adaptability'
  | 'strategic'
  | 'leadership'
  | 'terrain'

export interface DateRange {
  start: string // ISO date string
  end: string
}

export interface Location {
  lat: number
  lng: number
  region?: string
  terrain_description?: string
}

export interface MapBounds {
  north: number
  south: number
  east: number
  west: number
}

export interface WeaponStats {
  firepower?: number
  range?: number
  reliability_cold?: number
  weight?: number
  armor?: number
  cold_weather_ops?: number
  mobility?: number
  responsiveness?: number
}

export interface Weapon {
  id: string
  name: string
  type: string
  caliber?: string
  effective_range_m?: number
  rate_of_fire_rpm?: number
  main_gun?: string
  payload_kg?: number
  stats: WeaponStats
}

export interface Unit {
  id: string
  name: string
  short_name?: string
  type: UnitType | string
  parent_id?: string | null
  strength: number
  commander: string
  deputy_commander?: string
  nation?: string
  equipment_era: string
  morale: number // 0–1
  supply_status: SupplyStatus
  location_label?: string
  nato_symbol?: string
  notes?: string
}

export interface FactionStrength {
  total_troops: number
  engaged_at_reservoir?: number
  infantry_battalions?: number
  infantry_divisions?: number
  artillery_battalions?: number
  tanks?: number
  aircraft_sorties_available?: number
}

export interface Faction {
  id: string
  name: string
  full_name: string
  side: string
  color: string
  color_light: string
  commander: string
  higher_command: string
  nation_flags: string[]
  strength: FactionStrength
  units: Unit[]
  weapons: Weapon[]
}

export interface UnitPositionItem {
  location: string
  lat: number
  lng: number
  strength_pct: number // 0–1
  posture: Posture
}

export interface UnitPosition {
  unit_id: string
  faction_id: string
  positions: UnitPositionItem[]
}

export interface PhaseEvent {
  id: string
  type: EventType
  timestamp_offset_hours: number
  label: string
  description: string
  location: Location
  significance: Significance
}

export interface Weather {
  temp_celsius: number
  conditions: string
  wind_kph: number
}

export interface Phase {
  id: string
  index: number
  label: string
  date_range: DateRange
  timestamp_offset_hours: number
  summary: string
  tactical_situation: string
  unit_positions: UnitPosition[]
  events: PhaseEvent[]
  annotation: string
  weather: Weather
}

export interface CasualtyDetail {
  killed_in_action: number
  wounded_in_action: number
  missing_in_action?: number
  non_battle_frostbite?: number
  total_combat_ineffective?: number
  note?: string
}

export interface KeyFigure {
  name: string
  faction: string
  role: string
  significance: string
}

export interface Source {
  title: string
  type: string
  url?: string | null
}

export interface WisdomEntry {
  id: string
  category: WisdomCategory
  title: string
  body: string
  related_phase: string
}

export interface Battle {
  id: string
  name: string
  slug: string
  theater: string
  date_range: DateRange
  location: Location
  terrain_type: string
  map_bounds: MapBounds
  outcome: string
  result_summary: string
  factions: Faction[]
  phases: Phase[]
  casualties: Record<string, CasualtyDetail>
  key_figures: KeyFigure[]
  sources: Source[]
  wisdom: WisdomEntry[]
}

export interface BattleListItem {
  id: string
  name: string
  slug: string
  theater: string
  date_range: DateRange
  location: Location
  faction_names: string[]
  outcome: string
}
