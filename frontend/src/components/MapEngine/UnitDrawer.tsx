import { motion } from 'framer-motion'
import type { Unit, Faction } from '@/types/battle'
import { WIKI_COLOURS } from '@/utils/wikiMapStyle'
import { formatNumber } from '@/utils/formatUtils'

interface UnitDrawerProps {
  unit: Unit
  faction: Faction
  positionLabel?: string
  posture?: string
  strengthPct?: number
  anchor: { x: number; y: number }
  onClose: () => void
}

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

const NATO_SIZE: Record<string, string> = {
  hq:                  '★',
  infantry_division:   'X',
  infantry_regiment:   'III',
  infantry_battalion:  'II',
  infantry_company:    'I',
  infantry_task_force: 'III',
  army_corps:          'XX',
  commando:            'II',
  artillery_regiment:  'III',
  artillery_battalion: 'II',
  armor_company:       'I',
  air_wing:            '⊕',
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
  adequate: 'Adequate',
  low:      'Low',
  critical: 'Critical',
  depleted: 'Depleted',
}

const NATION_FLAG: Record<string, string> = {
  US:           '🇺🇸',
  UK:           '🇬🇧',
  'South Korea': '🇰🇷',
  China:        '🇨🇳',
}

export function UnitDrawer({ unit, faction, positionLabel, posture, strengthPct, anchor, onClose }: UnitDrawerProps) {
  const DRAWER_W = 264
  const DRAWER_H = 260 // approximate max height
  const OFFSET   = 12  // gap from marker

  // Position to the right of the click; flip left if near right edge
  const flipLeft = anchor.x + OFFSET + DRAWER_W > window.innerWidth - 8
  const left = flipLeft
    ? anchor.x - OFFSET - DRAWER_W
    : anchor.x + OFFSET

  // Centre vertically on the click; clamp so it never bleeds off screen
  const rawTop = anchor.y - DRAWER_H / 2
  const clampedTop = Math.max(8, Math.min(rawTop, window.innerHeight - DRAWER_H - 8))

  const accentColor = faction.color
  const accentLight = faction.color_light
  const branchGlyph = NATO_BRANCH[unit.type] ?? '╳'
  const sizeSymbol  = NATO_SIZE[unit.type]  ?? '–'
  const supplyColor = SUPPLY_COLOR[unit.supply_status] ?? '#9ca3af'
  const supplyLabel = SUPPLY_LABEL[unit.supply_status] ?? unit.supply_status
  const moraleWidth = Math.round(unit.morale * 100)
  const strWidth    = strengthPct != null ? Math.round(strengthPct * 100) : 100
  const flag        = unit.nation ? (NATION_FLAG[unit.nation] ?? '') : ''

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 16 }}
      transition={{ duration: 0.18, ease: 'easeOut' }}
      style={{
        position: 'fixed',
        top: clampedTop,
        left,
        width: DRAWER_W,
        zIndex: 30,
        background: WIKI_COLOURS.panelBg,
        border: `1px solid ${accentColor}55`,
        borderRadius: 6,
        boxShadow: '0 4px 20px rgba(0,0,0,0.25)',
        overflow: 'hidden',
      }}
    >
      {/* Header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          padding: '8px 10px 6px',
          borderBottom: `1px solid ${accentColor}30`,
          background: `${accentColor}12`,
        }}
      >
        {/* NATO box */}
        <div
          style={{
            flexShrink: 0,
            width: 26,
            height: 18,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            border: `2px solid ${accentColor}`,
            borderRadius: 2,
            background: accentColor,
          }}
        >
          <span style={{ fontSize: 8, color: '#fff', fontWeight: 700, fontFamily: 'monospace' }}>
            {branchGlyph}
          </span>
        </div>

        {/* Size + name */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 4 }}>
            <span style={{ fontSize: 8, fontWeight: 700, color: accentLight, fontFamily: 'monospace' }}>
              {sizeSymbol}
            </span>
            <span style={{ fontSize: 11, fontWeight: 700, color: WIKI_COLOURS.panelText, lineHeight: 1.2 }}>
              {unit.short_name ?? unit.name}
            </span>
          </div>
          {flag && (
            <span style={{ fontSize: 9, color: WIKI_COLOURS.panelText }}>{flag} {unit.nation}</span>
          )}
        </div>

        {/* Close */}
        <button
          onClick={onClose}
          style={{
            flexShrink: 0,
            fontSize: 13,
            lineHeight: 1,
            color: WIKI_COLOURS.panelText,
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            opacity: 0.5,
            padding: '2px 4px',
          }}
          onMouseEnter={e => (e.currentTarget.style.opacity = '1')}
          onMouseLeave={e => (e.currentTarget.style.opacity = '0.5')}
        >
          ✕
        </button>
      </div>

      {/* Body */}
      <div style={{ padding: '8px 10px', display: 'flex', flexDirection: 'column', gap: 5 }}>

        {/* Commander */}
        <Row label="Commander" value={unit.commander} />
        {unit.deputy_commander && <Row label="Deputy" value={unit.deputy_commander} />}

        {/* Location + posture */}
        {positionLabel && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ fontSize: 9, color: WIKI_COLOURS.panelText, opacity: 0.5, width: 62, flexShrink: 0 }}>Location</span>
            <span style={{ fontSize: 9, color: WIKI_COLOURS.panelText, fontWeight: 600 }}>{positionLabel}</span>
            {posture && (
              <span style={{
                marginLeft: 'auto',
                fontSize: 7,
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                color: accentLight,
                background: `${accentColor}18`,
                padding: '1px 4px',
                borderRadius: 3,
                flexShrink: 0,
              }}>
                {posture.replace(/_/g, ' ')}
              </span>
            )}
          </div>
        )}

        {/* Strength bar */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{ fontSize: 9, color: WIKI_COLOURS.panelText, opacity: 0.5, width: 62, flexShrink: 0 }}>Strength</span>
          <span style={{ fontSize: 9, color: WIKI_COLOURS.panelText, fontWeight: 600, width: 36, flexShrink: 0 }}>
            {formatNumber(unit.strength)}
          </span>
          <div style={{ flex: 1, height: 4, background: WIKI_COLOURS.parchmentDk, borderRadius: 2, overflow: 'hidden' }}>
            <div style={{ height: '100%', width: `${strWidth}%`, background: accentLight, borderRadius: 2 }} />
          </div>
          <span style={{ fontSize: 9, color: WIKI_COLOURS.panelText, opacity: 0.5, width: 26, textAlign: 'right', flexShrink: 0 }}>
            {strWidth}%
          </span>
        </div>

        {/* Morale bar */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{ fontSize: 9, color: WIKI_COLOURS.panelText, opacity: 0.5, width: 62, flexShrink: 0 }}>Morale</span>
          <div style={{ flex: 1, height: 4, background: WIKI_COLOURS.parchmentDk, borderRadius: 2, overflow: 'hidden', marginLeft: 42 }}>
            <div style={{ height: '100%', width: `${moraleWidth}%`, background: accentLight, borderRadius: 2 }} />
          </div>
          <span style={{ fontSize: 9, color: WIKI_COLOURS.panelText, opacity: 0.5, width: 26, textAlign: 'right', flexShrink: 0 }}>
            {moraleWidth}%
          </span>
        </div>

        {/* Supply */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{ fontSize: 9, color: WIKI_COLOURS.panelText, opacity: 0.5, width: 62, flexShrink: 0 }}>Supply</span>
          <span style={{
            fontSize: 9,
            fontWeight: 700,
            color: supplyColor,
            background: `${supplyColor}22`,
            padding: '1px 6px',
            borderRadius: 3,
          }}>
            {supplyLabel}
          </span>
        </div>

        {/* Notes */}
        {unit.notes && (
          <p style={{
            fontSize: 9,
            color: WIKI_COLOURS.panelText,
            opacity: 0.65,
            fontStyle: 'italic',
            lineHeight: 1.4,
            marginTop: 2,
            borderTop: `1px solid ${WIKI_COLOURS.panelBorder}`,
            paddingTop: 5,
          }}>
            {unit.notes}
          </p>
        )}
      </div>
    </motion.div>
  )
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
      <span style={{ fontSize: 9, color: WIKI_COLOURS.panelText, opacity: 0.5, width: 62, flexShrink: 0 }}>{label}</span>
      <span style={{ fontSize: 9, color: WIKI_COLOURS.panelText, fontWeight: 600 }}>{value}</span>
    </div>
  )
}
