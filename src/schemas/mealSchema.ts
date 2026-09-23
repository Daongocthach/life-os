import { z } from 'zod'

export const mealSchema = z.object({
  name: z.string().min(1, 'Tên món ăn không được để trống'),
  meal_type: z.enum(['breakfast', 'lunch', 'dinner', 'snack', 'other']),
  calories_kcal: z.coerce.number().min(0),
  protein_g: z.coerce.number().min(0),
  carbs_g: z.coerce.number().min(0),
  fat_g: z.coerce.number().min(0),
  notes: z.string().optional().nullable(),
  meal_date: z.string().min(1, 'Ngày không được để trống'),
})

export type MealFormValues = z.infer<typeof mealSchema>
