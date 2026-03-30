interface MapControlsProps {
  onZoomIn: () => void
  onZoomOut: () => void
  onResetBearing: () => void
  onFitBounds: () => void
}

export function MapControls({ onZoomIn, onZoomOut, onResetBearing, onFitBounds }: MapControlsProps) {
  const btnClass =
    'w-8 h-8 flex items-center justify-center ' +
    'bg-wiki-panel hover:bg-wiki-parchmentDk ' +
    'border border-wiki-border text-wiki-text hover:text-black ' +
    'rounded transition-colors text-sm font-semibold shadow-sm'

  return (
    <div className="absolute bottom-32 right-3 flex flex-col gap-1 z-10">
      <button onClick={onZoomIn}       className={btnClass} title="Zoom in">+</button>
      <button onClick={onZoomOut}      className={btnClass} title="Zoom out">−</button>
      <button onClick={onResetBearing} className={btnClass} title="Reset north">⬆</button>
      <button onClick={onFitBounds}    className={btnClass} title="Fit to battle">⤢</button>
    </div>
  )
}
