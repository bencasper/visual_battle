import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useBattleStore } from '@/store/useBattleStore'
import { LoadingSpinner } from '@/components/shared/LoadingSpinner'
import { Badge } from '@/components/shared/Badge'
import { formatDateRange } from '@/utils/formatUtils'

export function BattleList() {
  const { battleList, loading, error, loadBattleList } = useBattleStore()

  useEffect(() => { loadBattleList() }, [loadBattleList])

  if (loading) return <div className="flex items-center justify-center h-full"><LoadingSpinner size="lg" label="Loading battles…" /></div>
  if (error) return <div className="flex items-center justify-center h-full text-red-400 text-sm">{error}</div>

  return (
    <div className="min-h-full bg-map-bg p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold text-slate-100 mb-1">⚔️ Visual Battle</h1>
        <p className="text-sm text-slate-400 mb-8">Explore history's greatest battles through interactive maps, timelines, and tactical analysis.</p>

        {battleList.length === 0 ? (
          <div className="glass-panel p-8 text-center text-slate-400">
            <p className="text-4xl mb-3">🗺️</p>
            <p className="font-medium">No battles loaded yet.</p>
            <p className="text-sm mt-1">Run the seed script to populate the database.</p>
            <code className="block text-xs bg-slate-800 rounded px-3 py-2 mt-3 text-slate-300">
              cd server && python -m scripts.seed_db
            </code>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {battleList.map((battle) => (
              <Link key={battle.id} to={`/battle/${battle.id}`} className="glass-panel p-4 hover:border-un-light/50 transition-all duration-200 block group">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <Badge label={battle.theater} variant="neutral" />
                  <span className="text-[10px] text-slate-500">{formatDateRange(battle.date_range)}</span>
                </div>
                <h2 className="text-sm font-semibold text-slate-100 group-hover:text-un-light transition-colors">{battle.name}</h2>
                <p className="text-[10px] text-slate-400 mt-1 line-clamp-2">{battle.outcome}</p>
                <div className="flex gap-1 mt-2">
                  {battle.faction_names.map((name, i) => (
                    <Badge key={i} label={name.split('—')[0].trim()} variant={i === 0 ? 'un' : 'pva'} size="xs" />
                  ))}
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
