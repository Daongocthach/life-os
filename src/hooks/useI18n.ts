import { useI18nStore, type Language } from '@/stores/i18nStore'

export function useI18n() {
  const { language, t, setLanguage } = useI18nStore()

  const toggleLanguage = () => {
    setLanguage(language === 'vi' ? 'en' : 'vi')
  }

  return {
    language,
    t,
    setLanguage,
    toggleLanguage,
    isVietnamese: language === 'vi',
  }
}
