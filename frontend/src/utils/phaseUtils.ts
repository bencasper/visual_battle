import type { Phase, UnitPosition, UnitPositionItem } from '@/types/battle'

/** Get a faction's unit positions for a given phase */
export function getUnitPositions(phase: Phase, factionId: string): UnitPosition[] {
  return phase.unit_positions.filter((up) => up.faction_id === factionId)
}

/** Get all position items for a specific unit in a phase */
export function getUnitPositionItems(phase: Phase, unitId: string): UnitPositionItem[] {
  const up = phase.unit_positions.find((u) => u.unit_id === unitId)
  return up?.positions ?? []
}

/** Interpolate strength_pct between two phases for a unit (for smooth animations) */
export function interpolateStrength(
  fromPhase: Phase,
  toPhase: Phase,
  unitId: string,
  t: number, // 0–1
): number {
  const fromPositions = getUnitPositionItems(fromPhase, unitId)
  const toPositions = getUnitPositionItems(toPhase, unitId)

  if (!fromPositions.length || !toPositions.length) return 1

  const fromAvg = fromPositions.reduce((s, p) => s + p.strength_pct, 0) / fromPositions.length
  const toAvg = toPositions.reduce((s, p) => s + p.strength_pct, 0) / toPositions.length
  return fromAvg + (toAvg - fromAvg) * t
}

/** Get overall faction strength percentage for the current phase */
export function getFactionStrengthPct(phase: Phase, factionId: string): number {
  const positions = getUnitPositions(phase, factionId)
  if (!positions.length) return 1

  const allItems = positions.flatMap((p) => p.positions)
  if (!allItems.length) return 1

  return allItems.reduce((s, p) => s + p.strength_pct, 0) / allItems.length
}

/** Return the total phases count for a battle */
export function phaseCount(phases: Phase[]): number {
  return phases.length
}

/** Find the phase with the most critical event for a given faction */
export function getMostSignificantEvents(phase: Phase) {
  return phase.events
    .filter((e) => e.significance === 'critical')
    .sort((a, b) => a.timestamp_offset_hours - b.timestamp_offset_hours)
}
