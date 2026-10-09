export interface ToeicVocabSentence {
  en: string
  vi: string
}

export interface ToeicWordItem {
  id: string
  user_id?: string | null
  day: number
  order_index: number
  word: string
  phonetic?: string | null
  part_of_speech?: string | null
  meaning: string
  user_meaning?: string | null
  collocation: string
  collocation_meaning: string
  user_collocation_meaning?: string | null
  example_sentences: ToeicVocabSentence[]
  topic?: string | null
  is_mastered: boolean
  in_flashcard: boolean
  created_at?: string
  updated_at?: string
}

export type WordBankFilter = 'all' | 'not_in_flashcard' | 'in_flashcard' | 'mastered'
