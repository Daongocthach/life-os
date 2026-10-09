import { useState, useEffect, useMemo, useCallback, useRef } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from '@/stores/authStore'
import { toast } from 'sonner'
import { format } from 'date-fns'
import {
  DAILY_VOCAB_PACKS,
  getDailyVocabPack,
  getTodayDayIndex,
} from '@/data/dailyVocabularyData'
import type {
  DailyVocabWord,
  DailyQuizQuestion,
  DailyQuizResult,
  DayProgress,
} from '@/types/vocabulary'
import type { EnglishWord } from '@/types'

const LOCAL_STORAGE_KEY = 'lifeos_daily_vocab_progress'

interface StoredProgress {
  selectedDay: number
  dailyGoal?: number
  completedDays: Record<number, DayProgress>
}

function loadStoredProgress(): StoredProgress {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY)
    if (raw) {
      const parsed = JSON.parse(raw)
      return {
        selectedDay: parsed.selectedDay || getTodayDayIndex(),
        dailyGoal: parsed.dailyGoal || 50,
        completedDays: parsed.completedDays || {},
      }
    }
  } catch (e) {
    console.error('Failed to load daily vocab progress', e)
  }
  return {
    selectedDay: getTodayDayIndex(),
    dailyGoal: 50,
    completedDays: {},
  }
}

function saveStoredProgress(data: StoredProgress) {
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(data))
  } catch (e) {
    console.error('Failed to save daily vocab progress', e)
  }
}

// Fisher-Yates shuffle helper
function shuffleArray<T>(array: T[]): T[] {
  const arr = [...array]
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[arr[i], arr[j]] = [arr[j], arr[i]]
  }
  return arr
}

// Generate quiz questions dynamically distributed across question types
function generateQuizQuestions(words: DailyVocabWord[]): DailyQuizQuestion[] {
  if (!words || words.length === 0) return []

  const questions: DailyQuizQuestion[] = []
  const quarter = Math.max(1, Math.floor(words.length / 4))

  words.forEach((targetWord, index) => {
    // Other words from the pack for distractors
    const otherWords = words.filter((w) => w.id !== targetWord.id)
    const shuffledOthers = shuffleArray(otherWords)
    const distractorWords = shuffledOthers.slice(0, 3)

    // Assign question type based on index to ensure balanced distribution
    let type: 'en_to_vi' | 'vi_to_en' | 'fill_in' | 'listening' = 'en_to_vi'
    if (index >= quarter && index < quarter * 2) type = 'vi_to_en'
    else if (index >= quarter * 2 && index < quarter * 3) type = 'fill_in'
    else if (index >= quarter * 3) type = 'listening'

    let prompt = ''
    let contextSentence: string | undefined = undefined
    let correctAnswer = ''
    let options: string[] = []

    switch (type) {
      case 'en_to_vi':
        prompt = `Nghĩa tiếng Việt chính xác của từ "${targetWord.word}" (${targetWord.phonetic}) là gì?`
        correctAnswer = targetWord.meaning
        options = shuffleArray([
          targetWord.meaning,
          distractorWords[0]?.meaning || 'Nghĩa khác',
          distractorWords[1]?.meaning || 'Nghĩa khác',
          distractorWords[2]?.meaning || 'Nghĩa khác',
        ])
        break

      case 'vi_to_en':
        prompt = `Từ tiếng Anh nào mang nghĩa: "${targetWord.meaning}"?`
        correctAnswer = targetWord.word
        options = shuffleArray([
          targetWord.word,
          distractorWords[0]?.word || 'Word A',
          distractorWords[1]?.word || 'Word B',
          distractorWords[2]?.word || 'Word C',
        ])
        break

      case 'fill_in': {
        // Replace target word in example sentence with blank
        const regex = new RegExp(targetWord.word, 'gi')
        const blankedSentence = targetWord.exampleEn.replace(regex, '_______')
        prompt = `Điền từ vựng thích hợp nhất vào chỗ trống:`
        contextSentence = `"${blankedSentence}"\n(Dịch: ${targetWord.exampleVi})`
        correctAnswer = targetWord.word
        options = shuffleArray([
          targetWord.word,
          distractorWords[0]?.word || 'Option A',
          distractorWords[1]?.word || 'Option B',
          distractorWords[2]?.word || 'Option C',
        ])
        break
      }

      case 'listening':
        prompt = `Bấm loa nghe phát âm và chọn đúng từ vựng bạn vừa nghe:`
        correctAnswer = targetWord.word
        options = shuffleArray([
          targetWord.word,
          distractorWords[0]?.word || 'Option A',
          distractorWords[1]?.word || 'Option B',
          distractorWords[2]?.word || 'Option C',
        ])
        break
    }

    questions.push({
      id: `q_${targetWord.id}`,
      wordId: targetWord.id,
      word: targetWord.word,
      type,
      prompt,
      contextSentence,
      correctAnswer,
      options,
      explanation: `${targetWord.word} (${targetWord.phonetic} - ${targetWord.partOfSpeech}): ${targetWord.meaning}. Ví dụ: ${targetWord.exampleEn}`,
    })
  })

  return questions
}

