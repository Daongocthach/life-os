import { useEffect } from 'react'
import { useThemeStore, type Theme, type ResolvedTheme } from '@/stores/themeStore'

export type { Theme, ResolvedTheme }

export function useTheme() {
  const { theme, resolvedTheme, setTheme, toggleTheme } = useThemeStore()

  useEffect(() => {
    // Ensure DOM class and color-scheme remain in sync
    const root = document.documentElement
    if (resolvedTheme === 'dark') {
      root.classList.add('dark')
      root.style.colorScheme = 'dark'
    } else {
      root.classList.remove('dark')
      root.style.colorScheme = 'light'
    }
  }, [resolvedTheme])

  return {
    theme,
    resolvedTheme,
    isDark: resolvedTheme === 'dark',
    setTheme,
    toggleTheme,
  }
}
