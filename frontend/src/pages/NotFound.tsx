import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'

export function NotFound() {
  const { t } = useTranslation()
  return (
    <div className="flex flex-col items-center justify-center h-full gap-4 text-center">
      <p className="text-6xl">🗺️</p>
      <h1 className="text-xl font-semibold text-slate-200">{t('notFound.title')}</h1>
      <p className="text-sm text-slate-400">{t('notFound.body')}</p>
      <Link to="/" className="text-un-light text-sm hover:underline">{t('notFound.back')}</Link>
    </div>
  )
}
