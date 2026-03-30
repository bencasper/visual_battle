import { create } from 'zustand'

type ActivePanel = 'army' | 'weapons' | 'strategy' | 'insights' | null

interface UIState {
  activePanel: ActivePanel
  selectedFactionId: string | null
  selectedUnitId: string | null
  selectedUnitAnchor: { x: number; y: number } | null
  showTerrain: boolean
  showAnnotations: boolean
  mapBearing: number
  mapZoom: number
  mapPitch: number
  sidebarCollapsed: boolean
  is3D: boolean
}

interface UIActions {
  togglePanel: (panel: ActivePanel) => void
  closePanel: () => void
  selectFaction: (id: string | null) => void
  selectUnit: (id: string | null, anchor?: { x: number; y: number }) => void
  toggleTerrain: () => void
  toggleAnnotations: () => void
  setMapView: (view: Partial<Pick<UIState, 'mapBearing' | 'mapZoom' | 'mapPitch'>>) => void
  toggleSidebar: () => void
  toggle3D: () => void
}

export const useUIStore = create<UIState & UIActions>((set, get) => ({
  activePanel: null,
  selectedFactionId: null,
  selectedUnitId: null,
  selectedUnitAnchor: null,
  showTerrain: true,
  showAnnotations: true,
  mapBearing: 0,
  mapZoom: 10,
  mapPitch: 0,
  sidebarCollapsed: false,
  is3D: false,

  togglePanel: (panel) =>
    set((s) => ({ activePanel: s.activePanel === panel ? null : panel })),

  closePanel: () => set({ activePanel: null }),

  selectFaction: (id) => set({ selectedFactionId: id }),

  selectUnit: (id, anchor) => set({ selectedUnitId: id, selectedUnitAnchor: anchor ?? null }),

  toggleTerrain: () => set((s) => ({ showTerrain: !s.showTerrain })),

  toggleAnnotations: () => set((s) => ({ showAnnotations: !s.showAnnotations })),

  setMapView: (view) => set(view),

  toggleSidebar: () => set((s) => ({ sidebarCollapsed: !s.sidebarCollapsed })),

  toggle3D: () => set((s) => ({ is3D: !s.is3D })),
}))
