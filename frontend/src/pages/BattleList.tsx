import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useBattleStore } from '@/store/useBattleStore'
import { LoadingSpinner } from '@/components/shared/LoadingSpinner'
import { Badge } from '@/components/shared/Badge'
import { formatDateRange } from '@/utils/formatUtils'

export function BattleList() {
  const { battleList, loading, error, loadBattleList } = useBattleStore()

  useEffect(() => { loadBattleList() }, [loadBattleList])

  if (loading) return (
    <div className="flex items-center justify-center h-full bg-wiki-parchment">
      <LoadingSpinner size="lg" label="Loading battles…" />
    </div>
  )
  if (error) return (
    <div className="flex items-center justify-center h-full text-pva text-sm bg-wiki-parchment">
      {error}
    </div>
  )

  return (
    <div className="min-h-full bg-wiki-parchment p-8">
      <div className="max-w-4xl mx-auto">
        <h1
          className="text-2xl font-bold text-wiki-text mb-1"
          style={{ fontFamily: '"Linux Libertine", Georgia, serif' }}
        >
          ⚔️ Visual Battle
        </h1>
        <p className="text-sm text-wiki-textMuted mb-8">
          Explore history's greatest battles through interactive maps, timelines, and tactical analysis.
        </p>

        {battleList.length === 0 ? (
          <div className="glass-panel p-8 text-center text-wiki-textMuted">
            <p className="text-4xl mb-3">🗺️</p>
            <p className="font-semibold text-wiki-text">No battles loaded yet.</p>
            <p className="text-sm mt-1">Run the seed script to populate the database.</p>
            <code className="block text-xs bg-wiki-parchmentDk border border-wiki-border rounded px-3 py-2 mt-3 text-wiki-text">
              cd server && python -m scripts.seed_db
            </code>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {battleList.map((battle) => (
              <Link
                key={battle.id}
                to={`/battle/${battle.id}`}
                className="glass-panel p-4 hover:border-un/60 transition-all duration-200 block group shadow-sm"
              >
                <div className="flex items-start justify-between gap-2 mb-2">
                  <Badge label={battle.theater} variant="neutral" />
                  <span className="text-[10px] text-wiki-textMuted">{formatDateRange(battle.date_range)}</span>
                </div>
                <h2
                  className="text-sm font-bold text-wiki-text group-hover:text-un transition-colors"
                  style={{ fontFamily: '"Linux Libertine", Georgia, serif' }}
                >
                  {battle.name}
                </h2>
                <p className="text-[10px] text-wiki-textMuted mt-1 line-clamp-2">{battle.outcome}</p>
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
