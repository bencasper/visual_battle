import { motion, AnimatePresence } from 'framer-motion'
import type { InsightPanelProps } from './InsightPanel.types'
import { WisdomCard } from './WisdomCard'
import { CommanderQuote } from './CommanderQuote'
import { SourceLink } from './SourceLink'

export function InsightPanel({ phase, battle, visible, onClose }: InsightPanelProps) {
  const phaseWisdom = battle.wisdom.filter((w) => w.related_phase === phase.id)
  const relevantFigures = battle.key_figures.slice(0, 2)

  return (
    <AnimatePresence>
      {visible && (
        <motion.aside
          initial={{ x: '100%' }}
          animate={{ x: 0 }}
          exit={{ x: '100%' }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          className="absolute right-0 top-0 bottom-20 z-30 w-72 overflow-y-auto panel-scroll"
          style={{
            background: 'rgba(245,234,213,0.97)',
            borderLeft: '1px solid #c8b49a',
            backdropFilter: 'blur(4px)',
          }}
        >
          {/* Header */}
          <div
            className="flex items-center justify-between px-3 py-2.5 sticky top-0 z-10"
            style={{
              background: 'rgba(245,234,213,0.98)',
              borderBottom: '1px solid #c8b49a',
            }}
          >
            <div>
              <p className="text-[9px] uppercase tracking-widest text-wiki-textMuted font-semibold">Phase Insight</p>
              <p className="text-xs font-bold text-wiki-text" style={{ fontFamily: '"Linux Libertine", Georgia, serif' }}>
                {phase.label}
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-wiki-textMuted hover:text-wiki-text w-6 h-6 flex items-center justify-center rounded hover:bg-wiki-parchmentDk transition-colors"
            >
              ✕
            </button>
          </div>

          <div className="p-3 space-y-3">
            {/* Tactical annotation */}
            <div>
              <p className="text-[9px] uppercase tracking-widest text-wiki-textMuted font-semibold mb-1">Tactical Context</p>
              <p className="text-[11px] text-wiki-text leading-relaxed">{phase.annotation}</p>
            </div>

            {/* Weather */}
            <div className="flex items-center gap-2 glass-panel px-2 py-1.5">
              <span className="text-sm">🌡️</span>
              <div>
                <p className="text-[10px] text-wiki-text font-semibold">
                  {phase.weather.temp_celsius}°C · {phase.weather.conditions.replace(/_/g, ' ')}
                </p>
                <p className="text-[9px] text-wiki-textMuted">Wind {phase.weather.wind_kph} kph</p>
              </div>
            </div>

            {/* Wisdom cards */}
            {phaseWisdom.length > 0 && (
              <div>
                <p className="text-[9px] uppercase tracking-widest text-wiki-textMuted font-semibold mb-1.5">Lessons & Wisdom</p>
                <div className="space-y-2">
                  {phaseWisdom.map((w) => <WisdomCard key={w.id} wisdom={w} />)}
                </div>
              </div>
            )}

            {/* Commander quotes */}
            <div>
              <p className="text-[9px] uppercase tracking-widest text-wiki-textMuted font-semibold mb-1.5">Key Figures</p>
              <div className="space-y-2">
                {relevantFigures.map((fig) => <CommanderQuote key={fig.name} figure={fig} />)}
              </div>
            </div>

            {/* Sources */}
            <div>
              <p className="text-[9px] uppercase tracking-widest text-wiki-textMuted font-semibold mb-1.5">Sources</p>
              <div className="space-y-1.5">
                {battle.sources.map((src, i) => <SourceLink key={i} source={src} />)}
              </div>
            </div>
          </div>
        </motion.aside>
      )}
    </AnimatePresence>
  )
}
