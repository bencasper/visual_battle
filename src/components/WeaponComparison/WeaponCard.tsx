import type { WeaponCardProps } from './WeaponComparison.types'
import { snakeToTitle } from '@/utils/formatUtils'

export function WeaponCard({ weapon, factionColor }: WeaponCardProps) {
  const stats = Object.entries(weapon.stats).filter(([, v]) => v != null) as [string, number][]

  return (
    <div className="glass-panel p-2 flex-1 min-w-0">
      {/* Header */}
      <div className="flex items-center gap-1.5 mb-2">
        <div className="w-1.5 h-8 rounded-full" style={{ backgroundColor: factionColor }} />
        <div>
          <p className="text-xs font-semibold text-slate-100 leading-tight">{weapon.name}</p>
          <p className="text-[10px] text-slate-400">{snakeToTitle(weapon.type)}</p>
        </div>
      </div>

      {/* Quick stats */}
      <div className="space-y-1">
        {stats.map(([key, val]) => (
          <div key={key} className="flex items-center gap-1.5">
            <span className="text-[9px] text-slate-500 w-20 truncate">{snakeToTitle(key)}</span>
            <div className="flex-1 h-1 bg-slate-700 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full"
                style={{ width: `${(val / 10) * 100}%`, backgroundColor: factionColor }}
              />
            </div>
            <span className="text-[9px] text-slate-400 font-mono w-4 text-right">{val}</span>
          </div>
        ))}
      </div>

      {weapon.effective_range_m && (
        <p className="text-[9px] text-slate-500 mt-1.5">
          Range: {weapon.effective_range_m.toLocaleString()}m
          {weapon.rate_of_fire_rpm ? ` · ${weapon.rate_of_fire_rpm} rpm` : ''}
        </p>
      )}
    </div>
  )
}
