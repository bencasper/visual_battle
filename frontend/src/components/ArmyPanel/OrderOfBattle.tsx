import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import type { OrderOfBattleProps } from './ArmyPanel.types'
import type { Phase, Unit } from '@/types/battle'
import { formatNumber } from '@/utils/formatUtils'
import { WIKI_COLOURS } from '@/utils/wikiMapStyle'

/** Average strength_pct across all positions for a unit in the given phase */
function getUnitStrengthPct(phase: Phase, unitId: string): number | null {
  const up = phase.unit_positions.find((u) => u.unit_id === unitId)
  if (!up || !up.positions.length) return null
  return up.positions.reduce((s, p) => s + p.strength_pct, 0) / up.positions.length
}

// ── NATO milsymbol-style unit size indicators ──────────────────────────────
// These are the standard NATO "frame echelon" marks used on maps
const NATO_SIZE: Record<string, { symbol: string; label: string }> = {
  hq:                  { symbol: '★', label: 'HQ' },
  infantry_division:   { symbol: 'X', label: 'Div' },
  infantry_regiment:   { symbol: 'III', label: 'Rgt' },
  infantry_battalion:  { symbol: 'II', label: 'Bn' },
  infantry_company:    { symbol: 'I', label: 'Co' },
  infantry_task_force: { symbol: 'III', label: 'TF' },
  army_corps:          { symbol: 'XX', label: 'Corps' },
  commando:            { symbol: 'II', label: 'Cdo' },
  artillery_regiment:  { symbol: 'III', label: 'Arty' },
  artillery_battalion: { symbol: 'II', label: 'FA Bn' },
  armor_company:       { symbol: 'I', label: 'Arm' },
  air_wing:            { symbol: '⊕', label: 'Air' },
}

// NATO branch fill icons (simplified text glyphs for small size)
const NATO_BRANCH: Record<string, string> = {
  hq:                  '★',
  infantry_division:   '╳',
  infantry_regiment:   '╳',
  infantry_battalion:  '╳',
  infantry_company:    '╳',
  infantry_task_force: '╳',
  army_corps:          '╳',
  commando:            '╳',
  artillery_regiment:  '●',
  artillery_battalion: '●',
  armor_company:       '○',
  air_wing:            '∿',
}

const SUPPLY_COLOR: Record<string, string> = {
  full:     '#22c55e',
  adequate: '#86efac',
  low:      '#facc15',
  critical: '#f97316',
  depleted: '#ef4444',
}

const SUPPLY_LABEL: Record<string, string> = {
  full:     'Full',
  adequate: 'OK',
  low:      'Low',
  critical: 'Crit',
  depleted: 'Dep',
}

interface UnitRowProps {
  unit: Unit
  children?: Unit[]
  side: 'un' | 'pva'
  depth?: number
  effectiveStrength: number | null
  strengthMap: Map<string, number>
}

function UnitRow({ unit, children, side, depth = 0, effectiveStrength, strengthMap }: UnitRowProps) {
  const { t } = useTranslation()
  const [open, setOpen] = useState(false)
  const hasChildren = children && children.length > 0
  const accentColor = side === 'un' ? WIKI_COLOURS.unBlue : WIKI_COLOURS.pvaRed
  const accentLight = side === 'un' ? WIKI_COLOURS.unBlueLight : WIKI_COLOURS.pvaRedLight

  const sizeInfo = NATO_SIZE[unit.type] ?? { symbol: '–', label: unit.type }
  const branchGlyph = NATO_BRANCH[unit.type] ?? '╳'
  const supplyColor = SUPPLY_COLOR[unit.supply_status] ?? '#9ca3af'
  const supplyLabel = unit.supply_status in SUPPLY_LABEL
    ? t(`supply.short.${unit.supply_status}`)
    : unit.supply_status
  const moraleWidth = Math.round(unit.morale * 100)

  return (
    <div>
      {/* Row */}
      <div
        className="group flex items-start gap-1.5 rounded px-1 py-1 cursor-pointer select-none transition-colors"
        style={{
          marginLeft: depth * 10,
          backgroundColor: open ? `${accentColor}10` : 'transparent',
        }}
        onClick={() => setOpen((v) => !v)}
        title={unit.notes}
      >
        {/* Expand toggle */}
        <div className="mt-0.5 w-3 shrink-0 text-[8px] text-wiki-textMuted font-mono">
          {hasChildren ? (open ? '▾' : '▸') : ' '}
        </div>

        {/* NATO milsymbol box */}
        <div
          className="shrink-0 flex flex-col items-center justify-center rounded-sm border"
          style={{
            width: 22,
            height: 16,
            borderColor: accentColor,
            backgroundColor: `${accentColor}18`,
            color: accentColor,
          }}
        >
          <span className="text-[7px] leading-none font-bold font-mono">{branchGlyph}</span>
        </div>

        {/* Name + meta */}
        <div className="flex-1 min-w-0">
          <div className="flex items-baseline gap-1 flex-wrap">
            {/* Echelon badge */}
            <span
              className="text-[7px] font-mono font-bold px-0.5 rounded leading-none"
              style={{ color: accentLight, background: `${accentColor}15` }}
            >
              {sizeInfo.symbol}
            </span>
            <span className="text-[10px] font-semibold text-wiki-text leading-tight truncate">
              {unit.short_name ?? unit.name}
            </span>
          </div>

          {/* Commander */}
          <p className="text-[9px] text-wiki-textMuted leading-tight truncate mt-0.5">
            {unit.commander}
          </p>
        </div>

        {/* Right column: strength + supply dot */}
        <div className="shrink-0 flex flex-col items-end gap-0.5">
          <span className="text-[9px] font-mono text-wiki-textMuted">
            {effectiveStrength !== null
              ? formatNumber(Math.round(effectiveStrength))
              : formatNumber(unit.strength)}
          </span>
          <span
            className="text-[7px] font-bold rounded-sm px-0.5 leading-none"
            style={{ color: supplyColor, background: `${supplyColor}22` }}
          >
            {supplyLabel}
          </span>
        </div>
      </div>

      {/* Expanded detail card */}
      {open && (
        <div
          className="mx-1 mb-1 rounded px-2 py-1.5 text-[9px] border-l-2"
          style={{
            marginLeft: depth * 10 + 4,
            borderLeftColor: accentColor,
            background: `${accentColor}08`,
          }}
        >
          {/* Location */}
          {unit.location_label && (
            <p className="text-wiki-textMuted mb-1">
              📍 <span className="text-wiki-text font-medium">{unit.location_label}</span>
            </p>
          )}

          {/* Morale bar */}
          <div className="flex items-center gap-1.5 mb-1">
            <span className="text-wiki-textMuted w-9">{t('oob.morale')}</span>
            <div className="flex-1 h-1 bg-wiki-hillShade rounded-full overflow-hidden">
              <div
                className="h-full rounded-full"
                style={{ width: `${moraleWidth}%`, backgroundColor: accentLight }}
              />
            </div>
            <span className="text-wiki-textMuted w-6 text-right">{moraleWidth}%</span>
          </div>

          {/* Notes */}
          {unit.notes && (
            <p className="text-wiki-textMuted leading-snug mt-1">{unit.notes}</p>
          )}
        </div>
      )}

      {/* Child units (indented) */}
      {open && hasChildren && (
        <div>
          {children!.map((child) => (
            <UnitRow
              key={child.id}
              unit={child}
              side={side}
              depth={depth + 1}
              effectiveStrength={strengthMap.get(child.id) ?? null}
              strengthMap={strengthMap}
            />
          ))}
        </div>
      )}
    </div>
  )
}

