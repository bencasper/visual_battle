import { useTranslation } from 'react-i18next'
import type { WeaponCardProps } from './WeaponComparison.types'
import { snakeToTitle } from '@/utils/formatUtils'
import { WIKI_COLOURS } from '@/utils/wikiMapStyle'

export function WeaponCard({ weapon, factionColor }: WeaponCardProps) {
  const { t } = useTranslation()
  const stats = Object.entries(weapon.stats).filter(([, v]) => v != null) as [string, number][]
  // Map old faction colours to Wikipedia palette
  const barColor = factionColor.toLowerCase().includes('1a3') || factionColor.toLowerCase().includes('003')
    ? WIKI_COLOURS.unBlue
    : factionColor.toLowerCase().includes('8b1') || factionColor.toLowerCase().includes('aa0')
    ? WIKI_COLOURS.pvaRed
    : factionColor

  return (
    <div className="glass-panel p-2 flex-1 min-w-0">
      {/* Header */}
      <div className="flex items-center gap-1.5 mb-2">
        <div className="w-1.5 h-8 rounded-full" style={{ backgroundColor: barColor }} />
        <div>
          <p className="text-xs font-bold text-wiki-text leading-tight">{weapon.name}</p>
          <p className="text-[10px] text-wiki-textMuted">{snakeToTitle(weapon.type)}</p>
        </div>
      </div>

      {/* Quick stats */}
      <div className="space-y-1">
        {stats.map(([key, val]) => (
          <div key={key} className="flex items-center gap-1.5">
            <span className="text-[9px] text-wiki-textMuted w-20 truncate">{snakeToTitle(key)}</span>
            <div className="flex-1 h-1 bg-wiki-hillShade rounded-full overflow-hidden">
              <div
                className="h-full rounded-full"
                style={{ width: `${(val / 10) * 100}%`, backgroundColor: barColor }}
              />
            </div>
            <span className="text-[9px] text-wiki-textMuted font-mono w-4 text-right">{val}</span>
          </div>
        ))}
      </div>

      {weapon.effective_range_m && (
      <p className="text-[9px] text-wiki-textMuted mt-1.5">
          {t('weaponCard.range')}: {weapon.effective_range_m.toLocaleString()}m
          {weapon.rate_of_fire_rpm ? ` · ${weapon.rate_of_fire_rpm} rpm` : ''}
        </p>
      )}
    </div>
  )
}
