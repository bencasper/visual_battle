/**
 * /admin page — battle data management UI.
 * Uses the admin store's view state to switch between list/edit sub-views.
 */

import { useAdminStore } from '@/store/useAdminStore'
import { AdminBattleList } from '@/components/Admin/AdminBattleList'
import { BattleEditor } from '@/components/Admin/BattleEditor'
import { PhaseEditor } from '@/components/Admin/PhaseEditor'
import { Toasts } from '@/components/Admin/Toasts'
import { Link } from 'react-router-dom'

export function AdminPage() {
  const view = useAdminStore((s) => s.view)

  return (
    <div className="absolute inset-0 overflow-y-auto bg-wiki-parchment">
      {/* Top bar */}
      <header className="bg-wiki-parchmentDk border-b border-wiki-border px-6 py-2.5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h1
            className="text-sm font-bold text-wiki-text"
            style={{ fontFamily: '"Linux Libertine", Georgia, serif' }}
          >
            Visual Battle Admin
          </h1>
          <span className="text-[10px] bg-un/10 text-un border border-un/20 rounded px-1.5 py-0.5 font-mono">
            CRUD Editor
          </span>
        </div>
        <Link
          to="/battles"
          className="text-xs text-un hover:underline"
        >
          View Battles &rarr;
        </Link>
      </header>

      {/* Content */}
      <main className="max-w-5xl mx-auto px-6 py-6">
        {view === 'list' && <AdminBattleList />}
        {view === 'edit-battle' && <BattleEditor />}
        {view === 'edit-phase' && <PhaseEditor />}
      </main>

      <Toasts />
    </div>
  )
}
