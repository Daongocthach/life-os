import { z } from 'zod'

export const transactionSchema = z.object({
  type: z.enum(['income', 'expense']),
  amount: z.coerce.number().positive('Số tiền phải lớn hơn 0'),
  description: z.string().min(1, 'Mô tả không được để trống'),
  category_id: z.string().optional().nullable(),
  occurred_on: z.string().min(1, 'Ngày không được để trống'),
  note: z.string().optional().nullable(),
})

export type TransactionFormValues = z.infer<typeof transactionSchema>

export const goalSchema = z.object({
  name: z.string().min(1, 'Tên mục tiêu không được để trống'),
  target_amount: z.coerce.number().positive('Số tiền mục tiêu phải lớn hơn 0'),
  current_amount: z.coerce.number().min(0, 'Số tiền hiện có không được âm'),
  target_date: z.string().optional().nullable(),
  note: z.string().optional().nullable(),
})

export type GoalFormValues = z.infer<typeof goalSchema>
