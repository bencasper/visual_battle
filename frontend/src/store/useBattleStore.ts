import { create } from 'zustand'
import type { Battle, BattleListItem } from '@/types/battle'
import type { TerrainCollection } from '@/types/geojson'

interface BattleState {
  activeBattle: Battle | null
  battleList: BattleListItem[]
  terrain: TerrainCollection | null
  loading: boolean
  error: string | null
}

interface BattleActions {
  loadBattle: (id: string) => Promise<void>
  loadBattleList: () => Promise<void>
  clearBattle: () => void
}

const API_BASE = import.meta.env.VITE_API_URL ?? '/api/v1'

export const useBattleStore = create<BattleState & BattleActions>((set) => ({
  activeBattle: null,
  battleList: [],
  terrain: null,
  loading: false,
  error: null,

  loadBattleList: async () => {
    try {
      set({ loading: true, error: null })
      const res = await fetch(`${API_BASE}/battles`)
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const data: BattleListItem[] = await res.json()
      set({ battleList: data, loading: false })
    } catch {
      // API unavailable — build a minimal list from the local JSON file
      try {
        const res = await fetch('/data/battles/chosin-reservoir.json', { cache: 'no-store' })
        if (!res.ok) throw new Error('local data missing')
        const battle = await res.json()
        const item: BattleListItem = {
          id:            battle.id,
          name:          battle.name,
          slug:          battle.slug,
          theater:       battle.theater,
          date_range:    battle.date_range,
          location:      battle.location,
          outcome:       battle.outcome,
          faction_names: battle.factions.map((f: { name: string }) => f.name),
        }
        set({ battleList: [item], loading: false })
      } catch (fallbackErr) {
        set({ error: String(fallbackErr), loading: false })
      }
    }
  },

  loadBattle: async (id: string) => {
    try {
      set({ loading: true, error: null })

      // Fetch battle from API; fall back to /public JSON if API unavailable
      let battle: Battle
      try {
        const res = await fetch(`${API_BASE}/battles/${id}`)
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
        battle = await res.json()
      } catch {
        // Local fallback for development without backend
        const slug = id.replace(/-\d{4}$/, '')
        const res = await fetch(`/data/battles/${slug}.json`, { cache: 'no-store' })
        if (!res.ok) throw new Error(`Battle data not found: ${slug}`)
        battle = await res.json() as Battle
      }

      // Load terrain GeoJSON — fetch from /public so MapLibre gets a plain object
      // (dynamic import via Vite can produce non-serializable module wrappers that
      // confuse MapLibre's worker postMessage, causing "Unimplemented type: 4")
      let terrain: TerrainCollection | null = null
      try {
        const slug = battle.slug
        const res = await fetch(`/data/battles/${slug}-terrain.json`, { cache: 'no-store' })
        if (res.ok) terrain = await res.json() as TerrainCollection
      } catch {
        // Terrain is optional
      }

      set({ activeBattle: battle, terrain, loading: false })
    } catch (err) {
      set({ error: String(err), loading: false })
    }
  },

  clearBattle: () => set({ activeBattle: null, terrain: null, error: null }),
}))
