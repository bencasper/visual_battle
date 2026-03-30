interface BadgeProps {
  label: string
  variant?: 'un' | 'pva' | 'neutral' | 'critical' | 'high' | 'medium' | 'low'
  size?: 'sm' | 'xs'
}

const variantClasses: Record<string, string> = {
  un:       'bg-un/15 text-un border border-un/40',
  pva:      'bg-pva/15 text-pva border border-pva/40',
  neutral:  'bg-wiki-parchmentDk text-wiki-textMuted border border-wiki-border',
  critical: 'bg-red-100 text-red-800 border border-red-300',
  high:     'bg-orange-100 text-orange-800 border border-orange-300',
  medium:   'bg-yellow-100 text-yellow-800 border border-yellow-300',
  low:      'bg-wiki-parchmentDk text-wiki-textMuted border border-wiki-border',
}

export function Badge({ label, variant = 'neutral', size = 'xs' }: BadgeProps) {
  const sizeClass = size === 'sm' ? 'px-2 py-1 text-xs' : 'px-1.5 py-0.5 text-[10px]'
  return (
    <span className={`inline-flex items-center rounded font-semibold uppercase tracking-wide ${sizeClass} ${variantClasses[variant]}`}>
      {label}
    </span>
  )
}
