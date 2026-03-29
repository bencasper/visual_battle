import type { PlaybackControlsProps } from './Timeline.types'
import { Tooltip } from '@/components/shared/Tooltip'

export function PlaybackControls({
  isPlaying, speed, canStepBack, canStepForward,
  onPlay, onPause, onStepBack, onStepForward, onSpeedChange,
}: PlaybackControlsProps) {
  const btn = 'flex items-center justify-center w-8 h-8 rounded text-slate-300 hover:text-white hover:bg-slate-700 transition-colors disabled:opacity-30 disabled:cursor-not-allowed text-sm'
  const speedBtn = (s: 1 | 2 | 4) =>
    `px-2 h-6 rounded text-[10px] font-mono font-bold transition-colors ${speed === s ? 'bg-un text-white' : 'text-slate-400 hover:text-white hover:bg-slate-700'}`

  return (
    <div className="flex items-center gap-1">
      <Tooltip content="Step back">
        <button onClick={onStepBack} disabled={!canStepBack} className={btn}>⏮</button>
      </Tooltip>

      <Tooltip content={isPlaying ? 'Pause' : 'Play'}>
        <button onClick={isPlaying ? onPause : onPlay} className={`${btn} w-10 h-10 bg-un/20 hover:bg-un/40 border border-un/40 rounded-full`}>
          {isPlaying ? '⏸' : '▶'}
        </button>
      </Tooltip>

      <Tooltip content="Step forward">
        <button onClick={onStepForward} disabled={!canStepForward} className={btn}>⏭</button>
      </Tooltip>

      <div className="flex items-center gap-0.5 ml-2 border border-slate-700 rounded p-0.5">
        <Tooltip content="1× speed"><button onClick={() => onSpeedChange(1)} className={speedBtn(1)}>1×</button></Tooltip>
        <Tooltip content="2× speed"><button onClick={() => onSpeedChange(2)} className={speedBtn(2)}>2×</button></Tooltip>
        <Tooltip content="4× speed"><button onClick={() => onSpeedChange(4)} className={speedBtn(4)}>4×</button></Tooltip>
      </div>
    </div>
  )
}
