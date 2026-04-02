import { useTranslation } from 'react-i18next'

interface MapControlsProps {
  onZoomIn: () => void
  onZoomOut: () => void
  onResetBearing: () => void
  onFitBounds: () => void
  is3D: boolean
  onToggle3D: () => void
}

export function MapControls({ onZoomIn, onZoomOut, onResetBearing, onFitBounds, is3D, onToggle3D }: MapControlsProps) {
  const { t } = useTranslation()
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
    <div className="absolute bottom-4 right-3 flex flex-col gap-1 z-30">
      <button onClick={onZoomIn}       className={btnClass}                    title={t('mapControls.zoomIn')}>+</button>
      <button onClick={onZoomOut}      className={btnClass}                    title={t('mapControls.zoomOut')}>−</button>
      <button onClick={onResetBearing} className={btnClass}                    title={t('mapControls.resetNorth')}>⬆</button>
      <button onClick={onFitBounds}    className={btnClass}                    title={t('mapControls.fitBattle')}>⤢</button>
      <button onClick={onToggle3D} className={is3D ? activeClass : btnClass} title={is3D ? t('mapControls.switchTo2D') : t('mapControls.switchTo3D')}>
        {is3D ? '2D' : '3D'}
      </button>
    </div>
  )
}
