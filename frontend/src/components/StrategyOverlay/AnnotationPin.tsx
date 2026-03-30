import type { AnnotationPinProps } from './StrategyOverlay.types'

export function AnnotationPin({ }: AnnotationPinProps) {
  // Rendered imperatively — see createAnnotationElement below
  return null
}

/**
 * Factory: creates a DOM element for a MapLibre marker representing a PhaseEvent.
 * Wikipedia style: flat circle with dark border, readable on light parchment map.
 */
export function createAnnotationElement(event: AnnotationPinProps['event']): HTMLElement {
  const el = document.createElement('div')

  const bg =
    event.significance === 'critical' ? '#cc0000' :
    event.significance === 'high'     ? '#b35800' :
    event.significance === 'medium'   ? '#555555' :
                                        '#7a6a50'

  const symbol =
    event.significance === 'critical' ? '★' :
    event.significance === 'high'     ? '●' : '◆'

  el.style.cssText = `
    width: 20px; height: 20px; border-radius: 50%;
    background: ${bg};
    border: 2px solid #1a1008;
    cursor: pointer;
    display: flex; align-items: center; justify-content: center;
    box-shadow: 1px 1px 4px rgba(0,0,0,0.4);
    font-size: 8px; color: #ffffff; font-weight: 700;
    user-select: none;
    transition: transform 0.15s ease;
  `
  el.textContent = symbol

  el.addEventListener('mouseenter', () => { el.style.transform = 'scale(1.25)' })
  el.addEventListener('mouseleave', () => { el.style.transform = 'scale(1)' })

  return el
}
