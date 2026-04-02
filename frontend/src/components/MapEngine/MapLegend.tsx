import type { Faction } from '@/types/battle'
import { useTranslation } from 'react-i18next'
import { WIKI_COLOURS } from '@/utils/wikiMapStyle'

interface MapLegendProps {
  factions: Faction[]
}

const NATO_SYMBOLS = [
  { glyph: '╳', label: 'Infantry' },
  { glyph: '●', label: 'Artillery' },
  { glyph: '○', label: 'Armour' },
  { glyph: '╳', label: 'Recon', recon: true },
  { glyph: '★', label: 'HQ' },
]

// Posture dot colours
const POSTURE_LEGEND = [
  { label: 'Advancing / Attacking', posture: 'advancing' },
  { label: 'Holding / Defending',   posture: 'defending' },
  { label: 'Infiltrating',          posture: 'infiltrating' },
]

const POSTURE_COLOR: Record<string, string> = {
  advancing:    '#22c55e',
  attacking:    '#22c55e',
  defending:    '#facc15',
  holding:      '#facc15',
  infiltrating: '#f97316',
  retreating:   '#ef4444',
}

export function MapLegend({ factions }: MapLegendProps) {
  const { t } = useTranslation()
  return (
    <div
      style={{
        position: 'absolute',
        bottom: 136,
        left: 12,
        zIndex: 25,
        background: WIKI_COLOURS.panelBg,
        border: `1px solid ${WIKI_COLOURS.panelBorder}`,
        borderRadius: 5,
        boxShadow: '0 1px 6px rgba(0,0,0,0.18)',
        padding: '6px 8px',
        minWidth: 140,
        maxWidth: 180,
      }}
    >
      {/* ── Factions ── */}
      <p style={{ fontSize: 7, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: WIKI_COLOURS.panelText, opacity: 0.5, marginBottom: 4 }}>
        {t('legend.factions')}
      </p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 3, marginBottom: 7 }}>
        {factions.map((f) => (
          <div key={f.id} style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
            <div style={{
              width: 18, height: 12,
              background: f.color,
              border: '1.5px solid #111',
              borderRadius: 2,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              flexShrink: 0,
            }}>
              <span style={{ fontSize: 6, color: '#fff', fontWeight: 700, fontFamily: 'monospace' }}>╳</span>
            </div>
            <span style={{ fontSize: 9, color: WIKI_COLOURS.panelText, fontWeight: 600, lineHeight: 1.2 }}>
              {f.side}
            </span>
          </div>
        ))}
      </div>

      {/* ── NATO Unit Types ── */}
      <p style={{ fontSize: 7, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: WIKI_COLOURS.panelText, opacity: 0.5, marginBottom: 4 }}>
        {t('legend.natoSymbols')}
      </p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 2, marginBottom: 7 }}>
        {[
          { glyph: '╳', label: t('legend.infantry') },
          { glyph: '●', label: t('legend.artillery') },
          { glyph: '○', label: t('legend.armour') },
          { glyph: '★', label: t('legend.hq') },
          { glyph: '∿', label: t('legend.airWing') },
        ].map(({ glyph, label }) => (
          <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
            <div style={{
              width: 18, height: 12,
              background: '#555',
              border: '1.5px solid #111',
              borderRadius: 2,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              flexShrink: 0,
            }}>
              <span style={{ fontSize: 6, color: '#fff', fontWeight: 700, fontFamily: 'monospace' }}>{glyph}</span>
            </div>
            <span style={{ fontSize: 9, color: WIKI_COLOURS.panelText, lineHeight: 1.2 }}>{label}</span>
          </div>
        ))}
      </div>

      {/* ── Echelon sizes ── */}
      <p style={{ fontSize: 7, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: WIKI_COLOURS.panelText, opacity: 0.5, marginBottom: 4 }}>
        {t('legend.echelon')}
      </p>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2px 8px' }}>
        {[
          { sym: 'XX',  label: t('legend.corps') },
          { sym: 'X',   label: t('legend.division') },
          { sym: 'III', label: t('legend.regiment') },
          { sym: 'II',  label: t('legend.battalion') },
          { sym: 'I',   label: t('legend.company') },
          { sym: '★',   label: t('legend.hq') },
        ].map(({ sym, label }) => (
          <div key={label} style={{ display: 'flex', alignItems: 'baseline', gap: 3 }}>
            <span style={{ fontSize: 8, fontWeight: 700, fontFamily: 'monospace', color: WIKI_COLOURS.panelText, minWidth: 18 }}>{sym}</span>
            <span style={{ fontSize: 8, color: WIKI_COLOURS.panelText, opacity: 0.7 }}>{label}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
