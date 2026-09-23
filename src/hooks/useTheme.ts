import { useEffect } from 'react'
import { useThemeStore, type Theme } from '@/stores/themeStore'

export function useTheme() {
  const { theme, setTheme, toggleTheme } = useThemeStore()

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }, [theme])

  return {
    theme,
    isDark: theme === 'dark',
    setTheme,
    toggleTheme,
  }
}
