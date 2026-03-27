import { useEffect, useRef, useCallback } from 'react'

/**
 * Generic hook for mounting D3 charts into a container ref.
 * Handles resize observation and cleanup.
 *
 * @param renderFn - Called with (svg element, width, height) on each render
 * @param deps     - Re-render triggers (like changing data)
 */
export function useD3Chart<T extends SVGSVGElement>(
  renderFn: (svg: T, width: number, height: number) => (() => void) | void,
  deps: React.DependencyList,
) {
  const svgRef = useRef<T>(null)

  const render = useCallback(() => {
    const svg = svgRef.current
    if (!svg) return
    const { width, height } = svg.getBoundingClientRect()
    if (width === 0 || height === 0) return
    return renderFn(svg, width, height)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps)

  useEffect(() => {
    const cleanup = render()
    return () => {
      if (typeof cleanup === 'function') cleanup()
    }
  }, [render])

  useEffect(() => {
    const svg = svgRef.current
    if (!svg) return
    const observer = new ResizeObserver(() => render())
    observer.observe(svg)
    return () => observer.disconnect()
  }, [render])

  return svgRef
}
