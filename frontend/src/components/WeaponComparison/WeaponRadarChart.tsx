import { useEffect } from 'react'
import * as d3 from 'd3'
import type { WeaponRadarChartProps } from './WeaponComparison.types'
import { useD3Chart } from '@/hooks/useD3Chart'
import { snakeToTitle } from '@/utils/formatUtils'

export function WeaponRadarChart({ weapons }: WeaponRadarChartProps) {
  // Collect all stat keys across both weapons
  const allKeys = Array.from(
    new Set(weapons.flatMap((w) => Object.keys(w.weapon.stats).filter((k) => w.weapon.stats[k as keyof typeof w.weapon.stats] != null)))
  )

  const svgRef = useD3Chart<SVGSVGElement>((svg, width, height) => {
    const size = Math.min(width, height)
    const cx = width / 2
    const cy = height / 2
    const radius = size / 2 - 20
    const n = allKeys.length
    if (n < 3) return

    const angleSlice = (Math.PI * 2) / n
    const rScale = d3.scaleLinear().domain([0, 10]).range([0, radius])
    const sel = d3.select(svg)
    sel.selectAll('*').remove()

    // Grid circles
    for (let i = 1; i <= 5; i++) {
      sel.append('circle')
        .attr('cx', cx).attr('cy', cy)
        .attr('r', rScale(i * 2))
        .attr('fill', 'none').attr('stroke', '#334155').attr('stroke-width', 0.5)
    }

    // Axes
    allKeys.forEach((key, i) => {
      const angle = angleSlice * i - Math.PI / 2
      const x = cx + rScale(10) * Math.cos(angle)
      const y = cy + rScale(10) * Math.sin(angle)
      sel.append('line').attr('x1', cx).attr('y1', cy).attr('x2', x).attr('y2', y).attr('stroke', '#475569').attr('stroke-width', 0.5)
      const lx = cx + (rScale(10) + 12) * Math.cos(angle)
      const ly = cy + (rScale(10) + 12) * Math.sin(angle)
      sel.append('text').attr('x', lx).attr('y', ly).attr('text-anchor', 'middle').attr('dominant-baseline', 'middle').attr('fill', '#94a3b8').attr('font-size', 8).text(snakeToTitle(key).replace(' ', '\n'))
    })

    // Weapon polygons
    weapons.forEach(({ weapon, color }) => {
      const points = allKeys.map((key, i) => {
        const val = (weapon.stats[key as keyof typeof weapon.stats] as number) ?? 0
        const angle = angleSlice * i - Math.PI / 2
        return [cx + rScale(val) * Math.cos(angle), cy + rScale(val) * Math.sin(angle)] as [number, number]
      })
      const line = d3.line<[number, number]>()(points)!
      sel.append('path').attr('d', line + 'Z').attr('fill', color).attr('fill-opacity', 0.15).attr('stroke', color).attr('stroke-width', 1.5)
    })
  }, [weapons, allKeys.join(',')])

  return <svg ref={svgRef} className="w-full" style={{ height: 180 }} />
}
