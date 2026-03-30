interface MapControlsProps {
  onZoomIn: () => void
  onZoomOut: () => void
  onResetBearing: () => void
  onFitBounds: () => void
  is3D: boolean
  onToggle3D: () => void
}

export function MapControls({ onZoomIn, onZoomOut, onResetBearing, onFitBounds, is3D, onToggle3D }: MapControlsProps) {
  const btnClass =
    'w-8 h-8 flex items-center justify-center ' +
    'bg-wiki-panel hover:bg-wiki-parchmentDk ' +
    'border border-wiki-border text-wiki-text hover:text-black ' +
    'rounded transition-colors text-sm font-semibold shadow-sm'

  const activeClass =
    'w-8 h-8 flex items-center justify-center ' +
    'bg-wiki-text text-wiki-parchment ' +
    'border border-wiki-border ' +
    'rounded transition-colors text-sm font-semibold shadow-sm'

  return (
    <div className="absolute bottom-32 right-3 flex flex-col gap-1 z-30">
      <button onClick={onZoomIn}       className={btnClass}                    title="Zoom in">+</button>
      <button onClick={onZoomOut}      className={btnClass}                    title="Zoom out">−</button>
      <button onClick={onResetBearing} className={btnClass}                    title="Reset north">⬆</button>
      <button onClick={onFitBounds}    className={btnClass}                    title="Fit to battle">⤢</button>
      <button onClick={() => { console.log('[3D] button clicked, is3D=', is3D); onToggle3D() }} className={is3D ? activeClass : btnClass} title={is3D ? 'Switch to 2D' : 'Switch to 3D'}>
        {is3D ? '2D' : '3D'}
      </button>
    </div>
  )
}
