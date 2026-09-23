export interface Profile {
  id: string
  display_name: string | null
  timezone: string
  currency: string
  created_at: string
}

export interface FinanceCategory {
  id: string
  user_id: string
  name: string
  type: 'income' | 'expense' | 'savings' | 'debt' | 'transfer'
  is_active: boolean
}

export interface FinanceTransaction {
  id: string
  user_id: string
  occurred_on: string
  description: string
  category_id: string | null
  amount: number
  note: string | null
  created_at: string
  category?: FinanceCategory
}

export interface FinanceGoal {
  id: string
  user_id: string
  name: string
  target_amount: number
  current_amount: number
  target_date: string | null
  note: string | null
  created_at: string
}

export interface Task {
  id: string
  user_id: string
  title: string
  description: string | null
  priority: 1 | 2 | 3 // 1: High, 2: Medium, 3: Low
  due_date: string | null
  due_time: string | null
  is_recurring: boolean
  recurrence_rule: string | null
  category: string | null
  created_at: string
  is_completed?: boolean
}

export interface TaskCompletion {
  id: string
  task_id: string
  completed_on: string
  completed_at: string
  note: string | null
}

export interface WorkoutRoutine {
  id: string
  user_id: string
  day_of_week: number // 0: Sunday, 1: Monday, ... 6: Saturday
  session_name: string
  notes: string | null
  exercises?: WorkoutRoutineExercise[]
}

export interface WorkoutRoutineExercise {
  id: string
  routine_id: string
  exercise_id: string
  sort_order: number
  target_weight_kg: number | null
  target_sets: number | null
  target_reps: number | null
  exercise_name?: string
}

export interface Meal {
  id: string
  user_id: string
  name: string
  meal_type: 'breakfast' | 'lunch' | 'dinner' | 'snack' | 'other' | null
  serving_unit: string | null
  calories_kcal: number | null
  protein_g: number | null
  carbs_g: number | null
  fat_g: number | null
  sugar_g: number | null
  sodium_mg: number | null
  notes: string | null
}

export interface DailyMeal {
  id: string
  user_id: string
  meal_date: string
  meal_id: string | null
  meal_type: 'breakfast' | 'lunch' | 'dinner' | 'snack' | 'other'
  servings: number
  eaten_at: string | null
  note: string | null
  meal?: Meal
}

export interface EnglishQuestion {
  type: 'fill' | 'meaning' | 'comprehension'
  question: string
  answer: string
  sourceWord?: string
  options?: string[] // For multiple choice
}

export interface EnglishLessonContent {
  version: number
  youtube_id?: string
  transcript: string
  translation: string
  words: [string, string][]
  questions: EnglishQuestion[]
  speaking?: {
    prompt: string
    sample: string
  }
}

export interface EnglishLesson {
  id: string
  user_id: string
  title: string
  lesson_type: string | null
  level: string | null
  source_url: string | null
  content: string // JSON parsed to EnglishLessonContent
  topic: string | null
  content_version: number
  created_at: string
}

export interface EnglishLearningSession {
  id: string
  user_id?: string
  lesson_id: string
  study_date: string
  listen_count: number
  listen_mode: string
  duration_seconds: number
  listening_score: number | null
  speaking_score: number | null
  completed: boolean
  notes: string | null
  created_at: string
}

export interface EnglishLessonWithProgress extends EnglishLesson {
  todaySession?: EnglishLearningSession | null
  currentStep: number // 1 to 7
  isCompletedToday: boolean
  score?: number | null
}

export interface EnglishWord {
  id: string
  user_id: string
  word: string
  meaning: string | null
  pronunciation: string | null
  example_sentence: string | null
  part_of_speech: string | null
  mastery: number
  next_review_on: string | null
}
