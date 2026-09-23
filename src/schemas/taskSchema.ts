import { z } from 'zod'

export const taskSchema = z.object({
  title: z.string().min(1, 'Tiêu đề công việc không được để trống'),
  description: z.string().optional().nullable(),
  priority: z.coerce.number().min(1).max(3),
  due_date: z.string().optional().nullable(),
  due_time: z.string().optional().nullable(),
  category: z.string().optional().nullable(),
})

export type TaskFormValues = z.infer<typeof taskSchema>
