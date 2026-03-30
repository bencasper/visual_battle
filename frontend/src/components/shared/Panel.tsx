import { type ReactNode, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

interface PanelProps {
  title: string
  children: ReactNode
  className?: string
  collapsible?: boolean
  defaultOpen?: boolean
  icon?: ReactNode
}

export function Panel({ title, children, className = '', collapsible = true, defaultOpen = true, icon }: PanelProps) {
  const [open, setOpen] = useState(defaultOpen)

  return (
    <div className={`glass-panel overflow-hidden ${className}`}>
      <button
        onClick={() => collapsible && setOpen((o) => !o)}
        className="flex items-center justify-between w-full px-3 py-2 text-left select-none"
      >
        <div className="flex items-center gap-2">
          {icon && <span className="text-wiki-textMuted">{icon}</span>}
          <span className="text-xs font-bold uppercase tracking-widest text-wiki-text">
            {title}
          </span>
        </div>
        {collapsible && (
          <span className="text-wiki-textMuted text-xs transition-transform duration-200" style={{ transform: open ? 'rotate(180deg)' : 'rotate(0deg)' }}>
            ▲
          </span>
        )}
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="px-3 pb-3">{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
