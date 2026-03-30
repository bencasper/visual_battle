import { useEffect, useState } from 'react'
import type { Map as MapLibreMap } from 'maplibre-gl'
import { WIKI_COLOURS } from '@/utils/wikiMapStyle'

interface MapScaleBarProps {
  map: MapLibreMap
}

const MAX_WIDTH_PX = 200
const BAR_HEIGHT   = 8

const STEPS = [50, 100, 200, 500, 1000, 2000, 5000, 10000, 20000, 50000, 100000]

function fmtDist(m: number) {
  return m >= 1000 ? `${m / 1000} km` : `${m} m`
}

function getRoundDistance(metersPerPixel: number) {
  const maxMeters = metersPerPixel * MAX_WIDTH_PX
  const meters    = [...STEPS].reverse().find((s) => s <= maxMeters) ?? STEPS[0]
  return {
    meters,
    label:    fmtDist(meters),
    halfLabel: fmtDist(meters / 2),
    barWidth: meters / metersPerPixel,
  }
}

export function MapScaleBar({ map }: MapScaleBarProps) {
  const [scale, setScale] = useState<{
    label: string; halfLabel: string; barWidth: number
  } | null>(null)

  useEffect(() => {
    function update() {
      const center = map.getCenter()
      const zoom   = map.getZoom()
      const metersPerPixel =
        (40075016.686 / (256 * Math.pow(2, zoom))) *
        Math.cos((center.lat * Math.PI) / 180)
      const r = getRoundDistance(metersPerPixel)
      setScale({ label: r.label, halfLabel: r.halfLabel, barWidth: r.barWidth })
    }
    update()
    map.on('zoom', update)
    map.on('move', update)
    return () => { map.off('zoom', update); map.off('move', update) }
  }, [map])

  if (!scale) return null

  const W = scale.barWidth
  const H = BAR_HEIGHT
  const tick = H + 4   // end-tick height

  return (
    <div
      style={{
        position: 'fixed',
        bottom: 132,
        left: 12,
        zIndex: 25,
        pointerEvents: 'none',
        userSelect: 'none',
      }}
    >
      {/* Distance labels row */}
      <div style={{ position: 'relative', width: W, height: 14, marginBottom: 2 }}>
        {/* 0 label — left */}
        <span style={{
          position: 'absolute', left: 0,
          fontSize: 10, fontWeight: 700,
          color: WIKI_COLOURS.panelText,
          fontFamily: 'sans-serif',
          transform: 'translateX(-50%)',
          textShadow: `0 0 4px ${WIKI_COLOURS.parchment},0 0 4px ${WIKI_COLOURS.parchment}`,
        }}>0</span>

        {/* half label — centre */}
        <span style={{
          position: 'absolute', left: W / 2,
          fontSize: 10, fontWeight: 700,
          color: WIKI_COLOURS.panelText,
          fontFamily: 'sans-serif',
          transform: 'translateX(-50%)',
          textShadow: `0 0 4px ${WIKI_COLOURS.parchment},0 0 4px ${WIKI_COLOURS.parchment}`,
        }}>{scale.halfLabel}</span>

        {/* full label — right */}
        <span style={{
          position: 'absolute', left: W,
          fontSize: 10, fontWeight: 700,
          color: WIKI_COLOURS.panelText,
          fontFamily: 'sans-serif',
          transform: 'translateX(-50%)',
          textShadow: `0 0 4px ${WIKI_COLOURS.parchment},0 0 4px ${WIKI_COLOURS.parchment}`,
        }}>{scale.label}</span>
      </div>

      {/* Scale bar itself */}
      <svg width={W} height={tick} style={{ display: 'block', filter: 'drop-shadow(0 1px 3px rgba(0,0,0,0.3))' }}>
        {/* Left end tick */}
        <line x1={0.5} y1={0} x2={0.5} y2={tick} stroke={WIKI_COLOURS.panelText} strokeWidth={2} />
        {/* Right end tick */}
        <line x1={W - 0.5} y1={0} x2={W - 0.5} y2={tick} stroke={WIKI_COLOURS.panelText} strokeWidth={2} />
        {/* Centre tick */}
        <line x1={W / 2} y1={0} x2={W / 2} y2={tick} stroke={WIKI_COLOURS.panelText} strokeWidth={1.5} />
        {/* Top border */}
        <line x1={0} y1={1} x2={W} y2={1} stroke={WIKI_COLOURS.panelText} strokeWidth={2} />

        {/* Left half — dark fill */}
        <rect x={1} y={1} width={W / 2 - 1} height={H}
          fill={WIKI_COLOURS.panelText} />

        {/* Right half — light fill with border */}
        <rect x={W / 2} y={1} width={W / 2 - 1} height={H}
          fill={WIKI_COLOURS.parchment}
          stroke={WIKI_COLOURS.panelBorder} strokeWidth={0.5} />
      </svg>
    </div>
  )
}
