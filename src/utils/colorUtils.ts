import type { Faction } from '@/types/battle'

/** Return a CSS rgba string from a hex color + alpha */
export function hexToRgba(hex: string, alpha = 1): string {
  const r = parseInt(hex.slice(1, 3), 16)
  const g = parseInt(hex.slice(3, 5), 16)
  const b = parseInt(hex.slice(5, 7), 16)
  return `rgba(${r}, ${g}, ${b}, ${alpha})`
}

/** Darken a hex color by a percentage (0–1) */
export function darken(hex: string, amount = 0.2): string {
  const r = Math.max(0, parseInt(hex.slice(1, 3), 16) * (1 - amount))
  const g = Math.max(0, parseInt(hex.slice(3, 5), 16) * (1 - amount))
  const b = Math.max(0, parseInt(hex.slice(5, 7), 16) * (1 - amount))
  return `#${Math.round(r).toString(16).padStart(2, '0')}${Math.round(g).toString(16).padStart(2, '0')}${Math.round(b).toString(16).padStart(2, '0')}`
}

/** Map strength percentage (0–1) to a traffic-light color */
export function strengthColor(pct: number): string {
  if (pct >= 0.75) return '#22c55e' // green
  if (pct >= 0.50) return '#f59e0b' // amber
  if (pct >= 0.25) return '#ef4444' // red
  return '#7f1d1d'                  // dark red — critical
}

/** Get faction color with optional alpha */
export function factionColor(faction: Faction, alpha = 1): string {
  return hexToRgba(faction.color, alpha)
}

/** Get a color for a posture */
export function postureColor(posture: string): string {
  const map: Record<string, string> = {
    advancing: '#22c55e',
    attacking: '#ef4444',
    attacking_south: '#f97316',
    defending: '#3b82f6',
    holding: '#6366f1',
    encircled: '#dc2626',
    retreating: '#f59e0b',
    pursuing: '#ec4899',
    blocking: '#8b5cf6',
    evacuating: '#14b8a6',
    consolidating: '#64748b',
    moving: '#a3e635',
    infiltrating: '#d97706',
  }
  return map[posture] ?? '#94a3b8'
}
