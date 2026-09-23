import { useFinance } from './useFinance'
import { useTasks } from './useTasks'
import { useWorkout } from './useWorkout'
import { useMeals } from './useMeals'
import { useEnglishStudy } from './useEnglishStudy'

export function useDashboard() {
  const finance = useFinance()
  const tasks = useTasks()
  const workout = useWorkout()
  const meals = useMeals()
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
    workout: {
      todayRoutine: workout.todayRoutine,
      isDone: workout.isTodayWorkoutDone,
      checkinToday: workout.checkinToday,
      isLoading: workout.isLoading,
    },
    meals: {
      todayMeals: meals.todayMeals,
      isLoading: meals.isLoading,
    },
    english: {
      currentLesson: english.currentLesson,
      isDone: english.isTodayCompleted,
      todaySession: english.todaySession,
      isLoading: english.isLoading,
    },
  }
}
