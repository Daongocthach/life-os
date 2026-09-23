import { useState } from 'react'
import { Header } from '@/components/common/Header'
import { Sidebar } from '@/components/common/Sidebar'
import { BottomNav, type NavTab } from '@/components/common/BottomNav'
import { GlobalConfirmDialog } from '@/components/common/GlobalConfirmDialog'
import { DashboardView } from '@/components/dashboard/DashboardView'
import { FinanceView } from '@/components/finance/FinanceView'
import { EnglishView } from '@/components/english/EnglishView'
import { WorkoutView } from '@/components/workout/WorkoutView'
import { MealsView } from '@/components/meals/MealsView'
import { TasksView } from '@/components/tasks/TasksView'
import { LoginView } from '@/components/auth/LoginView'
import { useAuth } from '@/hooks/useAuth'
import { useTheme } from '@/hooks/useTheme'
import { Toaster } from 'sonner'

export function App() {
  const [currentTab, setCurrentTab] = useState<NavTab>('dashboard')
  const { isAuthenticated, isLoading } = useAuth()
  const { theme } = useTheme()

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background text-foreground">
        <div className="flex flex-col items-center space-y-3">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          <p className="text-xs text-muted-foreground font-medium">Khởi động LifeOS...</p>
        </div>
      </div>
    )
  }

  // If user is not logged in, show Login view
  if (!isAuthenticated) {
    return (
      <>
        <LoginView />
        <Toaster position="top-right" theme={theme} richColors />
      </>
    )
  }

  return (
    <div className="min-h-screen bg-background text-foreground flex font-sans transition-colors duration-200">
      {/* 1. Desktop Sidebar (Left side, fixed on md+) */}
      <Sidebar currentTab={currentTab} onSelectTab={setCurrentTab} />

      {/* 2. Main Content Area (Offset by sidebar width on desktop) */}
      <div className="flex-1 flex flex-col md:pl-64 min-h-screen">
        {/* Mobile Header (Hidden on md+) */}
        <Header />

        {/* Content Container */}
        <main className="flex-1 max-w-5xl w-full mx-auto py-6 px-4 sm:px-8">
          {currentTab === 'dashboard' && <DashboardView onNavigate={setCurrentTab} />}
          {currentTab === 'finance' && <FinanceView />}
          {currentTab === 'english' && <EnglishView />}
          {currentTab === 'workout' && <WorkoutView />}
          {currentTab === 'meals' && <MealsView />}
          {currentTab === 'tasks' && <TasksView />}
        </main>

        {/* Mobile Bottom Navigation (Hidden on md+) */}
        <BottomNav currentTab={currentTab} onSelectTab={setCurrentTab} />
      </div>

      {/* Global Confirm Modal (No browser alerts) */}
      <GlobalConfirmDialog />

      {/* Global Toast Sonner */}
      <Toaster position="top-right" theme={theme} richColors closeButton />
    </div>
  )
}

export default App
