import { useUIStore } from '@/store/useUIStore'
import { WIKI_COLOURS } from '@/utils/wikiMapStyle'

const SIZE = 56  // outer diameter of the circle ring

export function NorthArrow() {
  const bearing = useUIStore((s) => s.mapBearing)

  const cx = SIZE / 2
  const cy = SIZE / 2
  const r  = SIZE / 2 - 2   // ring radius (2px inset for stroke)

  // Arrow shaft: tip at top, base at bottom, relative to centre
  const arrowH     = r * 0.92
  const arrowW     = r * 0.28
  const tipY       = cy - arrowH
  const baseY      = cy + arrowH * 0.55
  const midY       = cy                    // widest point

  // North (filled black) half — points up
  const northPath = `
    M ${cx} ${tipY}
    L ${cx + arrowW} ${midY}
    L ${cx} ${baseY}
    Z
  `
  // South (white) half — points down
  const southPath = `
    M ${cx} ${tipY}
    L ${cx - arrowW} ${midY}
    L ${cx} ${baseY}
    Z
  `

  return (
    <div
      style={{
        position: 'absolute',
        bottom: 16,
        left: 12,
        zIndex: 25,
        pointerEvents: 'none',
        userSelect: 'none',
        filter: 'drop-shadow(0 1px 4px rgba(0,0,0,0.35))',
      }}
    >
      <svg width={SIZE} height={SIZE + 14} viewBox={`0 0 ${SIZE} ${SIZE + 14}`}>
        {/* "N" label at very top */}
        <text
          x={cx}
          y={10}
          textAnchor="middle"
          dominantBaseline="middle"
          fontFamily="Georgia, serif"
          fontWeight="700"
          fontSize="13"
          fill={WIKI_COLOURS.panelText}
          stroke={WIKI_COLOURS.parchment}
          strokeWidth="3"
          paintOrder="stroke"
        >N</text>

        {/* Outer ring */}
        <g transform={`translate(0, 14) rotate(${bearing}, ${cx}, ${cy})`}>
          <circle
            cx={cx} cy={cy} r={r}
            fill={WIKI_COLOURS.panelBg}
            stroke={WIKI_COLOURS.panelText}
            strokeWidth="1.5"
            fillOpacity="0.88"
          />

          {/* South half (white) drawn first */}
          <path d={southPath} fill={WIKI_COLOURS.parchment} stroke={WIKI_COLOURS.panelText} strokeWidth="0.75" strokeLinejoin="round" />
          {/* North half (black) on top */}
          <path d={northPath} fill={WIKI_COLOURS.panelText} stroke={WIKI_COLOURS.panelText} strokeWidth="0.75" strokeLinejoin="round" />

          {/* Small centre dot */}
          <circle cx={cx} cy={cy} r={2.5} fill={WIKI_COLOURS.parchment} stroke={WIKI_COLOURS.panelText} strokeWidth="0.75" />
        </g>
      </svg>
    </div>
  )
}
