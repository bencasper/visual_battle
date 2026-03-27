/** Format an ISO date string to a human-readable short date */
export function formatDate(iso: string): string {
  try {
    const d = new Date(iso)
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  } catch {
    return iso
  }
}

/** Format a date range object */
export function formatDateRange(range: { start: string; end: string }): string {
  return `${formatDate(range.start)} – ${formatDate(range.end)}`
}

/** Format a large number with thousands separator */
export function formatNumber(n: number): string {
  return n.toLocaleString('en-US')
}

/** Format a percentage (0–1) as "75%" */
export function formatPct(pct: number): string {
  return `${Math.round(pct * 100)}%`
}

/** Format temperature */
export function formatTemp(celsius: number): string {
  return `${celsius}°C`
}

/** Convert offset hours to a duration string: "2d 4h" */
export function formatOffsetHours(hours: number): string {
  const d = Math.floor(hours / 24)
  const h = hours % 24
  if (d === 0) return `+${h}h`
  if (h === 0) return `+${d}d`
  return `+${d}d ${h}h`
}

/** Capitalize first letter */
export function capitalize(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1)
}

/** Convert snake_case to Title Case */
export function snakeToTitle(s: string): string {
  return s.split('_').map(capitalize).join(' ')
}
