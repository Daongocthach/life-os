import { useFinance } from './useFinance'
import { useTasks } from './useTasks'
import { useEnglishStudy } from './useEnglishStudy'

export function useDashboard() {
  const finance = useFinance()
  const tasks = useTasks()
  const english = useEnglishStudy()

  return {
    finance: {
      spendingToday: finance.spendingToday,
      spendingThisWeek: finance.spendingThisWeek,
      spendingThisMonth: finance.spendingThisMonth,
      balance: finance.balance,
      goals: finance.goals,
      isLoading: finance.isLoading,
    },
    tasks: {
      pendingToday: tasks.pendingTasksToday,
      toggleTask: tasks.toggleTask,
      isLoading: tasks.isLoading,
    },
    english: {
      currentLesson: english.currentLesson,
      isDone: english.isTodayCompleted,
      todaySession: english.todaySession,
      currentStep: english.currentStep,
      isLoading: english.isLoading,
    },
  }
}
