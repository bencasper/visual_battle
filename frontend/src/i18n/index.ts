import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'

import enUI from './locales/en/ui.json'
import zhUI from './locales/zh/ui.json'

i18n
  .use(initReactI18next)
  .init({
    lng: 'en',
    fallbackLng: 'en',
    defaultNS: 'ui',
    resources: {
      en: { ui: enUI },
      zh: { ui: zhUI },
    },
    interpolation: {
      escapeValue: false, // React already escapes
    },
  })

export default i18n
