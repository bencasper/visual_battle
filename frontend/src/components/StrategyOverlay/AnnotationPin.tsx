import { useEffect, useRef } from 'react'
import maplibregl from 'maplibre-gl'
import type { AnnotationPinProps } from './StrategyOverlay.types'
import { Badge } from '@/components/shared/Badge'

export function AnnotationPin({ event, onClick }: AnnotationPinProps) {
  // This component is used as a render prop — actual DOM insertion
  // is handled by StrategyOverlay using MapLibre markers
  return null
}

// Factory: creates a DOM element for a MapLibre marker representing a PhaseEvent
export function createAnnotationElement(event: AnnotationPinProps['event']): HTMLElement {
  const el = document.createElement('div')
  const isPulse = event.significance === 'critical'
  el.style.cssText = `
    width: 16px; height: 16px; border-radius: 50%; cursor: pointer;
    background: ${event.significance === 'critical' ? '#ef4444' : event.significance === 'high' ? '#f97316' : '#6366f1'};
    border: 2px solid white;
    box-shadow: 0 0 6px rgba(0,0,0,0.5);
    ${isPulse ? 'animation: ping 1.5s cubic-bezier(0,0,0.2,1) infinite;' : ''}
  `
  return el
}
