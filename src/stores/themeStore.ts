import { create } from 'zustand'

export type Theme = 'light' | 'dark' | 'system'
export type ResolvedTheme = 'light' | 'dark'

interface ThemeState {
  theme: Theme
  resolvedTheme: ResolvedTheme
  setTheme: (theme: Theme) => void
  toggleTheme: () => void
}

const STORAGE_KEY = 'lifeos_theme'

const getSystemTheme = (): ResolvedTheme => {
  if (typeof window === 'undefined' || !window.matchMedia) return 'dark'
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

const getStoredTheme = (): Theme => {
  if (typeof window === 'undefined') return 'system'
  const saved = localStorage.getItem(STORAGE_KEY) as Theme
  if (saved === 'dark' || saved === 'light' || saved === 'system') {
    return saved
  }
  return 'system'
}

const resolveTheme = (theme: Theme): ResolvedTheme => {
  if (theme === 'system') {
    return getSystemTheme()
  }
  return theme
}

const applyThemeToDOM = (resolved: ResolvedTheme) => {
  if (typeof document === 'undefined') return

  const root = document.documentElement
  if (resolved === 'dark') {
    root.classList.add('dark')
    root.style.colorScheme = 'dark'
  } else {
    root.classList.remove('dark')
    root.style.colorScheme = 'light'
  }

  // Synchronize mobile browser address bar / notch / status bar color
  const metaThemeColor = document.querySelector('meta[name="theme-color"]')
  if (metaThemeColor) {
    metaThemeColor.setAttribute('content', resolved === 'dark' ? '#090a10' : '#ffffff')
  }
}

// Initial calculation & immediate DOM application
const initialTheme = getStoredTheme()
const initialResolved = resolveTheme(initialTheme)
applyThemeToDOM(initialResolved)

export const useThemeStore = create<ThemeState>((set, get) => {
  // Listen for OS system theme changes
  if (typeof window !== 'undefined' && window.matchMedia) {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
    const handleSystemChange = () => {
      const currentTheme = get().theme
      if (currentTheme === 'system') {
        const nextResolved = getSystemTheme()
        applyThemeToDOM(nextResolved)
        set({ resolvedTheme: nextResolved })
      }
    }

    try {
      mediaQuery.addEventListener('change', handleSystemChange)
    } catch {
      // Fallback for older Safari/browsers
      mediaQuery.addListener?.(handleSystemChange)
    }
  }

  return {
    theme: initialTheme,
    resolvedTheme: initialResolved,

    setTheme: (theme: Theme) => {
      try {
        localStorage.setItem(STORAGE_KEY, theme)
      } catch {
        // Safe fallback in incognito / restricted storage
      }
      const resolved = resolveTheme(theme)
      applyThemeToDOM(resolved)
      set({ theme, resolvedTheme: resolved })
    },

    toggleTheme: () => {
      const current = get().theme
      // Quick cycle: light -> dark -> system -> light
      let next: Theme
      if (current === 'light') {
        next = 'dark'
      } else if (current === 'dark') {
        next = 'system'
      } else {
        next = 'light'
      }
      get().setTheme(next)
    },
  }
})
