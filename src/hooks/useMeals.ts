import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from '@/stores/authStore'
import { toast } from 'sonner'
import type { DailyMeal } from '@/types'
import type { MealFormValues } from '@/schemas/mealSchema'
import { format } from 'date-fns'

export function useMeals() {
  const queryClient = useQueryClient()
  const user = useAuthStore((state) => state.user)
  const todayStr = format(new Date(), 'yyyy-MM-dd')

  // 1. Fetch daily meals
  const { data: dailyMeals = [], isLoading } = useQuery<DailyMeal[]>({
    queryKey: ['daily_meals', user?.id],
    queryFn: async () => {
      let query = supabase
        .from('daily_meals')
        .select('*, meal:meals(*)')
        .order('meal_date', { ascending: false })

      if (user?.id) {
        query = query.eq('user_id', user.id)
      }

      const { data, error } = await query
      if (error) throw error
      return (data || []) as DailyMeal[]
    },
  })

  // Filter today's meals
  const todayMeals = dailyMeals.filter((m) => m.meal_date === todayStr)

  // Mutations
  const addMealMutation = useMutation({
    mutationFn: async (values: MealFormValues) => {
      // 1. Insert into meals
      const { data: mealData, error: mealErr } = await supabase
        .from('meals')
        .insert([
          {
            user_id: user?.id || '94f8ff1b-439c-43b1-b9f0-5a970754da31',
            name: values.name,
            meal_type: values.meal_type,
            calories_kcal: values.calories_kcal,
            protein_g: values.protein_g,
            carbs_g: values.carbs_g,
            fat_g: values.fat_g,
            notes: values.notes || null,
          },
        ])
        .select()
        .single()

      if (mealErr) throw mealErr

      // 2. Insert into daily_meals
      const { data, error } = await supabase.from('daily_meals').insert([
        {
          user_id: user?.id || '94f8ff1b-439c-43b1-b9f0-5a970754da31',
          meal_date: values.meal_date,
          meal_id: mealData.id,
          meal_type: values.meal_type,
          servings: 1,
          note: values.notes || null,
        },
      ]).select().single()

      if (error) throw error
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['daily_meals'] })
      toast.success('Đã thêm món ăn vào thực đơn')
    },
    onError: (err: Error) => {
      toast.error('Lỗi khi thêm thực đơn: ' + err.message)
    },
  })

  const deleteDailyMealMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('daily_meals').delete().eq('id', id)
      if (error) throw error
      return id
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['daily_meals'] })
      toast.success('Đã xóa món khỏi thực đơn')
    },
  })

  return {
    dailyMeals,
    todayMeals,
    isLoading,
    addMeal: addMealMutation.mutateAsync,
    deleteDailyMeal: deleteDailyMealMutation.mutateAsync,
  }
}
