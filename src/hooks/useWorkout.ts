import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from '@/stores/authStore'
import { toast } from 'sonner'
import type { WorkoutRoutine, WorkoutRoutineExercise } from '@/types'
import type { RoutineFormValues, RoutineExerciseFormValues } from '@/schemas/workoutSchema'
import { format } from 'date-fns'

export function useWorkout() {
  const queryClient = useQueryClient()
  const user = useAuthStore((state) => state.user)
  const currentDayOfWeek = new Date().getDay() // 0 = Sunday, 1 = Monday, etc.
  const todayStr = format(new Date(), 'yyyy-MM-dd')

  // 1. Fetch routines
  const { data: routines = [], isLoading: isLoadingRoutines } = useQuery<WorkoutRoutine[]>({
    queryKey: ['workout_routines', user?.id],
    queryFn: async () => {
      let query = supabase.from('workout_routines').select('*, exercises:workout_routine_exercises(*, exercises(*))').order('day_of_week')
      if (user?.id) {
        query = query.eq('user_id', user.id)
      }
      const { data, error } = await query
      if (error) throw error
      return (data || []) as WorkoutRoutine[]
    },
  })

  // 2. Fetch today's workout session check-in
  const { data: todaySession, isLoading: isLoadingSession } = useQuery({
    queryKey: ['workout_session_today', todayStr],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('workout_sessions')
        .select('*')
        .eq('workout_date', todayStr)
        .maybeSingle()
      if (error && error.code !== 'PGRST116') throw error
      return data
    },
  })

  // Mutations
  const addRoutineMutation = useMutation({
    mutationFn: async (values: RoutineFormValues) => {
      const { data, error } = await supabase.from('workout_routines').insert([
        {
          user_id: user?.id || '94f8ff1b-439c-43b1-b9f0-5a970754da31',
          day_of_week: values.day_of_week,
          session_name: values.session_name,
          notes: values.notes || null,
        },
      ]).select().single()

      if (error) throw error
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workout_routines'] })
      toast.success('Đã thêm lịch tập')
    },
    onError: (err: Error) => {
      toast.error('Lỗi khi thêm lịch tập: ' + err.message)
    },
  })

  const addExerciseMutation = useMutation({
    mutationFn: async (values: RoutineExerciseFormValues) => {
      // First ensure exercise exists or create a custom one
      const { data: exData, error: exErr } = await supabase
        .from('exercises')
        .insert([
          {
            user_id: user?.id || '94f8ff1b-439c-43b1-b9f0-5a970754da31',
            name: values.exercise_name,
            default_sets: values.target_sets,
            default_reps: values.target_reps,
            default_weight_kg: values.target_weight_kg,
          },
        ])
        .select()
        .single()

      if (exErr) throw exErr

      const { data, error } = await supabase.from('workout_routine_exercises').insert([
        {
          routine_id: values.routine_id,
          exercise_id: exData.id,
          target_sets: values.target_sets,
          target_reps: values.target_reps,
          target_weight_kg: values.target_weight_kg,
        },
      ]).select().single()

      if (error) throw error
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workout_routines'] })
      toast.success('Đã thêm bài tập vào lịch')
    },
    onError: (err: Error) => {
      toast.error('Lỗi khi thêm bài tập: ' + err.message)
    },
  })

  const deleteRoutineMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('workout_routines').delete().eq('id', id)
      if (error) throw error
      return id
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workout_routines'] })
      toast.success('Đã xóa buổi tập')
    },
  })

  const checkinWorkoutTodayMutation = useMutation({
    mutationFn: async (sessionName: string) => {
      const { data, error } = await supabase.from('workout_sessions').insert([
        {
          user_id: user?.id || '94f8ff1b-439c-43b1-b9f0-5a970754da31',
          workout_date: todayStr,
          name: sessionName,
          duration_minutes: 60,
        },
      ]).select().single()
      if (error) throw error
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workout_session_today'] })
      toast.success('Tuyệt vời! Đã đánh dấu hoàn thành buổi tập hôm nay!')
    },
  })

  const todayRoutine = routines.find((r) => r.day_of_week === currentDayOfWeek)

  return {
    routines,
    currentDayOfWeek,
    todayRoutine,
    isTodayWorkoutDone: !!todaySession,
    isLoading: isLoadingRoutines || isLoadingSession,
    addRoutine: addRoutineMutation.mutateAsync,
    addExercise: addExerciseMutation.mutateAsync,
    deleteRoutine: deleteRoutineMutation.mutateAsync,
    checkinToday: () =>
      checkinWorkoutTodayMutation.mutateAsync(todayRoutine?.session_name || 'Buổi tập hôm nay'),
  }
}
