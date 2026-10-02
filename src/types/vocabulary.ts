export type PartOfSpeech = 'noun' | 'verb' | 'adjective' | 'adverb' | 'idiom' | 'phrase'

export interface DailyVocabWord {
  id: string
  day: number
  word: string
  phonetic: string
  partOfSpeech: PartOfSpeech
  meaning: string
  exampleEn: string
  exampleVi: string
  topic: string
  collocation?: string
}

export interface DailyVocabPack {
  day: number
  title: string
  topic: string
  description: string
  icon?: string
  words: DailyVocabWord[]
}

export type QuizQuestionType = 'en_to_vi' | 'vi_to_en' | 'fill_in' | 'listening'

export interface DailyQuizQuestion {
  id: string
  wordId: string
  word: string
  type: QuizQuestionType
  prompt: string
  contextSentence?: string
  options: string[]
  correctAnswer: string
  explanation: string
}

export interface DailyQuizResult {
  day: number
  date: string
  score: number
  total: number
  percentage: number
  passed: boolean
  timeSpentSeconds: number
  completedAt: string
  wrongAnswers: {
    questionId: string
    prompt: string
    userChoice: string
    correctChoice: string
    word: string
    explanation: string
  }[]
}

export interface DayProgress {
  completedAt?: string
  quizScore?: number
  quizTotal?: number
  percentage?: number
  masteredWordIds: string[]
}
