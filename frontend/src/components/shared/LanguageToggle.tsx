import { useUIStore } from '@/store/useUIStore'
import { useTranslation } from 'react-i18next'

export function LanguageToggle() {
  const { language, setLanguage } = useUIStore()
  const { t } = useTranslation()

  return (
    <button
      onClick={() => setLanguage(language === 'en' ? 'zh' : 'en')}
      className="glass-panel px-2 py-1.5 text-[11px] font-bold text-wiki-text hover:text-black transition-colors shadow-md"
      title={language === 'en' ? '切换至中文' : 'Switch to English'}
    >
      {t('languageToggle.label')}
    </button>
  )
}
