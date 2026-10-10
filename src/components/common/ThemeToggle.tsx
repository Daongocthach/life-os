import { useState, useRef, useEffect } from 'react'
import { Sun, Moon, Laptop, Check } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useTheme, type Theme } from '@/hooks/useTheme'
import { useI18n } from '@/hooks/useI18n'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'

interface ThemeToggleProps {
  variant?: 'button' | 'segmented' | 'dropdown'
  showLabels?: boolean
  className?: string
  size?: 'sm' | 'default'
}

export function ThemeToggle({
  variant = 'button',
  showLabels = false,
  className,
  size = 'default',
}: ThemeToggleProps) {
  const { theme, resolvedTheme, setTheme, toggleTheme } = useTheme()
  const { t } = useI18n()
  const [isOpen, setIsOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  // Close dropdown on click outside
  useEffect(() => {
    if (!isOpen) return
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [isOpen])

  const handleSelectTheme = (newTheme: Theme) => {
    setTheme(newTheme)
    setIsOpen(false)
    if (newTheme === 'light') {
      toast.success(t.theme.toastLight)
    } else if (newTheme === 'dark') {
      toast.success(t.theme.toastDark)
    } else {
      toast.success(t.theme.toastSystem)
    }
  }

  const handleCycleTheme = () => {
    toggleTheme()
    // determine next state
    let next: Theme = 'light'
    if (theme === 'light') next = 'dark'
    else if (theme === 'dark') next = 'system'
    else next = 'light'

    if (next === 'light') toast.success(t.theme.toastLight)
    else if (next === 'dark') toast.success(t.theme.toastDark)
    else toast.success(t.theme.toastSystem)
  }

  // Segmented 3-button control (ideal for Sidebar footer or settings cards)
  if (variant === 'segmented') {
    const options: Array<{ value: Theme; label: string; icon: typeof Sun }> = [
      { value: 'light', label: t.theme.light, icon: Sun },
      { value: 'dark', label: t.theme.dark, icon: Moon },
      { value: 'system', label: t.theme.system, icon: Laptop },
    ]

    return (
      <div
        className={cn(
          'inline-flex items-center p-1 bg-muted/60 dark:bg-muted/40 rounded-xl border border-border/50 text-xs select-none',
          className
        )}
        role="group"
        aria-label={t.theme.title}
      >
        {options.map((opt) => {
          const Icon = opt.icon
          const isSelected = theme === opt.value
          return (
            <button
              key={opt.value}
              type="button"
              onClick={() => handleSelectTheme(opt.value)}
              className={cn(
                'flex items-center justify-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium transition-all duration-150',
                isSelected
                  ? 'bg-background text-foreground shadow-xs font-semibold'
                  : 'text-muted-foreground hover:text-foreground hover:bg-background/40'
              )}
              title={`${t.theme.title}: ${opt.label}`}
            >
              <Icon
                className={cn(
                  'h-3.5 w-3.5 shrink-0',
                  isSelected && opt.value === 'light' && 'text-amber-500',
                  isSelected && opt.value === 'dark' && 'text-indigo-400',
                  isSelected && opt.value === 'system' && 'text-sky-500'
                )}
              />
              {showLabels && <span>{opt.label}</span>}
            </button>
          )
        })}
      </div>
    )
  }

  // Dropdown variant (clickable menu for picking explicitly)
  if (variant === 'dropdown') {
    return (
      <div className={cn('relative inline-block text-left', className)} ref={menuRef}>
        <Button
          variant="ghost"
          size={size === 'sm' ? 'sm' : 'icon'}
          onClick={() => setIsOpen(!isOpen)}
          className={cn(
            'relative h-8 w-8 text-muted-foreground hover:text-foreground',
            isOpen && 'bg-accent text-accent-foreground'
          )}
          title={t.theme.title}
          aria-expanded={isOpen}
        >
          {theme === 'light' && <Sun className="h-4 w-4 text-amber-500" />}
          {theme === 'dark' && <Moon className="h-4 w-4 text-indigo-400" />}
          {theme === 'system' && (
            <Laptop
              className={cn(
                'h-4 w-4',
                resolvedTheme === 'dark' ? 'text-indigo-300' : 'text-amber-600'
              )}
            />
          )}
        </Button>

        {isOpen && (
          <div className="absolute right-0 mt-2 w-44 rounded-xl border border-border/80 bg-popover/95 backdrop-blur-md p-1.5 text-popover-foreground shadow-xl z-50 animate-in fade-in-50 zoom-in-95">
            <div className="px-2.5 py-1 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
              {t.theme.title}
            </div>

            <button
              onClick={() => handleSelectTheme('light')}
              className={cn(
                'w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors text-left',
                theme === 'light'
                  ? 'bg-accent text-accent-foreground font-semibold'
                  : 'text-foreground hover:bg-muted'
              )}
            >
              <div className="flex items-center gap-2">
                <Sun className="h-4 w-4 text-amber-500" />
                <span>{t.theme.light}</span>
              </div>
              {theme === 'light' && <Check className="h-3.5 w-3.5 text-primary" />}
            </button>

            <button
              onClick={() => handleSelectTheme('dark')}
              className={cn(
                'w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors text-left',
                theme === 'dark'
                  ? 'bg-accent text-accent-foreground font-semibold'
                  : 'text-foreground hover:bg-muted'
              )}
            >
              <div className="flex items-center gap-2">
                <Moon className="h-4 w-4 text-indigo-400" />
                <span>{t.theme.dark}</span>
              </div>
              {theme === 'dark' && <Check className="h-3.5 w-3.5 text-primary" />}
            </button>

            <button
              onClick={() => handleSelectTheme('system')}
              className={cn(
                'w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors text-left',
                theme === 'system'
                  ? 'bg-accent text-accent-foreground font-semibold'
                  : 'text-foreground hover:bg-muted'
              )}
            >
              <div className="flex items-center gap-2">
                <Laptop className="h-4 w-4 text-sky-500" />
                <span>{t.theme.system}</span>
              </div>
              {theme === 'system' && <Check className="h-3.5 w-3.5 text-primary" />}
            </button>
          </div>
        )}
      </div>
    )
  }

  // Quick cycle button variant (Light -> Dark -> System)
  const currentTitle =
    theme === 'light'
      ? `${t.theme.title}: ${t.theme.light} (${t.theme.switchToDark})`
      : theme === 'dark'
      ? `${t.theme.title}: ${t.theme.dark} (${t.theme.switchToSystem})`
      : `${t.theme.title}: ${t.theme.system} (${t.theme.switchToLight})`

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={handleCycleTheme}
      className={cn(
        'h-8 w-8 text-muted-foreground hover:text-foreground relative transition-transform active:scale-95',
        className
      )}
      title={currentTitle}
      aria-label={currentTitle}
    >
      {theme === 'light' && <Sun className="h-4 w-4 text-amber-500 animate-in spin-in-180 duration-200" />}
      {theme === 'dark' && <Moon className="h-4 w-4 text-indigo-400 animate-in spin-in-180 duration-200" />}
      {theme === 'system' && (
        <Laptop
          className={cn(
            'h-4 w-4 animate-in fade-in-50 duration-200',
            resolvedTheme === 'dark' ? 'text-sky-400' : 'text-sky-600'
          )}
        />
      )}
    </Button>
  )
}
