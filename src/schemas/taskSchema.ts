import { z } from 'zod'

export const taskSchema = z.object({
  title: z.string().min(1, 'Tiêu đề công việc không được để trống'),
  description: z.string().optional().nullable(),
  priority: z.coerce.number().min(1).max(3),
  due_date: z.string().optional().nullable(),
  due_time: z.string().optional().nullable(),
  category: z.string().optional().nullable(),
  success_criteria: z.string().optional().nullable(),
  is_today_priority: z.boolean().optional(),
})

export type TaskFormValues = z.infer<typeof taskSchema>

export const ideaSchema = z.object({
  title: z.string().min(1, 'Tiêu đề ý tưởng không được để trống'),
  note: z.string().optional().nullable(),
})

export type IdeaFormValues = z.infer<typeof ideaSchema>

export const dailyReviewSchema = z.object({
  accomplishments: z.string().optional().nullable(),
  carry_over_notes: z.string().optional().nullable(),
})

export type DailyReviewFormValues = z.infer<typeof dailyReviewSchema>
