import { z } from 'zod'

export const createLessonSchema = z.object({
  title: z.string().min(1, 'Tiêu đề không được để trống'),
  level: z.string().min(1, 'Vui lòng chọn hoặc nhập trình độ'),
  topic: z.string().min(1, 'Vui lòng nhập chủ đề bài đọc'),
  transcript: z.string().min(10, 'Đoạn văn tiếng Anh phải từ 10 ký tự trở lên'),
  translation: z.string().min(10, 'Bản dịch tiếng Việt phải từ 10 ký tự trở lên'),
})

export type CreateLessonFormValues = z.infer<typeof createLessonSchema>