export function OrderOfBattle({ faction, currentPhase }: OrderOfBattleProps) {
  const { t } = useTranslation()
  const [showAll, setShowAll] = useState(false)
  const side = faction.side.toLowerCase() as 'un' | 'pva'
  const accentColor = side === 'un' ? WIKI_COLOURS.unBlue : WIKI_COLOURS.pvaRed

  // Build unitId → effective strength map for this phase
  const strengthMap = new Map<string, number>()
  for (const unit of faction.units) {
    const pct = getUnitStrengthPct(currentPhase, unit.id)
    if (pct !== null) strengthMap.set(unit.id, Math.round(unit.strength * pct))
  }

  // Build parent → children index
  const childrenOf = new Map<string | null, Unit[]>()
  for (const unit of faction.units) {
    const pid = unit.parent_id ?? null
    if (!childrenOf.has(pid)) childrenOf.set(pid, [])
    childrenOf.get(pid)!.push(unit)
  }

  // Top-level units (no parent, or parent_id not found in this faction)
  const unitIds = new Set(faction.units.map((u) => u.id))
  const topLevel = faction.units.filter(
    (u) => !u.parent_id || !unitIds.has(u.parent_id),
  )

  const INITIAL_SHOW = 4
  const visible = showAll ? topLevel : topLevel.slice(0, INITIAL_SHOW)
  const hiddenCount = topLevel.length - INITIAL_SHOW

  return (
    <div className="mt-3">
      {/* Section header */}
      <div
        className="flex items-center gap-1.5 mb-1.5 pb-1 border-b"
        style={{ borderColor: WIKI_COLOURS.panelBorder }}
      >
        <span
          className="text-[7px] font-bold px-1 py-0.5 rounded uppercase tracking-widest"
          style={{ background: accentColor, color: '#fff' }}
        >
          {t('oob.label')}
        </span>
        <span className="text-[9px] uppercase tracking-widest text-wiki-textMuted font-semibold">
          {t('oob.title')}
        </span>
        <span className="ml-auto text-[9px] text-wiki-textMuted">
          {t('oob.unitCount', { count: faction.units.length })}
        </span>
      </div>

      {/* Unit tree */}
      <div className="space-y-0.5">
      {visible.map((unit) => (
          <UnitRow
            key={unit.id}
            unit={unit}
            children={childrenOf.get(unit.id)}
            side={side}
            effectiveStrength={strengthMap.get(unit.id) ?? null}
            strengthMap={strengthMap}
          />
        ))}
      </div>

      {/* Show more / less toggle */}
      {topLevel.length > INITIAL_SHOW && (
        <button
          onClick={() => setShowAll((v) => !v)}
          className="mt-1.5 text-[9px] font-semibold uppercase tracking-wider hover:underline w-full text-center"
          style={{ color: accentColor }}
        >
          {showAll ? t('oob.showFewer') : t('oob.showMore', { count: hiddenCount })}
        </button>
      )}
    </div>
  )
}
