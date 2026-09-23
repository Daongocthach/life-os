import {
  LayoutDashboard,
  Wallet,
  BookOpen,
  Dumbbell,
  Utensils,
  CheckSquare,
  Sparkles,
  Globe,
  Sun,
  Moon,
  LogOut,
  Eye,
  EyeOff,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useI18n } from '@/hooks/useI18n'
import { useTheme } from '@/hooks/useTheme'
import { useAuth } from '@/hooks/useAuth'
import { usePrivacy } from '@/hooks/usePrivacy'
import { cn } from '@/lib/utils'
import type { NavTab } from './BottomNav'

interface SidebarProps {
  currentTab: NavTab
  onSelectTab: (tab: NavTab) => void
}

export function Sidebar({ currentTab, onSelectTab }: SidebarProps) {
  const { t, language, toggleLanguage } = useI18n()
  const { isDark, toggleTheme } = useTheme()
  const { user, logout } = useAuth()
  const { isMasked, toggleMask } = usePrivacy()

  const navItems = [
    { id: 'dashboard' as NavTab, label: t.common.dashboard, icon: LayoutDashboard },
    { id: 'finance' as NavTab, label: t.common.finance, icon: Wallet },
    { id: 'english' as NavTab, label: t.common.english, icon: BookOpen },
    { id: 'workout' as NavTab, label: t.common.workout, icon: Dumbbell },
    { id: 'meals' as NavTab, label: t.common.meals, icon: Utensils },
    { id: 'tasks' as NavTab, label: t.common.tasks, icon: CheckSquare },
  ]

  return (
    <aside className="hidden md:flex md:w-64 md:flex-col md:fixed md:inset-y-0 z-40 border-r border-border/70 bg-card/60 backdrop-blur-xl">
      {/* Brand Header */}
      <div className="flex h-16 items-center justify-between px-5 border-b border-border/60">
        <div className="flex items-center space-x-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-sm">
            <Sparkles className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center space-x-1.5">
              <span className="font-bold tracking-tight text-lg text-foreground">LifeOS</span>
              <span className="text-[10px] font-semibold px-1.5 py-0.2 rounded-full bg-primary/10 text-primary">
                v1.0
              </span>
            </div>
            <p className="text-[10px] text-muted-foreground leading-none mt-0.5">
              Personal OS
            </p>
          </div>
        </div>

        {/* Desktop Quick Eye Privacy Toggle */}
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleMask}
          className="h-8 w-8 text-muted-foreground hover:text-foreground"
          title={isMasked ? 'Bấm để hiển thị số tiền' : 'Bấm để che số tiền'}
        >
          {isMasked ? (
            <EyeOff className="h-4 w-4 text-muted-foreground" />
          ) : (
            <Eye className="h-4 w-4 text-primary" />
          )}
        </Button>
      </div>

      {/* Navigation Links */}
      <div className="flex-1 overflow-y-auto px-4 py-5 space-y-1.5">
        <div className="px-3 mb-2 text-[10px] font-bold uppercase tracking-wider text-muted-foreground/70">
          Menu Chính
        </div>
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive = currentTab === item.id
          return (
            <button
              key={item.id}
              onClick={() => onSelectTab(item.id)}
              className={cn(
                'w-full flex items-center space-x-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 select-none group',
                isActive
                  ? 'bg-primary text-primary-foreground shadow-sm font-semibold'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
              )}
            >
              <Icon
                className={cn(
                  'h-4 w-4 shrink-0 transition-transform group-hover:scale-110',
                  isActive ? 'text-primary-foreground' : 'text-muted-foreground group-hover:text-foreground'
                )}
              />
              <span className="truncate">{item.label}</span>
            </button>
          )
        })}
      </div>

      {/* Bottom User & System Controls */}
      <div className="p-4 border-t border-border/60 space-y-3 bg-muted/20">
        {/* Language & Theme Switchers */}
        <div className="flex items-center justify-between px-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleLanguage}
            className="h-8 px-2.5 text-xs text-muted-foreground hover:text-foreground flex items-center space-x-1.5"
            title="Switch Language"
          >
            <Globe className="h-3.5 w-3.5" />
            <span className="font-semibold uppercase">{language}</span>
          </Button>

          <Button
            variant="ghost"
            size="icon"
            onClick={toggleTheme}
            className="h-8 w-8 text-muted-foreground hover:text-foreground"
            title={isDark ? 'Light Mode' : 'Dark Mode'}
          >
            {isDark ? (
              <Sun className="h-4 w-4 text-amber-400" />
            ) : (
              <Moon className="h-4 w-4 text-slate-700" />
            )}
          </Button>
        </div>

        {/* User profile & Logout */}
        <div className="pt-2 border-t border-border/40 flex items-center justify-between">
          <div className="truncate pr-2">
            <p className="text-xs font-semibold text-foreground truncate">
              {user?.email?.split('@')[0] || 'Tài khoản'}
            </p>
            <p className="text-[10px] text-muted-foreground truncate">
              {user?.email || 'Logged in'}
            </p>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={logout}
            className="h-8 w-8 text-muted-foreground hover:text-destructive shrink-0"
            title="Đăng xuất"
          >
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </aside>
  )
}
