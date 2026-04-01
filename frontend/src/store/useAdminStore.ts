/**
 * Admin store — manages CRUD state for the battle editor.
 * Separate from the viewer's useBattleStore to avoid coupling.
 */

import { create } from 'zustand'
import type { Battle, BattleListItem, Phase } from '@/types/battle'
import * as api from '@/api/adminApi'

// ── Types ────────────────────────────────────────────────────────────────────

type AdminView = 'list' | 'edit-battle' | 'edit-phase'

interface Toast {
  id: number
  type: 'success' | 'error' | 'info'
  message: string
}

interface AdminState {
  // Navigation
  view: AdminView
  editingBattleId: string | null
  editingPhaseId: string | null

  // Data
  battles: BattleListItem[]
  activeBattle: Battle | null
  activePhase: Phase | null

  // Status
  loading: boolean
  saving: boolean
  error: string | null
  toasts: Toast[]

  // Dirty tracking
  dirty: boolean
}

interface AdminActions {
  // Navigation
  goToList: () => void
  goToEditBattle: (id: string) => void
  goToEditPhase: (battleId: string, phaseId: string) => void
  goToNewBattle: () => void

  // Data fetching
  loadBattles: () => Promise<void>
  loadBattle: (id: string) => Promise<void>

  // Battle CRUD
  saveBattle: (data: Record<string, unknown>) => Promise<void>
  createBattle: (data: Record<string, unknown>) => Promise<string>
  removeBattle: (id: string) => Promise<void>

  // Phase CRUD
  savePhase: (data: Record<string, unknown>) => Promise<void>
  createPhase: (data: Record<string, unknown>) => Promise<void>
  removePhase: (phaseId: string) => Promise<void>

  // Export
  exportBattle: (id: string) => Promise<void>
  exportAll: () => Promise<void>

  // UI
  setDirty: (dirty: boolean) => void
  addToast: (type: Toast['type'], message: string) => void
  dismissToast: (id: number) => void
  clearError: () => void
}

let toastCounter = 0

// ── Store ────────────────────────────────────────────────────────────────────

