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
    } catch (err) {
      set({ error: String(err), loading: false })
    }
  },

  loadBattle: async (id: string) => {
    try {
      set({ loading: true, error: null })

      // Fetch battle from API; fall back to local JSON if API unavailable
      let battle: Battle
      try {
        const res = await fetch(`${API_BASE}/battles/${id}`)
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
        battle = await res.json()
      } catch {
        // Local fallback for development without backend
        const local = await import(`@/data/battles/${id.replace(/-\d{4}$/, '')}.json`)
        battle = local.default as Battle
      }

      // Load terrain GeoJSON
      let terrain: TerrainCollection | null = null
      try {
        const slug = battle.slug
        const terrainMod = await import(`@/data/battles/terrain/${slug}-terrain.geojson`)
        terrain = terrainMod.default as TerrainCollection
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
