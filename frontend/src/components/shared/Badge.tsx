interface BadgeProps {
  label: string
  variant?: 'un' | 'pva' | 'neutral' | 'critical' | 'high' | 'medium' | 'low'
  size?: 'sm' | 'xs'
}

const variantClasses: Record<string, string> = {
  un:       'bg-un/20 text-un-light border border-un/40',
  pva:      'bg-pva/20 text-pva-light border border-pva/40',
  neutral:  'bg-slate-700/50 text-slate-300 border border-slate-600',
  critical: 'bg-red-900/40 text-red-300 border border-red-700',
  high:     'bg-orange-900/40 text-orange-300 border border-orange-700',
  medium:   'bg-yellow-900/40 text-yellow-300 border border-yellow-700',
  low:      'bg-slate-700/40 text-slate-400 border border-slate-600',
}

export function Badge({ label, variant = 'neutral', size = 'xs' }: BadgeProps) {
  const sizeClass = size === 'sm' ? 'px-2 py-1 text-xs' : 'px-1.5 py-0.5 text-[10px]'
  return (
    <span className={`inline-flex items-center rounded font-medium uppercase tracking-wide ${sizeClass} ${variantClasses[variant]}`}>
      {label}
    </span>
  )
}
