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
  posture: string
  strengthPct: number
  isSelected?: boolean
  onClick?: (anchor: { x: number; y: number }) => void
}

function natoIcon(unitType?: string): string {
  const map: Record<string, string> = {
    infantry_regiment:   '/icons/nato_infantry.svg',
    infantry_division:   '/icons/nato_infantry.svg',
    infantry_battalion:  '/icons/nato_infantry.svg',
    infantry_company:    '/icons/nato_infantry.svg',
    infantry_task_force: '/icons/nato_infantry.svg',
    army_corps:          '/icons/nato_infantry.svg',
    commando:            '/icons/nato_recon.svg',
    armored_division:    '/icons/nato_tank.svg',
    armor_company:       '/icons/nato_tank.svg',
    artillery_regiment:  '/icons/nato_artillery.svg',
    artillery_battalion: '/icons/nato_artillery.svg',
    hq:                  '/icons/nato_hq.svg',
    air_wing:            '/icons/nato_infantry.svg',
  }
  return map[unitType ?? ''] ?? '/icons/nato_infantry.svg'
}

function factionColor(color: string): string {
  const h = color.toLowerCase()
  if (h.startsWith('#1a3') || h.startsWith('#003') || h.startsWith('#197')) return WIKI_COLOURS.unBlue
  if (h.startsWith('#8b1') || h.startsWith('#aa0') || h.startsWith('#c62')) return WIKI_COLOURS.pvaRed
  return color
}

export function UnitMarker({ map, lat, lng, label, unitType, color, posture, strengthPct, isSelected, onClick }: UnitMarkerProps) {
  const markerRef = useRef<maplibregl.Marker | null>(null)

  useEffect(() => {
    const fc = factionColor(color)
    const opacity = Math.max(0.5, strengthPct)

    // Outer wrapper
    const el = document.createElement('div')
    el.style.cssText = [
      'cursor: pointer',
      'display: flex',
      'flex-direction: column',
      'align-items: center',
      'gap: 2px',
      `opacity: ${opacity}`,
    ].join(';')

    // NATO box
    const box = document.createElement('div')
    box.style.cssText = [
      'width: 34px',
      'height: 22px',
      `background: ${fc}`,
      'border: 2px solid #111',
      'border-radius: 2px',
      'display: flex',
      'align-items: center',
      'justify-content: center',
      'box-shadow: 0 1px 4px rgba(0,0,0,0.5)',
      isSelected ? 'outline: 2px solid #fff; outline-offset: 1px' : '',
    ].join(';')

    // Icon image
    const img = document.createElement('img')
    img.src = natoIcon(unitType)
    img.width = 28
    img.height = 16
    img.style.cssText = 'display:block; filter:brightness(0) invert(1); pointer-events:none;'
    img.onerror = () => { img.style.display = 'none' }
    box.appendChild(img)

    // Label
    const lbl = document.createElement('div')
    lbl.textContent = label.split(/[\s,(]/)[0]
    lbl.style.cssText = [
      'font-size: 9px',
      'font-weight: 700',
      'font-family: Georgia, serif',
      'color: #111',
      'white-space: nowrap',
      'pointer-events: none',
      'text-shadow: 0 0 3px #f0e6cc, 0 0 3px #f0e6cc, 0 0 3px #f0e6cc',
    ].join(';')

    el.appendChild(box)
    el.appendChild(lbl)

    if (onClick) {
      el.addEventListener('click', (e) => {
        onClick({ x: e.clientX, y: e.clientY })
      })
    }

    // Hover highlight
    el.addEventListener('mouseenter', () => { if (!isSelected) box.style.outline = '2px solid #fff' })
    el.addEventListener('mouseleave', () => { if (!isSelected) box.style.outline = 'none' })

    const marker = new maplibregl.Marker({ element: el, anchor: 'bottom' })
      .setLngLat([lng, lat])
      .addTo(map)

    markerRef.current = marker

    return () => {
      marker.remove()
    }
  }, [map, lat, lng, label, unitType, color, posture, strengthPct, isSelected, onClick])

  return null
}
