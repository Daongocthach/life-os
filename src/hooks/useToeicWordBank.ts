import { useState, useMemo, useCallback } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from '@/stores/authStore'
import { toast } from 'sonner'
import type { ToeicWordItem, WordBankFilter } from '@/types/toeicVocab'

export function useToeicWordBank() {
  const queryClient = useQueryClient()
  const user = useAuthStore((state) => state.user)

  const [selectedDay, setSelectedDay] = useState<number | 'all'>(1)
  const [filterMode, setFilterMode] = useState<WordBankFilter>('all')
  const [searchQuery, setSearchQuery] = useState<string>('')

  // 1. Fetch all words from Supabase
  const {
    data: words = [],
    isLoading,
    error,
    refetch,
  } = useQuery<ToeicWordItem[]>({
    queryKey: ['toeic_month_vocab'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('toeic_month_vocab')
        .select('*')
        .order('day', { ascending: true })
        .order('order_index', { ascending: true })

      if (error) {
        console.error('Error fetching toeic_month_vocab:', error)
        throw error
      }
      return (data || []) as ToeicWordItem[]
    },
  })

  // 2. Filter words based on selectedDay, filterMode, and search query
  const filteredWords = useMemo(() => {
    return words.filter((item) => {
      // Day filter
      if (selectedDay !== 'all' && item.day !== selectedDay) {
        return false
      }

      // Filter status
      if (filterMode === 'not_in_flashcard' && item.in_flashcard) {
        return false
      }
      if (filterMode === 'in_flashcard' && !item.in_flashcard) {
        return false
      }
      if (filterMode === 'mastered' && !item.is_mastered) {
        return false
      }

      // Search filter
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase().trim()
        const matchWord = item.word.toLowerCase().includes(query)
        const matchMeaning = item.meaning.toLowerCase().includes(query)
        const matchUserMeaning = item.user_meaning?.toLowerCase().includes(query)
        const matchCollocation = item.collocation.toLowerCase().includes(query)
        const matchCollocMeaning = item.collocation_meaning.toLowerCase().includes(query)
        if (!matchWord && !matchMeaning && !matchUserMeaning && !matchCollocation && !matchCollocMeaning) {
          return false
        }
      }

      return true
    })
  }, [words, selectedDay, filterMode, searchQuery])

  // Stats
  const totalCount = words.length
  const inFlashcardCount = words.filter((w) => w.in_flashcard).length
  const masteredCount = words.filter((w) => w.is_mastered).length
  const userMeaningCount = words.filter((w) => !!w.user_meaning?.trim()).length

  // 3. Mutation: Update User Meaning
  const updateUserMeaningMutation = useMutation({
    mutationFn: async ({ id, user_meaning }: { id: string; user_meaning: string }) => {
      const { error } = await supabase
        .from('toeic_month_vocab')
        .update({
          user_meaning,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id)

      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['toeic_month_vocab'] })
      toast.success('Đã lưu nghĩa tiếng Việt của bạn lên Supabase!')
    },
    onError: (err: any) => {
      toast.error('Không thể lưu nghĩa: ' + err.message)
    },
  })

  // 4. Mutation: Update User Collocation Meaning
  const updateUserCollocationMeaningMutation = useMutation({
    mutationFn: async ({ id, user_collocation_meaning }: { id: string; user_collocation_meaning: string }) => {
      const { error } = await supabase
        .from('toeic_month_vocab')
        .update({
          user_collocation_meaning,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id)

      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['toeic_month_vocab'] })
      toast.success('Đã lưu câu trả lời nghĩa cụm từ lên Supabase!')
    },
    onError: (err: any) => {
      toast.error('Không thể lưu nghĩa cụm từ: ' + err.message)
    },
  })

  // 5. Mutation: Toggle In Flashcard (Syncs with english_words)
  const toggleFlashcardMutation = useMutation({
    mutationFn: async (item: ToeicWordItem) => {
      const nextInFlashcard = !item.in_flashcard
      const effectiveUserId = user?.id || '94f8ff1b-439c-43b1-b9f0-5a970754da31'

      // A. Update in toeic_month_vocab
      const { error: updateErr } = await supabase
        .from('toeic_month_vocab')
        .update({
          in_flashcard: nextInFlashcard,
          updated_at: new Date().toISOString(),
        })
        .eq('id', item.id)

      if (updateErr) throw updateErr

      // B. If adding to flashcard, insert into english_words
      if (nextInFlashcard) {
        // Check if word already exists in english_words
        const { data: existing } = await supabase
          .from('english_words')
          .select('id')
          .eq('user_id', effectiveUserId)
          .eq('word', item.word)
          .maybeSingle()

        if (!existing) {
          const firstExample = item.example_sentences?.[0]?.en || ''
          await supabase.from('english_words').insert({
            user_id: effectiveUserId,
            word: item.word,
            meaning: item.user_meaning || item.meaning,
            pronunciation: item.phonetic || '',
            example_sentence: firstExample,
            part_of_speech: item.part_of_speech || 'noun',
            mastery: 0,
          })
        }
      } else {
        // If removing from flashcard, delete from english_words
        await supabase
          .from('english_words')
          .delete()
          .eq('user_id', effectiveUserId)
          .eq('word', item.word)
      }

      return nextInFlashcard
    },
    onSuccess: (nextState) => {
      queryClient.invalidateQueries({ queryKey: ['toeic_month_vocab'] })
      queryClient.invalidateQueries({ queryKey: ['english_words'] })
      if (nextState) {
        toast.success('⭐ Đã thêm từ vào Flashcards / Sổ từ để ôn tập!')
      } else {
        toast.info('Đã bỏ từ khỏi danh sách Flashcards.')
      }
    },
    onError: (err: any) => {
      toast.error('Lỗi cập nhật flashcard: ' + err.message)
    },
  })

  // 6. Mutation: Toggle Mastered
  const toggleMasteredMutation = useMutation({
    mutationFn: async (item: ToeicWordItem) => {
      const nextMastered = !item.is_mastered
      const { error } = await supabase
        .from('toeic_month_vocab')
        .update({
          is_mastered: nextMastered,
          updated_at: new Date().toISOString(),
        })
        .eq('id', item.id)

      if (error) throw error
      return nextMastered
    },
    onSuccess: (nextState) => {
      queryClient.invalidateQueries({ queryKey: ['toeic_month_vocab'] })
      if (nextState) {
        toast.success('🎉 Đã đánh dấu thuộc từ vựng này!')
      } else {
        toast.info('Đã bỏ đánh dấu thuộc.')
      }
    },
    onError: (err: any) => {
      toast.error('Lỗi cập nhật: ' + err.message)
    },
  })

  // 7. Speech synthesis helper
  const speak = useCallback((text: string, rate: number = 0.9) => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return
    window.speechSynthesis.cancel()
    const utterance = new SpeechSynthesisUtterance(text)
    utterance.lang = 'en-US'
    utterance.rate = rate
    window.speechSynthesis.speak(utterance)
  }, [])

  return {
    words,
    filteredWords,
    isLoading,
    error,
    refetch,
    // Filters & Navigation
    selectedDay,
    setSelectedDay,
    filterMode,
    setFilterMode,
    searchQuery,
    setSearchQuery,
    // Stats
    totalCount,
    inFlashcardCount,
    masteredCount,
    userMeaningCount,
    // Actions
    updateUserMeaning: updateUserMeaningMutation.mutate,
    isUpdatingMeaning: updateUserMeaningMutation.isPending,
    updateUserCollocationMeaning: updateUserCollocationMeaningMutation.mutate,
    isUpdatingCollocMeaning: updateUserCollocationMeaningMutation.isPending,
    toggleFlashcard: toggleFlashcardMutation.mutate,
    isTogglingFlashcard: toggleFlashcardMutation.isPending,
    toggleMastered: toggleMasteredMutation.mutate,
    speak,
  }
}
