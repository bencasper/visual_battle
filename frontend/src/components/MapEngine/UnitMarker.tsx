import { useEffect, useRef } from 'react'
import maplibregl, { type Map as MapLibreMap } from 'maplibre-gl'
import { motion } from 'framer-motion'
import { strengthColor, postureColor } from '@/utils/colorUtils'

interface UnitMarkerProps {
  map: MapLibreMap
  lat: number
  lng: number
  label: string
  color: string
  colorLight: string
  posture: string
  strengthPct: number
  onClick?: () => void
}

export function UnitMarker({ map, lat, lng, label, color, colorLight, posture, strengthPct, onClick }: UnitMarkerProps) {
  const markerRef = useRef<maplibregl.Marker | null>(null)
  const elRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    const el = document.createElement('div')
    elRef.current = el
    el.className = 'unit-marker'
    el.style.cssText = `
      width: 28px; height: 28px; border-radius: 50%;
      background: ${color}; border: 2px solid ${colorLight};
      cursor: pointer; display: flex; align-items: center; justify-content: center;
      box-shadow: 0 0 8px ${color}88;
      transition: transform 0.2s ease;
    `

    const inner = document.createElement('div')
    inner.style.cssText = `
      width: 8px; height: 8px; border-radius: 50%;
      background: ${strengthColor(strengthPct)};
    `
    el.appendChild(inner)

    if (onClick) el.addEventListener('click', onClick)

    const marker = new maplibregl.Marker({ element: el, anchor: 'center' })
      .setLngLat([lng, lat])
      .setPopup(new maplibregl.Popup({ offset: 18, closeButton: false }).setText(label))
      .addTo(map)

    markerRef.current = marker

    return () => {
      marker.remove()
      if (onClick) el.removeEventListener('click', onClick)
    }
  }, [map])

  // Update position on phase change
  useEffect(() => {
    markerRef.current?.setLngLat([lng, lat])
  }, [lat, lng])

  return null
}
