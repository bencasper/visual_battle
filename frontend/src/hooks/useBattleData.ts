import { useEffect } from 'react'
import { useBattleStore } from '@/store/useBattleStore'
import { useTimelineStore } from '@/store/useTimelineStore'

/**
 * Loads a battle by ID and syncs the total phase count into the timeline store.
 * Falls back to local JSON if the API is unavailable.
 */
export function useBattleData(battleId: string) {
  const { activeBattle, terrain, loading, error, loadBattle } = useBattleStore()
  const setTotalPhases = useTimelineStore((s) => s.setTotalPhases)

  useEffect(() => {
    if (battleId) {
      loadBattle(battleId)
    }
  }, [battleId, loadBattle])

  useEffect(() => {
    if (activeBattle?.phases) {
      setTotalPhases(activeBattle.phases.length)
    }
  }, [activeBattle, setTotalPhases])

  return { battle: activeBattle, terrain, loading, error }
}
