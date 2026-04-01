/**
 * Admin battle list — shows all battles with edit/delete/export actions.
 */

import { useEffect } from 'react'
import { useAdminStore } from '@/store/useAdminStore'
import { LoadingSpinner } from '@/components/shared/LoadingSpinner'
import { formatDateRange } from '@/utils/formatUtils'

export function AdminBattleList() {
  const {
    battles, loading, error,
    loadBattles, goToEditBattle, goToNewBattle,
    removeBattle, exportBattle, exportAll,
    saving,
  } = useAdminStore()

  useEffect(() => { loadBattles() }, [loadBattles])

  if (loading && battles.length === 0) {
    return (
      <div className="flex items-center justify-center py-20">
        <LoadingSpinner size="lg" label="Loading battles..." />
      </div>
    )
  }

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2
            className="text-xl font-bold text-wiki-text"
            style={{ fontFamily: '"Linux Libertine", Georgia, serif' }}
          >
            Battles
          </h2>
          <p className="text-xs text-wiki-textMuted mt-0.5">
            {battles.length} battle{battles.length !== 1 ? 's' : ''} in database
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={exportAll}
            disabled={saving || battles.length === 0}
            className="px-3 py-1.5 text-xs bg-wiki-parchmentDk border border-wiki-border rounded hover:bg-wiki-hillShade transition-colors disabled:opacity-50"
          >
            Export All to JSON
          </button>
          <button
            onClick={goToNewBattle}
            className="px-3 py-1.5 text-xs bg-un text-white rounded hover:bg-un-muted transition-colors"
          >
            + New Battle
          </button>
        </div>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded text-xs text-red-800">
          {error}
        </div>
      )}

      {/* Table */}
      {battles.length === 0 ? (
        <div className="glass-panel p-8 text-center text-wiki-textMuted">
          <p className="text-3xl mb-2">🗺️</p>
          <p className="font-semibold text-wiki-text">No battles yet</p>
          <p className="text-xs mt-1">Create your first battle to get started.</p>
        </div>
      ) : (
        <div className="glass-panel overflow-hidden">
          <table className="w-full text-xs">
            <thead>
              <tr className="bg-wiki-parchmentDk/50 border-b border-wiki-border">
                <th className="text-left px-3 py-2 font-semibold text-wiki-text">Name</th>
                <th className="text-left px-3 py-2 font-semibold text-wiki-text">Theater</th>
                <th className="text-left px-3 py-2 font-semibold text-wiki-text">Dates</th>
                <th className="text-left px-3 py-2 font-semibold text-wiki-text">Factions</th>
                <th className="text-right px-3 py-2 font-semibold text-wiki-text">Actions</th>
              </tr>
            </thead>
            <tbody>
              {battles.map((b) => (
                <tr
                  key={b.id}
                  className="border-b border-wiki-border/50 hover:bg-wiki-parchmentDk/30 transition-colors"
                >
                  <td className="px-3 py-2">
                    <button
                      onClick={() => goToEditBattle(b.id)}
                      className="font-semibold text-un hover:underline text-left"
                    >
                      {b.name}
                    </button>
                    <div className="text-[10px] text-wiki-textMuted mt-0.5">{b.id}</div>
                  </td>
                  <td className="px-3 py-2 text-wiki-textMuted">{b.theater}</td>
                  <td className="px-3 py-2 text-wiki-textMuted">{formatDateRange(b.date_range)}</td>
                  <td className="px-3 py-2 text-wiki-textMuted">{b.faction_names.join(', ')}</td>
                  <td className="px-3 py-2 text-right">
                    <div className="flex gap-1 justify-end">
                      <button
                        onClick={() => goToEditBattle(b.id)}
                        className="px-2 py-1 bg-wiki-parchmentDk border border-wiki-border rounded hover:bg-wiki-hillShade transition-colors"
                        title="Edit"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => exportBattle(b.id)}
                        disabled={saving}
                        className="px-2 py-1 bg-wiki-parchmentDk border border-wiki-border rounded hover:bg-wiki-hillShade transition-colors disabled:opacity-50"
                        title="Export to JSON"
                      >
                        Export
                      </button>
                      <button
                        onClick={() => {
                          if (confirm(`Delete "${b.name}"? This cannot be undone.`)) {
                            removeBattle(b.id)
                          }
                        }}
                        disabled={saving}
                        className="px-2 py-1 bg-red-50 border border-red-200 text-red-700 rounded hover:bg-red-100 transition-colors disabled:opacity-50"
                        title="Delete"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
