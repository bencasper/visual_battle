/**
 * Admin API client — wraps fetch calls to the CRUD endpoints.
 * Returns typed results; throws on network errors.
 */

import type { Battle, BattleListItem, Phase } from '@/types/battle'

const API_BASE = import.meta.env.VITE_API_URL ?? '/api/v1'

// ── Helpers ──────────────────────────────────────────────────────────────────

async function jsonOrThrow<T>(res: Response): Promise<T> {
  const ct = res.headers.get('content-type') ?? ''
  if (!ct.includes('application/json')) {
    throw new Error(`Expected JSON but got ${ct || 'unknown content-type'} (HTTP ${res.status})`)
  }
  if (!res.ok) {
    const body = await res.json().catch(() => ({}))
    throw new Error(body.detail ?? `HTTP ${res.status}`)
  }
  return res.json() as Promise<T>
}

async function fetchJson<T>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, {
    ...init,
    headers: { 'Content-Type': 'application/json', ...init?.headers },
  })
  return jsonOrThrow<T>(res)
}

// ── Battle endpoints ─────────────────────────────────────────────────────────

export async function listBattles(): Promise<BattleListItem[]> {
  return fetchJson<BattleListItem[]>(`${API_BASE}/battles`)
}

export async function getBattle(id: string): Promise<Battle> {
  return fetchJson<Battle>(`${API_BASE}/battles/${id}`)
}

export async function createBattle(data: Record<string, unknown>): Promise<Battle> {
  return fetchJson<Battle>(`${API_BASE}/battles`, {
    method: 'POST',
    body: JSON.stringify(data),
  })
}

export async function updateBattle(id: string, data: Record<string, unknown>): Promise<Battle> {
  return fetchJson<Battle>(`${API_BASE}/battles/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  })
}

export async function deleteBattle(id: string): Promise<void> {
  const res = await fetch(`${API_BASE}/battles/${id}`, { method: 'DELETE' })
  if (!res.ok) {
    const body = await res.json().catch(() => ({}))
    throw new Error(body.detail ?? `HTTP ${res.status}`)
  }
}

// ── Phase endpoints ──────────────────────────────────────────────────────────

export async function getPhases(battleId: string): Promise<{ battle_id: string; phase_count: number; phases: Phase[] }> {
  return fetchJson(`${API_BASE}/battles/${battleId}/phases`)
}

export async function createPhase(battleId: string, data: Record<string, unknown>): Promise<Phase> {
  return fetchJson<Phase>(`${API_BASE}/battles/${battleId}/phases`, {
    method: 'POST',
    body: JSON.stringify(data),
  })
}

export async function updatePhase(battleId: string, phaseId: string, data: Record<string, unknown>): Promise<Phase> {
  return fetchJson<Phase>(`${API_BASE}/battles/${battleId}/phases/${phaseId}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  })
}

export async function deletePhase(battleId: string, phaseId: string): Promise<void> {
  const res = await fetch(`${API_BASE}/battles/${battleId}/phases/${phaseId}`, { method: 'DELETE' })
  if (!res.ok) {
    const body = await res.json().catch(() => ({}))
    throw new Error(body.detail ?? `HTTP ${res.status}`)
  }
}

// ── Export endpoints ─────────────────────────────────────────────────────────

export interface ExportResult {
  battle_id: string
  slug: string
  files_written: string[]
}

export async function exportBattle(battleId: string): Promise<ExportResult> {
  return fetchJson<ExportResult>(`${API_BASE}/export/battles/${battleId}`, {
    method: 'POST',
  })
}

export async function exportAllBattles(): Promise<{ exported: number; battles: ExportResult[] }> {
  return fetchJson(`${API_BASE}/export/battles`, { method: 'POST' })
}
