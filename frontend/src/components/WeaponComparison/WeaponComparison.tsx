import { useState } from 'react'
import type { WeaponComparisonProps } from './WeaponComparison.types'
import { Panel } from '@/components/shared/Panel'
import { WeaponCard } from './WeaponCard'
import { WeaponRadarChart } from './WeaponRadarChart'

type WeaponCategory = 'rifle' | 'machine_gun' | 'submachine_gun' | 'mortar' | 'field_artillery' | 'medium_tank' | 'close_air_support' | 'grenade'

const CATEGORIES: { key: WeaponCategory; label: string; icon: string }[] = [
  { key: 'rifle', label: 'Rifles', icon: '🔫' },
  { key: 'machine_gun', label: 'MG', icon: '⚙️' },
  { key: 'field_artillery', label: 'Artillery', icon: '💥' },
  { key: 'medium_tank', label: 'Armor', icon: '🛡️' },
  { key: 'close_air_support', label: 'Air', icon: '✈️' },
]

export function WeaponComparison({ factions }: WeaponComparisonProps) {
  const [activeCategory, setActiveCategory] = useState<WeaponCategory>('rifle')

  const getWeapon = (factionIndex: number) =>
    factions[factionIndex]?.weapons.find((w) => w.type === activeCategory) ?? null

  const w0 = getWeapon(0)
  const w1 = getWeapon(1)

  const radarWeapons = [
    w0 && { weapon: w0, color: factions[0].color, label: factions[0].side },
    w1 && { weapon: w1, color: factions[1].color, label: factions[1].side },
  ].filter(Boolean) as WeaponRadarChart['props'] extends { weapons: infer W } ? W : never[]

  return (
    <Panel title="Weapon Comparison" icon="🏹" className="w-64">
      {/* Category tabs */}
      <div className="flex flex-wrap gap-1 mb-2">
        {CATEGORIES.map((cat) => (
          <button
            key={cat.key}
            onClick={() => setActiveCategory(cat.key)}
            className={`px-2 py-0.5 rounded text-[10px] font-semibold transition-colors ${
              activeCategory === cat.key
                ? 'bg-un text-white'
                : 'bg-wiki-parchmentDk text-wiki-text hover:bg-wiki-hillShade border border-wiki-border'
            }`}
          >
            {cat.icon} {cat.label}
          </button>
        ))}
      </div>

      {/* Side-by-side cards */}
      <div className="flex gap-1.5 mb-2">
        {w0 ? <WeaponCard weapon={w0} factionColor={factions[0].color} /> : <div className="flex-1 text-[10px] text-wiki-textMuted italic p-2">No match</div>}
        {w1 ? <WeaponCard weapon={w1} factionColor={factions[1].color} /> : <div className="flex-1 text-[10px] text-wiki-textMuted italic p-2">No match</div>}
      </div>

      {/* Radar chart */}
      {radarWeapons.length > 0 && <WeaponRadarChart weapons={radarWeapons} />}
    </Panel>
  )
}
