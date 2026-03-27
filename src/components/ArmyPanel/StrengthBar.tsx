import { useEffect, useRef } from 'react'
import * as d3 from 'd3'
import type { StrengthBarProps } from './ArmyPanel.types'
import { getFactionStrengthPct } from '@/utils/phaseUtils'

export function StrengthBar({ factions, currentPhase }: StrengthBarProps) {
  const svgRef = useRef<SVGSVGElement>(null)

  useEffect(() => {
    const svg = svgRef.current
    if (!svg || factions.length < 2) return

    const width = svg.clientWidth
    const height = 28
    const f0 = factions[0]
    const f1 = factions[1]
    const s0 = getFactionStrengthPct(currentPhase, f0.id)
    const s1 = getFactionStrengthPct(currentPhase, f1.id)
    const total = s0 + s1
    const pct0 = total > 0 ? s0 / total : 0.5

    const d3svg = d3.select(svg).attr('width', width).attr('height', height)
    d3svg.selectAll('*').remove()

    // Left bar (faction 0)
    d3svg.append('rect')
      .attr('x', 0).attr('y', 8).attr('height', 12).attr('rx', 2)
      .attr('width', 0)
      .attr('fill', f0.color)
      .transition().duration(700)
      .attr('width', pct0 * width - 1)

    // Right bar (faction 1)
    d3svg.append('rect')
      .attr('x', width).attr('y', 8).attr('height', 12).attr('rx', 2)
      .attr('width', 0)
      .attr('fill', f1.color)
      .transition().duration(700)
      .attr('x', pct0 * width + 1)
      .attr('width', (1 - pct0) * width - 1)

    // Labels
    d3svg.append('text').attr('x', 4).attr('y', 6).attr('fill', f0.color_light).attr('font-size', 9).text(f0.side)
    d3svg.append('text').attr('x', width - 4).attr('y', 6).attr('fill', f1.color_light).attr('font-size', 9).attr('text-anchor', 'end').text(f1.side)
  }, [factions, currentPhase])

  return <svg ref={svgRef} className="w-full" style={{ height: 28 }} />
}