export const useAdminStore = create<AdminState & AdminActions>((set, get) => ({
  // State
  view: 'list',
  editingBattleId: null,
  editingPhaseId: null,
  battles: [],
  activeBattle: null,
  activePhase: null,
  loading: false,
  saving: false,
  error: null,
  toasts: [],
  dirty: false,

  // ── Navigation ──────────────────────────────────────────────────────────

  goToList: () => set({
    view: 'list',
    editingBattleId: null,
    editingPhaseId: null,
    activeBattle: null,
    activePhase: null,
    dirty: false,
    error: null,
  }),

  goToEditBattle: async (id: string) => {
    set({ view: 'edit-battle', editingBattleId: id, editingPhaseId: null, activePhase: null, dirty: false, error: null })
    await get().loadBattle(id)
  },

  goToEditPhase: async (battleId: string, phaseId: string) => {
    set({ view: 'edit-phase', editingBattleId: battleId, editingPhaseId: phaseId, dirty: false, error: null })
    if (!get().activeBattle || get().activeBattle!.id !== battleId) {
      await get().loadBattle(battleId)
    }
    const battle = get().activeBattle
    if (battle) {
      const phase = battle.phases.find((p) => p.id === phaseId) ?? null
      set({ activePhase: phase })
    }
  },

  goToNewBattle: () => set({
    view: 'edit-battle',
    editingBattleId: null,
    editingPhaseId: null,
    activeBattle: null,
    activePhase: null,
    dirty: false,
    error: null,
  }),

  // ── Data fetching ───────────────────────────────────────────────────────

  loadBattles: async () => {
    set({ loading: true, error: null })
    try {
      const battles = await api.listBattles()
      set({ battles, loading: false })
    } catch (err) {
      set({ error: String(err), loading: false })
    }
  },

  loadBattle: async (id: string) => {
    set({ loading: true, error: null })
    try {
      const battle = await api.getBattle(id)
      set({ activeBattle: battle, loading: false })
    } catch (err) {
      set({ error: String(err), loading: false })
    }
  },

  // ── Battle CRUD ─────────────────────────────────────────────────────────

  saveBattle: async (data: Record<string, unknown>) => {
    const { editingBattleId } = get()
    if (!editingBattleId) return
    set({ saving: true, error: null })
    try {
      const updated = await api.updateBattle(editingBattleId, data)
      set({ activeBattle: updated, saving: false, dirty: false })
      get().addToast('success', 'Battle saved')
      // Refresh list in background
      get().loadBattles()
    } catch (err) {
      set({ error: String(err), saving: false })
      get().addToast('error', `Save failed: ${err}`)
    }
  },

  createBattle: async (data: Record<string, unknown>) => {
    set({ saving: true, error: null })
    try {
      const battle = await api.createBattle(data)
      set({
        activeBattle: battle,
        editingBattleId: battle.id,
        view: 'edit-battle',
        saving: false,
        dirty: false,
      })
      get().addToast('success', `Created battle: ${battle.name}`)
      get().loadBattles()
      return battle.id
    } catch (err) {
      set({ error: String(err), saving: false })
      get().addToast('error', `Create failed: ${err}`)
      throw err
    }
  },

  removeBattle: async (id: string) => {
    set({ saving: true, error: null })
    try {
      await api.deleteBattle(id)
      set({ saving: false })
      get().addToast('success', 'Battle deleted')
      get().goToList()
      get().loadBattles()
    } catch (err) {
      set({ error: String(err), saving: false })
      get().addToast('error', `Delete failed: ${err}`)
    }
  },

  // ── Phase CRUD ──────────────────────────────────────────────────────────

  savePhase: async (data: Record<string, unknown>) => {
    const { editingBattleId, editingPhaseId } = get()
    if (!editingBattleId || !editingPhaseId) return
    set({ saving: true, error: null })
    try {
      await api.updatePhase(editingBattleId, editingPhaseId, data)
      set({ saving: false, dirty: false })
      get().addToast('success', 'Phase saved')
      await get().loadBattle(editingBattleId)
      const battle = get().activeBattle
      if (battle) {
        set({ activePhase: battle.phases.find((p) => p.id === editingPhaseId) ?? null })
      }
    } catch (err) {
      set({ error: String(err), saving: false })
      get().addToast('error', `Save failed: ${err}`)
    }
  },

  createPhase: async (data: Record<string, unknown>) => {
    const { editingBattleId } = get()
    if (!editingBattleId) return
    set({ saving: true, error: null })
    try {
      await api.createPhase(editingBattleId, data)
      set({ saving: false })
      get().addToast('success', 'Phase created')
      await get().loadBattle(editingBattleId)
    } catch (err) {
      set({ error: String(err), saving: false })
      get().addToast('error', `Create failed: ${err}`)
    }
  },

  removePhase: async (phaseId: string) => {
    const { editingBattleId } = get()
    if (!editingBattleId) return
    set({ saving: true, error: null })
    try {
      await api.deletePhase(editingBattleId, phaseId)
      set({ saving: false, editingPhaseId: null, activePhase: null, view: 'edit-battle' })
      get().addToast('success', 'Phase deleted')
      await get().loadBattle(editingBattleId)
    } catch (err) {
      set({ error: String(err), saving: false })
      get().addToast('error', `Delete failed: ${err}`)
    }
  },

  // ── Export ──────────────────────────────────────────────────────────────

  exportBattle: async (id: string) => {
    set({ saving: true })
    try {
      const result = await api.exportBattle(id)
      set({ saving: false })
      get().addToast('success', `Exported to ${result.files_written.length} file(s)`)
    } catch (err) {
      set({ saving: false })
      get().addToast('error', `Export failed: ${err}`)
    }
  },

  exportAll: async () => {
    set({ saving: true })
    try {
      const result = await api.exportAllBattles()
      set({ saving: false })
      get().addToast('success', `Exported ${result.exported} battle(s)`)
    } catch (err) {
      set({ saving: false })
      get().addToast('error', `Export failed: ${err}`)
    }
  },

  // ── UI helpers ──────────────────────────────────────────────────────────

  setDirty: (dirty: boolean) => set({ dirty }),

  addToast: (type, message) => {
    const id = ++toastCounter
    set((s) => ({ toasts: [...s.toasts, { id, type, message }] }))
    // Auto-dismiss after 4 seconds
    setTimeout(() => get().dismissToast(id), 4000)
  },

  dismissToast: (id: number) =>
    set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })),

  clearError: () => set({ error: null }),
}))
