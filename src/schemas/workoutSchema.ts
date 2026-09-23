import { z } from 'zod'

export const routineSchema = z.object({
  day_of_week: z.coerce.number().min(0).max(6),
  session_name: z.string().min(1, 'Tên buổi tập không được để trống'),
  notes: z.string().optional().nullable(),
})

export type RoutineFormValues = z.infer<typeof routineSchema>

export const routineExerciseSchema = z.object({
  routine_id: z.string().min(1),
  exercise_name: z.string().min(1, 'Tên bài tập không được để trống'),
  target_sets: z.coerce.number().positive(),
  target_reps: z.coerce.number().positive(),
  target_weight_kg: z.coerce.number().min(0),
})

export type RoutineExerciseFormValues = z.infer<typeof routineExerciseSchema>
