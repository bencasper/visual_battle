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

function easeInOut(t: number): number {
  return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t
}

const LERP_DURATION = 600 // ms

export function UnitMarker({ map, lat, lng, label, unitType, color, posture, strengthPct, isSelected, onClick }: UnitMarkerProps) {
  const markerRef   = useRef<maplibregl.Marker | null>(null)
  // Tracks the *displayed* position during animation (may differ from lat/lng props mid-lerp)
  const curPosRef   = useRef<{ lat: number; lng: number }>({ lat, lng })
  const rafRef      = useRef<number | null>(null)

  // ── Effect 1: create / destroy the marker DOM + handle non-position prop changes ──
  useEffect(() => {
    const fc      = factionColor(color)
    const opacity = Math.max(0.5, strengthPct)

    const el = document.createElement('div')
    el.style.cssText = [
      'cursor: pointer',
      'display: flex',
      'flex-direction: column',
      'align-items: center',
      'gap: 2px',
      `opacity: ${opacity}`,
    ].join(';')

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

    const img = document.createElement('img')
    img.src = natoIcon(unitType)
    img.width = 28
    img.height = 16
    img.style.cssText = 'display:block; filter:brightness(0) invert(1); pointer-events:none;'
    img.onerror = () => { img.style.display = 'none' }
    box.appendChild(img)

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

    el.addEventListener('mouseenter', () => { if (!isSelected) box.style.outline = '2px solid #fff' })
    el.addEventListener('mouseleave', () => { if (!isSelected) box.style.outline = 'none' })

    // Place at the *current displayed* position (not the target prop) so the
    // lerp effect can drive it from there if it fires simultaneously.
    const marker = new maplibregl.Marker({ element: el, anchor: 'bottom' })
      .setLngLat([curPosRef.current.lng, curPosRef.current.lat])
      .addTo(map)

    markerRef.current = marker

    return () => {
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current)
      marker.remove()
      markerRef.current = null
    }
    // Intentionally excludes lat/lng — position is driven by Effect 2
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [map, label, unitType, color, posture, strengthPct, isSelected, onClick])

  // ── Effect 2: smooth lerp to new lat/lng whenever they change ──
  useEffect(() => {
    const marker = markerRef.current
    if (!marker) {
      // Marker not mounted yet — just sync the ref so Effect 1 starts at the right place
      curPosRef.current = { lat, lng }
      return
    }

    // Cancel any in-flight animation
    if (rafRef.current !== null) cancelAnimationFrame(rafRef.current)

    const startLat = curPosRef.current.lat
    const startLng = curPosRef.current.lng
    const startTime = performance.now()

    function step(now: number) {
      const raw = Math.min(1, (now - startTime) / LERP_DURATION)
      const t   = easeInOut(raw)

      const curLat = startLat + (lat - startLat) * t
      const curLng = startLng + (lng - startLng) * t
      curPosRef.current = { lat: curLat, lng: curLng }

      marker!.setLngLat([curLng, curLat])

      if (raw < 1) {
        rafRef.current = requestAnimationFrame(step)
      } else {
        rafRef.current = null
        curPosRef.current = { lat, lng }
      }
    }

    rafRef.current = requestAnimationFrame(step)

    return () => {
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current)
        rafRef.current = null
      }
    }
  }, [lat, lng])

  return null
}
