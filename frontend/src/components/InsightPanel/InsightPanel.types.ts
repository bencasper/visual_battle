import type { Battle, Phase } from '@/types/battle'

export interface InsightPanelProps {
  phase: Phase
  battle: Battle
  visible: boolean
  onClose: () => void
}

export interface WisdomCardProps {
  wisdom: Battle['wisdom'][number]
}

export interface CommanderQuoteProps {
  figure: Battle['key_figures'][number]
}

export interface SourceLinkProps {
  source: Battle['sources'][number]
}
