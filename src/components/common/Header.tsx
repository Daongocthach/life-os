import { Moon, Sun, Globe, LogOut, Eye, EyeOff } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { LifeOSLogo } from '@/components/common/LifeOSLogo'
import { useTheme } from '@/hooks/useTheme'
import { useI18n } from '@/hooks/useI18n'
import { useAuth } from '@/hooks/useAuth'
import { usePrivacy } from '@/hooks/usePrivacy'

export function Header() {
  const { isDark, toggleTheme } = useTheme()
  const { language, toggleLanguage } = useI18n()
  const { logout, isAuthenticated } = useAuth()
  const { isMasked, toggleMask } = usePrivacy()

  return (
    <header className="md:hidden sticky top-0 z-40 w-full border-b border-border/60 bg-background/80 backdrop-blur-md">
      <div className="container flex h-14 items-center justify-between px-4">
        {/* Mobile Brand */}
        <div className="flex items-center space-x-2.5">
          <LifeOSLogo size={28} />
          <span className="font-bold tracking-tight text-base text-foreground">LifeOS</span>
        </div>

        {/* Mobile Controls */}
        <div className="flex items-center space-x-1">
          {/* Eye Privacy Toggle */}
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleMask}
            className="h-8 w-8 text-muted-foreground hover:text-foreground"
            title={isMasked ? 'Hiển thị số tiền' : 'Ẩn số tiền'}
          >
            {isMasked ? <EyeOff className="h-4 w-4 text-muted-foreground" /> : <Eye className="h-4 w-4 text-primary" />}
          </Button>

          {/* Language Switch */}
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleLanguage}
            className="h-8 px-2 text-xs"
            title="Ngôn ngữ"
          >
            <Globe className="h-3.5 w-3.5 mr-1" />
            <span className="font-semibold uppercase text-[11px]">{language}</span>
          </Button>

          {/* Theme Switch */}
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleTheme}
            className="h-8 w-8"
            title="Đổi theme"
          >
            {isDark ? <Sun className="h-4 w-4 text-amber-400" /> : <Moon className="h-4 w-4 text-slate-700" />}
          </Button>

          {isAuthenticated && (
            <Button
              variant="ghost"
              size="icon"
              onClick={logout}
              className="h-8 w-8 text-muted-foreground hover:text-destructive"
              title="Đăng xuất"
            >
              <LogOut className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>
    </header>
  )
}
