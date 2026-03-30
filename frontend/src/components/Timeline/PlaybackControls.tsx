import type { PlaybackControlsProps } from './Timeline.types'
import { Tooltip } from '@/components/shared/Tooltip'

export function PlaybackControls({
  isPlaying, speed, canStepBack, canStepForward,
  onPlay, onPause, onStepBack, onStepForward, onSpeedChange,
}: PlaybackControlsProps) {
  const btn =
    'flex items-center justify-center w-8 h-8 rounded ' +
    'text-wiki-text hover:text-black hover:bg-wiki-parchmentDk ' +
    'transition-colors disabled:opacity-30 disabled:cursor-not-allowed text-sm ' +
    'border border-transparent hover:border-wiki-border'

  const speedBtn = (s: 1 | 2 | 4) =>
    `px-2 h-6 rounded text-[10px] font-mono font-bold transition-colors ${
      speed === s
        ? 'bg-un text-white'
        : 'text-wiki-textMuted hover:text-black hover:bg-wiki-parchmentDk'
    }`

  return (
    <div className="flex items-center gap-1">
      <Tooltip content="Step back">
        <button onClick={onStepBack} disabled={!canStepBack} className={btn}>⏮</button>
      </Tooltip>

      <Tooltip content={isPlaying ? 'Pause' : 'Play'}>
        <button
          onClick={isPlaying ? onPause : onPlay}
          className="flex items-center justify-center w-10 h-10 rounded-full bg-un/10 hover:bg-un/20 border border-un/50 text-un hover:text-un transition-colors"
        >
          {isPlaying ? '⏸' : '▶'}
        </button>
      </Tooltip>

      <Tooltip content="Step forward">
        <button onClick={onStepForward} disabled={!canStepForward} className={btn}>⏭</button>
      </Tooltip>

      <div className="flex items-center gap-0.5 ml-2 border border-wiki-border rounded p-0.5 bg-wiki-parchment">
        <Tooltip content="1× speed"><button onClick={() => onSpeedChange(1)} className={speedBtn(1)}>1×</button></Tooltip>
        <Tooltip content="2× speed"><button onClick={() => onSpeedChange(2)} className={speedBtn(2)}>2×</button></Tooltip>
        <Tooltip content="4× speed"><button onClick={() => onSpeedChange(4)} className={speedBtn(4)}>4×</button></Tooltip>
      </div>
    </div>
  )
}
