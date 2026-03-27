import type { Battle, BattleListItem, Phase } from './battle'

export interface ApiResponse<T> {
  data: T
  error?: never
}

export interface ApiError {
  data?: never
  error: {
    status: number
    message: string
    detail?: string
  }
}

export type ApiResult<T> = ApiResponse<T> | ApiError

export type BattleListResponse = BattleListItem[]

export interface BattlePhasesResponse {
  battle_id: string
  phase_count: number
  phases: Phase[]
}

export interface HealthResponse {
  status: 'ok' | 'error'
  battles_loaded: number
}
