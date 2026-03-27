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
          className="absolute right-0 top-0 bottom-20 z-30 w-72 bg-map-panel/95 backdrop-blur-sm border-l border-map-panelBorder overflow-y-auto panel-scroll"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-3 py-2.5 border-b border-map-panelBorder sticky top-0 bg-map-panel/95 backdrop-blur-sm z-10">
            <div>
              <p className="text-[9px] uppercase tracking-widest text-slate-500">Phase Insight</p>
              <p className="text-xs font-semibold text-slate-200">{phase.label}</p>
            </div>
            <button onClick={onClose} className="text-slate-500 hover:text-white w-6 h-6 flex items-center justify-center rounded hover:bg-slate-700">✕</button>
          </div>

          <div className="p-3 space-y-3">
            {/* Tactical annotation */}
            <div>
              <p className="text-[9px] uppercase tracking-widest text-slate-500 mb-1">Tactical Context</p>
              <p className="text-[11px] text-slate-300 leading-relaxed">{phase.annotation}</p>
            </div>

            {/* Weather */}
            <div className="flex items-center gap-2 glass-panel px-2 py-1.5">
              <span className="text-sm">🌡️</span>
              <div>
                <p className="text-[10px] text-slate-300 font-medium">{phase.weather.temp_celsius}°C · {phase.weather.conditions.replace(/_/g, ' ')}</p>
                <p className="text-[9px] text-slate-500">Wind {phase.weather.wind_kph} kph</p>
              </div>
            </div>

            {/* Wisdom cards */}
            {phaseWisdom.length > 0 && (
              <div>
                <p className="text-[9px] uppercase tracking-widest text-slate-500 mb-1.5">Lessons & Wisdom</p>
                <div className="space-y-2">
                  {phaseWisdom.map((w) => <WisdomCard key={w.id} wisdom={w} />)}
                </div>
              </div>
            )}

            {/* Commander quotes */}
            <div>
              <p className="text-[9px] uppercase tracking-widest text-slate-500 mb-1.5">Key Figures</p>
              <div className="space-y-2">
                {relevantFigures.map((fig) => <CommanderQuote key={fig.name} figure={fig} />)}
              </div>
            </div>

            {/* Sources */}
            <div>
              <p className="text-[9px] uppercase tracking-widest text-slate-500 mb-1.5">Sources</p>
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