export function useDailyVocabulary() {
  const queryClient = useQueryClient()
  const user = useAuthStore((state) => state.user)
  const todayStr = format(new Date(), 'yyyy-MM-dd')

  // Local storage state
  const [storedData, setStoredData] = useState<StoredProgress>(loadStoredProgress)
  const [selectedDay, setSelectedDay] = useState<number>(() => storedData.selectedDay || 1)

  // Goal state (20, 30, 50 words per day - default 50 for TOEIC 850+ bootcamp)
  const [dailyGoal, setDailyGoal] = useState<number>(() => storedData.dailyGoal || 50)

  const handleSetDailyGoal = useCallback((goal: number) => {
    setDailyGoal(goal)
    setCardIndex(0)
    setStoredData((prev) => {
      const nextState = { ...prev, dailyGoal: goal }
      saveStoredProgress(nextState)
      return nextState
    })
  }, [])

  // Current pack and sliced words based on dailyGoal
  const currentPack = useMemo(() => getDailyVocabPack(selectedDay), [selectedDay])
  const words = useMemo(() => currentPack.words.slice(0, dailyGoal), [currentPack, dailyGoal])

  // Flashcards state
  const [cardIndex, setCardIndex] = useState<number>(0)
  const [isFlipped, setIsFlipped] = useState<boolean>(false)

  // Mastered words for this day
  const currentDayProgress = storedData.completedDays[selectedDay]
  const masteredWordIds = useMemo(() => {
    return new Set(currentDayProgress?.masteredWordIds || [])
  }, [currentDayProgress])

  // Quiz state
  const [isQuizActive, setIsQuizActive] = useState<boolean>(false)
  const [quizQuestions, setQuizQuestions] = useState<DailyQuizQuestion[]>([])
  const [currentQuizIndex, setCurrentQuizIndex] = useState<number>(0)
  const [userAnswers, setUserAnswers] = useState<Record<number, string>>({})
  const [quizSubmitted, setQuizSubmitted] = useState<boolean>(false)
  const [quizResult, setQuizResult] = useState<DailyQuizResult | null>(null)
  const [quizStartTime, setQuizStartTime] = useState<number>(0)

  // Audio Tutor (Auto-Play) state
  const [isAutoPlaying, setIsAutoPlaying] = useState<boolean>(false)
  const autoPlayIndexRef = useRef<number>(0)
  const autoPlayTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Voice synthesis
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([])
  const [selectedVoice, setSelectedVoice] = useState<SpeechSynthesisVoice | null>(null)

  useEffect(() => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return

    const loadVoices = () => {
      const v = window.speechSynthesis.getVoices()
      const enVoices = v.filter((item) => item.lang.startsWith('en'))
      setVoices(enVoices)
      if (enVoices.length > 0 && !selectedVoice) {
        const preferred =
          enVoices.find(
            (item) =>
              item.name.includes('Natural') ||
              item.name.includes('Samantha') ||
              item.name.includes('Google US') ||
              item.name.includes('Ava')
          ) ||
          enVoices.find((item) => item.lang === 'en-US') ||
          enVoices[0]
        setSelectedVoice(preferred)
      }
    }

    loadVoices()
    window.speechSynthesis.onvoiceschanged = loadVoices
  }, [selectedVoice])

  // Speak pronunciation
  const speak = useCallback(
    (text: string, rate: number = 0.9) => {
      if (typeof window === 'undefined' || !('speechSynthesis' in window)) return
      window.speechSynthesis.cancel()

      const utterance = new SpeechSynthesisUtterance(text)
      utterance.rate = rate
      utterance.pitch = 1.0
      utterance.lang = 'en-US'
      if (selectedVoice) {
        utterance.voice = selectedVoice
      }
      window.speechSynthesis.speak(utterance)
    },
    [selectedVoice]
  )

  // Fetch saved personal vocabulary words from Supabase
  const { data: savedNotebookWords = [] } = useQuery<EnglishWord[]>({
    queryKey: ['english_words', user?.id],
    queryFn: async () => {
      let query = supabase.from('english_words').select('*').order('word', { ascending: true })
      if (user?.id) {
        query = query.eq('user_id', user.id)
      }
      const { data, error } = await query
      if (error) return []
      return (data || []) as EnglishWord[]
    },
  })

  // Check if a word is in personal notebook
  const isWordSavedInNotebook = useCallback(
    (wordText: string) => {
      const clean = wordText.trim().toLowerCase()
      return savedNotebookWords.some((w) => w.word.toLowerCase() === clean)
    },
    [savedNotebookWords]
  )

  // Save/Remove word to Supabase personal notebook
  const toggleSaveNotebookMutation = useMutation({
    mutationFn: async (vocabWord: DailyVocabWord) => {
      const clean = vocabWord.word.trim().toLowerCase()
      const existing = savedNotebookWords.find((w) => w.word.toLowerCase() === clean)

      if (existing) {
        const { error } = await supabase.from('english_words').delete().eq('id', existing.id)
        if (error) throw error
        return { action: 'removed', word: clean }
      } else {
        const { data, error } = await supabase
          .from('english_words')
          .insert([
            {
              user_id: user?.id || '94f8ff1b-439c-43b1-b9f0-5a970754da31',
              word: vocabWord.word,
              meaning: vocabWord.meaning,
              pronunciation: vocabWord.phonetic,
              example_sentence: vocabWord.exampleEn,
              part_of_speech: vocabWord.partOfSpeech,
              mastery: 1,
            },
          ])
          .select()
          .single()
        if (error) throw error
        return { action: 'added', word: vocabWord.word, data }
      }
    },
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ['english_words'] })
      if (res.action === 'added') {
        toast.success(`Đã thêm "${res.word}" vào Sổ từ vựng ❤️`)
      } else {
        toast.info(`Đã bỏ lưu "${res.word}"`)
      }
    },
    onError: (err: Error) => {
      toast.error('Lỗi khi lưu từ: ' + err.message)
    },
  })

  // Select day handler
  const handleSelectDay = useCallback((day: number) => {
    setSelectedDay(day)
    setCardIndex(0)
    setIsFlipped(false)
    setIsQuizActive(false)
    setQuizSubmitted(false)
    setQuizResult(null)
    setUserAnswers({})
    setCurrentQuizIndex(0)

    setStoredData((prev) => {
      const updated = { ...prev, selectedDay: day }
      saveStoredProgress(updated)
      return updated
    })
  }, [])

  // Toggle master status for a word in current day
  const toggleMasterWord = useCallback(
    (wordId: string) => {
      setStoredData((prev) => {
        const prevDayProgress = prev.completedDays[selectedDay] || {
          masteredWordIds: [],
        }
        const exists = prevDayProgress.masteredWordIds.includes(wordId)
        const updatedList = exists
          ? prevDayProgress.masteredWordIds.filter((id) => id !== wordId)
          : [...prevDayProgress.masteredWordIds, wordId]

        const updatedDays = {
          ...prev.completedDays,
          [selectedDay]: {
            ...prevDayProgress,
            masteredWordIds: updatedList,
          },
        }

        const nextState = { ...prev, completedDays: updatedDays }
        saveStoredProgress(nextState)
        return nextState
      })
    },
    [selectedDay]
  )

  // Card navigation
  const nextCard = useCallback(() => {
    setIsFlipped(false)
    setCardIndex((prev) => (prev < words.length - 1 ? prev + 1 : 0))
  }, [words.length])

  const prevCard = useCallback(() => {
    setIsFlipped(false)
    setCardIndex((prev) => (prev > 0 ? prev - 1 : words.length - 1))
  }, [words.length])

  const flipCard = useCallback(() => {
    setIsFlipped((prev) => !prev)
  }, [])

  // Start Auto-play / Audio Tutor
  const stopAutoPlay = useCallback(() => {
    setIsAutoPlaying(false)
    if (autoPlayTimerRef.current) {
      clearTimeout(autoPlayTimerRef.current)
      autoPlayTimerRef.current = null
    }
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel()
    }
  }, [])

  const startAutoPlay = useCallback(() => {
    setIsAutoPlaying(true)
    autoPlayIndexRef.current = cardIndex

    const playNext = (index: number) => {
      if (index >= words.length) {
        setIsAutoPlaying(false)
        toast.success(`Đã hoàn thành lượt nghe ${words.length} từ vựng!`)
        return
      }

      setCardIndex(index)
      setIsFlipped(false)
      const currentWord = words[index]

      // Step 1: Speak word in English
      speak(currentWord.word, 0.85)

      // Step 2: Speak example sentence after delay
      autoPlayTimerRef.current = setTimeout(() => {
        speak(currentWord.exampleEn, 0.9)

        // Step 3: Advance to next word
        autoPlayTimerRef.current = setTimeout(() => {
          autoPlayIndexRef.current = index + 1
          playNext(index + 1)
        }, 4000)
      }, 2000)
    }

    playNext(cardIndex)
  }, [cardIndex, words, speak])

  // Start Daily Quiz
  const startQuiz = useCallback(() => {
    const questions = generateQuizQuestions(words)
    setQuizQuestions(questions)
    setUserAnswers({})
    setCurrentQuizIndex(0)
    setQuizSubmitted(false)
    setQuizResult(null)
    setIsQuizActive(true)
    setQuizStartTime(Date.now())
  }, [words])

  // Select quiz answer
  const selectAnswer = useCallback((questionIdx: number, answer: string) => {
    setUserAnswers((prev) => ({
      ...prev,
      [questionIdx]: answer,
    }))
  }, [])

  // Submit quiz and calculate result
  const submitQuiz = useCallback(async () => {
    if (quizQuestions.length === 0) return

    let score = 0
    const wrongAnswers: DailyQuizResult['wrongAnswers'] = []

    quizQuestions.forEach((q, idx) => {
      const userChoice = userAnswers[idx] || ''
      if (userChoice.trim().toLowerCase() === q.correctAnswer.trim().toLowerCase()) {
        score++
      } else {
        wrongAnswers.push({
          questionId: q.id,
          prompt: q.prompt,
          userChoice: userChoice || '(Chưa chọn)',
          correctChoice: q.correctAnswer,
          word: q.word,
          explanation: q.explanation,
        })
      }
    })

    const total = quizQuestions.length
    const percentage = Math.round((score / total) * 100)
    const passed = percentage >= 70
    const timeSpentSeconds = Math.round((Date.now() - quizStartTime) / 1000)

    const result: DailyQuizResult = {
      day: selectedDay,
      date: todayStr,
      score,
      total,
      percentage,
      passed,
      timeSpentSeconds,
      completedAt: new Date().toISOString(),
      wrongAnswers,
    }

    setQuizResult(result)
    setQuizSubmitted(true)

    // Save to local progress
    setStoredData((prev) => {
      const prevDay = prev.completedDays[selectedDay] || { masteredWordIds: [] }
      const updatedDays = {
        ...prev.completedDays,
        [selectedDay]: {
          ...prevDay,
          completedAt: new Date().toISOString(),
          quizScore: score,
          quizTotal: total,
          percentage,
        },
      }
      const nextState = { ...prev, completedDays: updatedDays }
      saveStoredProgress(nextState)
      return nextState
    })

    // Sync to Supabase `english_study_logs`
    try {
      await supabase.from('english_study_logs').insert([
        {
          user_id: user?.id || '94f8ff1b-439c-43b1-b9f0-5a970754da31',
          study_date: todayStr,
          duration_minutes: Math.max(1, Math.round(timeSpentSeconds / 60)),
          words_reviewed: words.length,
          score: percentage,
          note: `Hoàn thành bài kiểm tra ${words.length} từ vựng Ngày ${selectedDay} (${score}/${total} điểm)`,
        },
      ])
      toast.success(
        passed
          ? `🎉 Xuất sắc! Bạn đạt ${score}/${total} câu (${percentage}%)!`
          : `Đã nộp bài kiểm tra: ${score}/${total} câu. Hãy ôn lại các từ chưa đạt nhé!`
      )
    } catch (e) {
      console.error('Failed to log study session to Supabase', e)
    }
  }, [quizQuestions, userAnswers, quizStartTime, selectedDay, todayStr, user?.id, words.length])

  // Reset/Restart quiz
  const restartQuiz = useCallback(() => {
    startQuiz()
  }, [startQuiz])

  // Cleanup timers on unmount
  useEffect(() => {
    return () => {
      if (autoPlayTimerRef.current) {
        clearTimeout(autoPlayTimerRef.current)
      }
    }
  }, [])

  return {
    selectedDay,
    setSelectedDay: handleSelectDay,
    dailyGoal,
    setDailyGoal: handleSetDailyGoal,
    currentPack,
    words,
    // Flashcard
    cardIndex,
    setCardIndex,
    isFlipped,
    flipCard,
    nextCard,
    prevCard,
    masteredWordIds,
    toggleMasterWord,
    // TTS & Auto-play
    speak,
    isAutoPlaying,
    startAutoPlay,
    stopAutoPlay,
    // Daily Quiz
    isQuizActive,
    setIsQuizActive,
    quizQuestions,
    currentQuizIndex,
    setCurrentQuizIndex,
    userAnswers,
    selectAnswer,
    submitQuiz,
    restartQuiz,
    quizSubmitted,
    quizResult,
    startQuiz,
    // Notebook Sync
    isWordSavedInNotebook,
    toggleSaveNotebook: toggleSaveNotebookMutation.mutate,
    isTogglingNotebook: toggleSaveNotebookMutation.isPending,
    // Overall Stats
    completedDays: storedData.completedDays,
    allPacks: DAILY_VOCAB_PACKS,
    todayIndex: getTodayDayIndex(),
  }
}
