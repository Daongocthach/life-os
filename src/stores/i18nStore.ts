import { create } from 'zustand'
import { vi } from '@/lib/i18n/vi'
import { en } from '@/lib/i18n/en'

export type Language = 'vi' | 'en'

interface I18nState {
  language: Language
  t: typeof vi
  setLanguage: (lang: Language) => void
}

const getInitialLanguage = (): Language => {
  const saved = localStorage.getItem('lifeos_lang') as Language
  return saved === 'en' || saved === 'vi' ? saved : 'vi'
}

export const useI18nStore = create<I18nState>((set) => ({
  language: getInitialLanguage(),
  t: getInitialLanguage() === 'en' ? (en as unknown as typeof vi) : vi,
  setLanguage: (lang: Language) => {
    localStorage.setItem('lifeos_lang', lang)
    set({
      language: lang,
      t: lang === 'en' ? (en as unknown as typeof vi) : vi,
    })
  },
}))
