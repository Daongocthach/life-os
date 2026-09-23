import {
  LayoutDashboard,
  Wallet,
  BookOpen,
  Dumbbell,
  Utensils,
  CheckSquare,
} from 'lucide-react'
import { useI18n } from '@/hooks/useI18n'
import { cn } from '@/lib/utils'

export type NavTab = 'dashboard' | 'finance' | 'english' | 'workout' | 'meals' | 'tasks'

interface BottomNavProps {
  currentTab: NavTab
  onSelectTab: (tab: NavTab) => void
}

export function BottomNav({ currentTab, onSelectTab }: BottomNavProps) {
  const { t } = useI18n()

  const tabs = [
    { id: 'dashboard' as NavTab, label: t.common.dashboard, icon: LayoutDashboard },
    { id: 'finance' as NavTab, label: t.common.finance, icon: Wallet },
    { id: 'english' as NavTab, label: t.common.english, icon: BookOpen },
    { id: 'workout' as NavTab, label: t.common.workout, icon: Dumbbell },
    { id: 'meals' as NavTab, label: t.common.meals, icon: Utensils },
    { id: 'tasks' as NavTab, label: t.common.tasks, icon: CheckSquare },
  ]

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 border-t border-border/70 bg-background/90 backdrop-blur-lg">
      <div className="container flex h-16 max-w-lg items-center justify-around px-2">
        {tabs.map((tab) => {
          const Icon = tab.icon
          const isActive = currentTab === tab.id
          return (
            <button
              key={tab.id}
              onClick={() => onSelectTab(tab.id)}
              className={cn(
                'flex flex-col items-center justify-center flex-1 h-full py-1 text-xs font-medium transition-all duration-150 select-none relative',
                isActive
                  ? 'text-primary scale-105'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              <div
                className={cn(
                  'flex items-center justify-center w-8 h-8 rounded-xl transition-colors',
                  isActive && 'bg-primary/10'
                )}
              >
                <Icon className={cn('h-4 w-4', isActive ? 'stroke-[2.5]' : 'stroke-[1.8]')} />
              </div>
              <span className="text-[10px] tracking-tight mt-0.5">{tab.label}</span>
              {isActive && (
                <span className="absolute top-1 w-1.5 h-1.5 rounded-full bg-primary" />
              )}
            </button>
          )
        })}
      </div>
    </nav>
  )
}
