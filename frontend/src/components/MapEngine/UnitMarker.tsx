import { useEffect, useRef } from 'react'
import maplibregl, { type Map as MapLibreMap } from 'maplibre-gl'
import { WIKI_COLOURS } from '@/utils/wikiMapStyle'

interface UnitMarkerProps {
  map: MapLibreMap
  lat: number
  lng: number
  label: string
  unitType?: string
  color: string
  colorLight: string
  posture: string
  strengthPct: number
  onClick?: () => void
}

/** Map the faction hex colour to a Wikipedia-accurate flat colour */
function wikiColor(hex: string): string {
  const h = hex.toLowerCase()
  if (h.startsWith('#1a3') || h.startsWith('#003') || h.startsWith('#1976')) return WIKI_COLOURS.unBlue
  if (h.startsWith('#8b1') || h.startsWith('#aa0') || h.startsWith('#c628')) return WIKI_COLOURS.pvaRed
  return hex
}

/** Map unit type to a NATO APP-6 SVG icon path under /icons/ */
function natoIcon(unitType?: string): string {
  const map: Record<string, string> = {
    infantry_division:  '/icons/nato_infantry.svg',
    infantry_regiment:  '/icons/nato_infantry.svg',
    infantry_battalion: '/icons/nato_infantry.svg',
    army_corps:         '/icons/nato_infantry.svg',
    commando:           '/icons/nato_recon.svg',
    armored_division:   '/icons/nato_tank.svg',
    artillery_regiment: '/icons/nato_artillery.svg',
    naval_force:        '/icons/nato_infantry.svg',
    air_wing:           '/icons/nato_infantry.svg',
  }
  return map[unitType ?? ''] ?? '/icons/nato_infantry.svg'
}

/**
 * Wikipedia-style NATO unit marker.
 *
 * Layout (top to bottom):
 *   ┌──────────────────────────┐
 *   │  [NATO SVG icon]         │  ← faction-coloured filled box, black border
 *   └──────────────────────────┘
 *        location label           ← small black text below
 *
 * Matches the annotated-box + label aesthetic used in Wikipedia battle maps.
 */
export function UnitMarker({
  map, lat, lng, label, unitType, color, posture, strengthPct, onClick,
}: UnitMarkerProps) {
  const markerRef = useRef<maplibregl.Marker | null>(null)

  useEffect(() => {
    const fc = wikiColor(color)
    const opacity = Math.max(0.45, strengthPct)
    const iconSrc = natoIcon(unitType)

    const el = document.createElement('div')
    el.title = `${label} (${posture}) — ${Math.round(strengthPct * 100)}%`
    el.style.cssText = `
      cursor: pointer;
      opacity: ${opacity};
      display: flex; flex-direction: column; align-items: center; gap: 2px;
    `

    // ── NATO symbol box ───────────────────────────────────────────────
    const box = document.createElement('div')
    box.style.cssText = `
      width: 36px; height: 24px;
      background: ${fc};
      border: 2px solid #1a1008;
      border-radius: 2px;
      display: flex; align-items: center; justify-content: center;
      box-shadow: 1px 1px 3px rgba(0,0,0,0.4);
      overflow: hidden;
      position: relative;
    `

    // SVG icon (white recolour via CSS filter on a coloured bg)
    const img = document.createElement('img')
    img.src = iconSrc
    img.width  = 30
    img.height = 18
    img.style.cssText = `
      display: block;
      filter: brightness(0) invert(1);
      pointer-events: none;
      user-select: none;
    `
    box.appendChild(img)

    // ── Location label below the box ──────────────────────────────────
    const lbl = document.createElement('div')
    lbl.textContent = label.split(/[\s,(]/)[0]   // first word only
    lbl.style.cssText = `
      font-family: 'Linux Libertine', Georgia, serif;
      font-size: 9px;
      font-weight: 700;
      color: #1a1008;
      text-shadow: 0 0 3px #f0e6cc, 0 0 3px #f0e6cc;
      white-space: nowrap;
      pointer-events: none;
      user-select: none;
      line-height: 1;
    `

    el.appendChild(box)
    el.appendChild(lbl)

    if (onClick) {
      el.addEventListener('click', onClick)
      el.addEventListener('mouseenter', () => {
        box.style.outline = '2px solid #f0e6cc'
      })
      el.addEventListener('mouseleave', () => {
        box.style.outline = 'none'
      })
    }

    const popup = new maplibregl.Popup({
      offset: [0, -30],
      closeButton: false,
      maxWidth: '200px',
    }).setHTML(`
      <strong style="font-size:11px;color:#1a1008">${label}</strong>
      <br/><span style="font-size:10px;color:#5c4a2a">${posture.replace(/_/g,' ')} · ${Math.round(strengthPct * 100)}%</span>
    `)

    const marker = new maplibregl.Marker({ element: el, anchor: 'bottom' })
      .setLngLat([lng, lat])
      .setPopup(popup)
      .addTo(map)

    markerRef.current = marker

    return () => {
      marker.remove()
      if (onClick) el.removeEventListener('click', onClick)
    }
  // Only recreate when the map instance changes
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [map])

  // Update position + opacity when phase changes
  useEffect(() => {
    markerRef.current?.setLngLat([lng, lat])
    const el = markerRef.current?.getElement()
    if (el) el.style.opacity = String(Math.max(0.45, strengthPct))
  }, [lat, lng, strengthPct, posture])

  return null
}
