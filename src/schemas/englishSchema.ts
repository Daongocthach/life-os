import { z } from 'zod'

export function extractYoutubeId(input?: string | null): string | undefined {
  if (!input) return undefined
  const trimmed = input.trim()
  if (!trimmed) return undefined
  if (/^[a-zA-Z0-9_-]{11}$/.test(trimmed)) {
    return trimmed
  }
  const match = trimmed.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([\w-]{11})/)
  return match ? match[1] : undefined
}

export const createLessonSchema = z.object({
  title: z.string().min(1, 'Tiêu đề không được để trống'),
  level: z.string().min(1, 'Vui lòng chọn hoặc nhập trình độ'),
  topic: z.string().min(1, 'Vui lòng nhập chủ đề bài đọc'),
  youtube_url: z.string().optional(),
  transcript: z.string().min(10, 'Đoạn văn tiếng Anh phải từ 10 ký tự trở lên'),
  translation: z.string().min(10, 'Bản dịch tiếng Việt phải từ 10 ký tự trở lên'),
})

export type CreateLessonFormValues = z.infer<typeof createLessonSchema>

export const updateLessonSchema = createLessonSchema

export type UpdateLessonFormValues = CreateLessonFormValues

