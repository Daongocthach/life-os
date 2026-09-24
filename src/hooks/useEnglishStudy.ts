import { useState, useMemo, useEffect, useRef, useCallback } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from '@/stores/authStore'
import { toast } from 'sonner'
import type {
  EnglishLesson,
  EnglishLessonContent,
  EnglishQuestion,
  EnglishLearningSession,
  EnglishLessonWithProgress,
  EnglishWord,
} from '@/types'
import {
  type CreateLessonFormValues,
  type UpdateLessonFormValues,
  extractYoutubeId,
} from '@/schemas/englishSchema'
import { format } from 'date-fns'

export interface HighlightRange {
  start: number
  end: number
}

export interface ContextMenuState {
  x: number
  y: number
  word: string
  meaning: string
}

export function useEnglishStudy() {
  const queryClient = useQueryClient()
  const user = useAuthStore((state) => state.user)
  const todayStr = format(new Date(), 'yyyy-MM-dd')

  const [activeTab, setActiveTab] = useState<'study' | 'list' | 'vocabulary'>('study')
  const [selectedLessonId, setSelectedLessonId] = useState<string | null>(null)
  const [currentStep, setCurrentStep] = useState<number>(1) // 1 to 7
  const [isPlaying, setIsPlaying] = useState<boolean>(false)
  const [isPaused, setIsPaused] = useState<boolean>(false)
  const [highlightRange, setHighlightRange] = useState<HighlightRange | null>(null)
  const [focusedCharIndex, setFocusedCharIndex] = useState<number | null>(null)

  const [availableVoices, setAvailableVoices] = useState<SpeechSynthesisVoice[]>([])
  const [selectedVoiceURI, setSelectedVoiceURI] = useState<string | null>(null)
  const [speechRate, setSpeechRate] = useState<number>(0.92)

  const [contextMenu, setContextMenu] = useState<ContextMenuState | null>(null)

  const [isQuizMode, setIsQuizMode] = useState<boolean>(false)
  const [userAnswers, setUserAnswers] = useState<Record<number, string>>({})
  const [quizResult, setQuizResult] = useState<{
    score: number
    passed: boolean
    submitted: boolean
  } | null>(null)

  const synthRef = useRef<SpeechSynthesis | null>(null)
  const currentTextRef = useRef<string>('')
  const currentOffsetRef = useRef<number>(0)

  // Initialize SpeechSynthesis & Load Natural Voices
  useEffect(() => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return

    const synth = window.speechSynthesis
    synthRef.current = synth

    const loadVoices = () => {
      const voices = synth.getVoices()
      const enVoices = voices.filter((v) => v.lang.startsWith('en'))
      setAvailableVoices(enVoices)

      if (enVoices.length > 0 && !selectedVoiceURI) {
        const bestVoice =
          enVoices.find((v) =>
            v.name.toLowerCase().includes('enhanced') ||
            v.name.toLowerCase().includes('premium') ||
            v.name.toLowerCase().includes('natural')
          ) ||
          enVoices.find((v) =>
            v.name.includes('Google') ||
            v.name.includes('Samantha') ||
            v.name.includes('Ava') ||
            v.name.includes('Daniel')
          ) ||
          enVoices.find((v) => v.lang === 'en-US') ||
          enVoices[0]

        if (bestVoice) {
          setSelectedVoiceURI(bestVoice.voiceURI)
        }
      }
    }

    loadVoices()
    synth.onvoiceschanged = loadVoices

    return () => {
      synth.cancel()
    }
  }, [selectedVoiceURI])

  // 1. Fetch all lessons
  const { data: rawLessons = [], isLoading: isLoadingLessons } = useQuery<EnglishLesson[]>({
    queryKey: ['english_lessons'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('english_lessons')
        .select('*')
        .order('created_at', { ascending: false })
      if (error) throw error
      return (data || []) as EnglishLesson[]
    },
  })

  // 2. Fetch today's study sessions for all lessons
  const { data: allTodaySessions = [], isLoading: isLoadingSessions } = useQuery<EnglishLearningSession[]>({
    queryKey: ['english_all_sessions_today', todayStr],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('english_learning_sessions')
        .select('*')
        .eq('study_date', todayStr)
        .order('created_at', { ascending: false })
      if (error) throw error
      return (data || []) as EnglishLearningSession[]
    },
  })

  // 3. Fetch saved vocabulary words
  const { data: savedWords = [], isLoading: isLoadingWords } = useQuery<EnglishWord[]>({
    queryKey: ['english_words', user?.id],
    queryFn: async () => {
      let query = supabase.from('english_words').select('*').order('word', { ascending: true })
      if (user?.id) {
        query = query.eq('user_id', user.id)
      }
      const { data, error } = await query
      if (error) throw error
      return (data || []) as EnglishWord[]
    },
  })

  // Combine lessons with their progress
  const lessonsWithProgress: EnglishLessonWithProgress[] = useMemo(() => {
    return rawLessons.map((lesson) => {
      const session = allTodaySessions.find((s) => s.lesson_id === lesson.id)
      return {
        ...lesson,
        todaySession: session || null,
        currentStep: session ? Math.max(session.listen_count, 1) : 1,
        isCompletedToday: !!session?.completed,
        score: session?.listening_score ?? null,
      }
    })
  }, [rawLessons, allTodaySessions])

  // Current active lesson
  const currentLesson: EnglishLessonWithProgress | null = useMemo(() => {
    if (!lessonsWithProgress.length) return null
    if (selectedLessonId) {
      return lessonsWithProgress.find((l) => l.id === selectedLessonId) || lessonsWithProgress[0]
    }
    return lessonsWithProgress[0]
  }, [lessonsWithProgress, selectedLessonId])

  // Sync step from session when active lesson changes
  useEffect(() => {
    if (currentLesson) {
      if (currentLesson.todaySession) {
        setCurrentStep(Math.min(Math.max(currentLesson.todaySession.listen_count, 1), 7))
        if (currentLesson.todaySession.completed) {
          setQuizResult({
            score: currentLesson.todaySession.listening_score || 0,
            passed: true,
            submitted: true,
          })
        } else {
          setQuizResult(null)
        }
      } else {
        setCurrentStep(1)
        setQuizResult(null)
      }
      setIsQuizMode(false)
      setUserAnswers({})
      setFocusedCharIndex(null)
      setHighlightRange(null)
    }
  }, [currentLesson?.id])

  // Parse lesson content JSON
  const parsedContent: EnglishLessonContent | null = useMemo(() => {
    if (!currentLesson?.content) return null
    try {
      if (typeof currentLesson.content === 'string') {
        return JSON.parse(currentLesson.content) as EnglishLessonContent
      }
      return currentLesson.content as unknown as EnglishLessonContent
    } catch {
      return null
    }
  }, [currentLesson])

  // Extract 20 quiz questions
  const quizQuestions: EnglishQuestion[] = useMemo(() => {
    if (!parsedContent?.questions) return []
    const allQuestions = parsedContent.questions
    const fills = allQuestions.filter((q) => q.type === 'fill').slice(0, 10)
    const others = allQuestions.filter((q) => q.type !== 'fill').slice(0, 10)
    const combined = [...fills, ...others]
    if (combined.length < 20) {
      return allQuestions.slice(0, 20)
    }
    return combined.slice(0, 20)
  }, [parsedContent])

  // Play audio starting from specific character offset
  const playWithOffset = useCallback(
    (fullText: string, startIndex: number = 0) => {
      if (!synthRef.current) {
        toast.error('Trình duyệt không hỗ trợ Web Speech Audio')
        return
      }

      synthRef.current.cancel()
      currentTextRef.current = fullText
      currentOffsetRef.current = startIndex

      const textToSpeak = fullText.slice(startIndex)
      if (!textToSpeak.trim()) return

      const utterance = new SpeechSynthesisUtterance(textToSpeak)
      utterance.lang = 'en-US'
      utterance.rate = speechRate
      utterance.pitch = 1.0

      if (selectedVoiceURI) {
        const foundVoice = availableVoices.find((v) => v.voiceURI === selectedVoiceURI)
        if (foundVoice) {
          utterance.voice = foundVoice
        }
      }

      utterance.onstart = () => {
        setIsPlaying(true)
        setIsPaused(false)
      }

      utterance.onboundary = (event) => {
        if (event.name === 'word') {
          const relativeCharIndex = event.charIndex
          const actualCharIndex = startIndex + relativeCharIndex
          let charLength = event.charLength

          if (!charLength || charLength <= 1) {
            const remaining = fullText.slice(actualCharIndex)
            const match = remaining.match(/^[A-Za-z0-9'’]+/)
            charLength = match ? match[0].length : 1
          }

          setHighlightRange({
            start: actualCharIndex,
            end: actualCharIndex + charLength,
          })
          setFocusedCharIndex(actualCharIndex)
        }
      }

      utterance.onend = () => {
        setIsPlaying(false)
        setIsPaused(false)
        setHighlightRange(null)
      }

      utterance.onerror = () => {
        setIsPlaying(false)
        setIsPaused(false)
        setHighlightRange(null)
      }

      synthRef.current.speak(utterance)
    },
    [availableVoices, selectedVoiceURI, speechRate]
  )

  // Focus a word: highlight only without speaking yet
  const setFocusedWord = useCallback((startIndex: number, length: number) => {
    setFocusedCharIndex(startIndex)
    setHighlightRange({
      start: startIndex,
      end: startIndex + length,
    })
  }, [])

  // Start speaking or resume
  const playSpeech = useCallback(
    (text?: string) => {
      const target = text || parsedContent?.transcript || ''
      playWithOffset(target, 0)
    },
    [parsedContent, playWithOffset]
  )

  // Continue reading from current focused word
  const resumeOrPlayFromFocus = useCallback(() => {
    const fullText = parsedContent?.transcript || ''
    if (isPaused && synthRef.current) {
      if (synthRef.current.paused) {
        synthRef.current.resume()
        setIsPaused(false)
        return
      }
    }
    const startIdx = focusedCharIndex ?? 0
    playWithOffset(fullText, startIdx)
  }, [isPaused, focusedCharIndex, parsedContent, playWithOffset])

  const pauseSpeech = useCallback(() => {
    if (synthRef.current && isPlaying && !isPaused) {
      synthRef.current.pause()
      setIsPaused(true)
    }
  }, [isPlaying, isPaused])

  const stopSpeech = useCallback(() => {
    if (synthRef.current) {
      synthRef.current.cancel()
      setIsPlaying(false)
      setIsPaused(false)
      setHighlightRange(null)
    }
  }, [])

  const restartSpeech = useCallback(() => {
    stopSpeech()
    setFocusedCharIndex(0)
    playSpeech()
  }, [stopSpeech, playSpeech])

  // Vocabulary Mutations
  const toggleSaveWordMutation = useMutation({
    mutationFn: async ({ word, meaning }: { word: string; meaning: string }) => {
      const cleanWord = word.trim().toLowerCase()
      const existing = savedWords.find((w) => w.word.toLowerCase() === cleanWord)

      if (existing) {
        // Remove from vocabulary
        const { error } = await supabase.from('english_words').delete().eq('id', existing.id)
        if (error) throw error
        return { action: 'removed', word: cleanWord }
      } else {
        // Add to vocabulary
        const { data, error } = await supabase
          .from('english_words')
          .insert([
            {
              user_id: user?.id || '94f8ff1b-439c-43b1-b9f0-5a970754da31',
              word: cleanWord,
              meaning: meaning || 'Từ vựng lưu từ bài học',
              mastery: 1,
            },
          ])
          .select()
          .single()

        if (error) throw error
        return { action: 'added', word: cleanWord, data }
      }
    },
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ['english_words'] })
      if (res.action === 'added') {
        toast.success(`Đã thêm "${res.word}" vào sổ từ vựng ❤️`)
      } else {
        toast.info(`Đã bỏ lưu "${res.word}"`)
      }
    },
    onError: (err: Error) => {
      toast.error('Lỗi lưu từ vựng: ' + err.message)
    },
  })

  const deleteWordMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('english_words').delete().eq('id', id)
      if (error) throw error
      return id
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['english_words'] })
      toast.success('Đã xóa từ vựng')
    },
  })

  const isWordSaved = useCallback(
    (word: string) => {
      const clean = word.trim().toLowerCase()
      return savedWords.some((w) => w.word.toLowerCase() === clean)
    },
    [savedWords]
  )

  // Context Menu handlers
  const openContextMenu = (e: React.MouseEvent, word: string, meaning: string) => {
    e.preventDefault()
    e.stopPropagation()
    setContextMenu({
      x: e.clientX,
      y: e.clientY,
      word: word.trim(),
      meaning: meaning || 'Nghĩa từ bài học',
    })
  }

  const closeContextMenu = () => {
    setContextMenu(null)
  }

  // Save progress mutation
  const saveSessionProgressMutation = useMutation({
    mutationFn: async ({
      step,
      score,
      completed,
    }: {
      step: number
      score?: number | null
      completed?: boolean
    }) => {
      if (!currentLesson) return
      const existing = currentLesson.todaySession

      if (existing) {
        const { data, error } = await supabase
          .from('english_learning_sessions')
          .update({
            listen_count: step,
            ...(score !== undefined ? { listening_score: score } : {}),
            ...(completed !== undefined ? { completed } : {}),
          })
          .eq('id', existing.id)
          .select()
          .single()
        if (error) throw error
        return data
      } else {
        const { data, error } = await supabase
          .from('english_learning_sessions')
          .insert([
            {
              user_id: user?.id || '94f8ff1b-439c-43b1-b9f0-5a970754da31',
              lesson_id: currentLesson.id,
              study_date: todayStr,
              listen_count: step,
              listen_mode: '7-step',
              listening_score: score ?? null,
              completed: completed ?? false,
              duration_seconds: 600,
            },
          ])
          .select()
          .single()
        if (error) throw error
        return data
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['english_all_sessions_today'] })
    },
  })

  // Create new lesson mutation
  const createLessonMutation = useMutation({
    mutationFn: async (values: CreateLessonFormValues) => {
      const wordsList: [string, string][] = []
      const rawWords = values.transcript
        .replace(/[^a-zA-Z\s]/g, '')
        .split(/\s+/)
        .filter((w) => w.length > 3)
      const uniqueWords = Array.from(new Set(rawWords)).slice(0, 10)

      uniqueWords.forEach((w) => {
        wordsList.push([w, `từ khóa: ${w}`])
      })

      const generatedQuestions: EnglishQuestion[] = []
      for (let i = 0; i < 10; i++) {
        const targetWord = uniqueWords[i % uniqueWords.length] || 'word'
        generatedQuestions.push({
          type: 'fill',
          question: `Điền từ thích hợp vào chỗ trống trong câu số ${i + 1} (${targetWord}).`,
          sourceWord: targetWord,
          answer: targetWord,
        })
      }
      for (let i = 0; i < 10; i++) {
        const targetWord = uniqueWords[i % uniqueWords.length] || 'word'
        generatedQuestions.push({
          type: 'meaning',
          question: `Từ "${targetWord}" trong bài đọc mang ý nghĩa gì?`,
          answer: targetWord,
        })
      }

      const youtubeId = extractYoutubeId(values.youtube_url)

      const contentObj: EnglishLessonContent = {
        version: 2,
        youtube_id: youtubeId,
        transcript: values.transcript,
        translation: values.translation,
        words: wordsList,
        questions: generatedQuestions,
        speaking: {
          prompt: `Summarize the main idea of ${values.title} in 30 seconds.`,
          sample: values.transcript.slice(0, 100),
        },
      }

      const { data, error } = await supabase
        .from('english_lessons')
        .insert([
          {
            user_id: user?.id || '94f8ff1b-439c-43b1-b9f0-5a970754da31',
            title: values.title,
            level: values.level,
            topic: values.topic,
            lesson_type: 'listening',
            content_version: 2,
            content: JSON.stringify(contentObj),
          },
        ])
        .select()
        .single()

      if (error) throw error
      return data
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['english_lessons'] })
      toast.success('Đã tạo bài học mới thành công!')
      setSelectedLessonId(data.id)
      setActiveTab('study')
    },
    onError: (err: Error) => {
      toast.error('Lỗi khi tạo bài học: ' + err.message)
    },
  })

  // Update lesson mutation
  const updateLessonMutation = useMutation({
    mutationFn: async ({ id, values }: { id: string; values: UpdateLessonFormValues }) => {
      const existingLesson = rawLessons.find((l) => l.id === id)
      let existingContent: Partial<EnglishLessonContent> = {}
      if (existingLesson?.content) {
        try {
          existingContent = JSON.parse(existingLesson.content)
        } catch {
          existingContent = {}
        }
      }

      const youtubeId = extractYoutubeId(values.youtube_url)

      let wordsList = existingContent.words || []
      let questionsList = existingContent.questions || []

      // If transcript changed or questions were empty, generate new keywords & questions
      if (!wordsList.length || existingContent.transcript !== values.transcript) {
        const rawWords = values.transcript
          .replace(/[^a-zA-Z\s]/g, '')
          .split(/\s+/)
          .filter((w) => w.length > 3)
        const uniqueWords = Array.from(new Set(rawWords)).slice(0, 10)

        wordsList = uniqueWords.map((w) => [w, `từ khóa: ${w}`])

        if (!questionsList.length || existingContent.transcript !== values.transcript) {
          questionsList = []
          for (let i = 0; i < 10; i++) {
            const targetWord = uniqueWords[i % uniqueWords.length] || 'word'
            questionsList.push({
              type: 'fill',
              question: `Điền từ thích hợp vào chỗ trống trong câu số ${i + 1} (${targetWord}).`,
              sourceWord: targetWord,
              answer: targetWord,
            })
          }
          for (let i = 0; i < 10; i++) {
            const targetWord = uniqueWords[i % uniqueWords.length] || 'word'
            questionsList.push({
              type: 'meaning',
              question: `Từ "${targetWord}" trong bài đọc mang ý nghĩa gì?`,
              answer: targetWord,
            })
          }
        }
      }

      const updatedContent: EnglishLessonContent = {
        version: 2,
        youtube_id: youtubeId !== undefined ? (youtubeId || undefined) : existingContent.youtube_id,
        transcript: values.transcript,
        translation: values.translation,
        words: wordsList,
        questions: questionsList,
        speaking: existingContent.speaking || {
          prompt: `Summarize the main idea of ${values.title} in 30 seconds.`,
          sample: values.transcript.slice(0, 100),
        },
      }

      const { data, error } = await supabase
        .from('english_lessons')
        .update({
          title: values.title,
          level: values.level,
          topic: values.topic,
          content: JSON.stringify(updatedContent),
        })
        .eq('id', id)
        .select()
        .single()

      if (error) throw error
      return data
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['english_lessons'] })
      toast.success('Đã cập nhật bài học thành công!')
      setSelectedLessonId(data.id)
    },
    onError: (err: Error) => {
      toast.error('Lỗi khi cập nhật bài học: ' + err.message)
    },
  })

  // Delete lesson mutation
  const deleteLessonMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('english_lessons').delete().eq('id', id)
      if (error) throw error
      return id
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['english_lessons'] })
      toast.success('Đã xóa bài học')
    },
  })

  // Step advancement
  const advanceStep = () => {
    stopSpeech()
    if (currentStep < 7) {
      const nextStep = currentStep + 1
      setCurrentStep(nextStep)
      saveSessionProgressMutation.mutate({ step: nextStep })
      toast.info(`Chuyển sang lần nghe thứ ${nextStep} (Đã lưu tiến độ)`)
    } else {
      setIsQuizMode(true)
      toast.success('Bạn đã hoàn thành 7 lần nghe! Hãy bắt đầu bài kiểm tra 20 câu.')
    }
  }

  const setAnswer = (questionIndex: number, answer: string) => {
    setUserAnswers((prev) => ({ ...prev, [questionIndex]: answer }))
  }

  const submitQuiz = async () => {
    let score = 0
    quizQuestions.forEach((q, idx) => {
      const userAns = (userAnswers[idx] || '').trim().toLowerCase()
      const correctAns = (q.answer || '').trim().toLowerCase()
      if (userAns && correctAns && (userAns === correctAns || correctAns.includes(userAns))) {
        score += 1
      }
    })

    const passed = score >= 15
    setQuizResult({
      score,
      passed,
      submitted: true,
    })

    if (passed) {
      toast.success(`Chúc mừng! Bạn đạt ${score}/20 điểm - ĐÃ ĐẠT!`)
      await saveSessionProgressMutation.mutateAsync({
        step: 7,
        score,
        completed: true,
      })
    } else {
      toast.error(`Bạn đạt ${score}/20 điểm (yêu cầu >= 15). Bạn cần phải học lại!`)
      await saveSessionProgressMutation.mutateAsync({
        step: currentStep,
        score,
        completed: false,
      })
    }
  }

  const restartStudy = () => {
    stopSpeech()
    setCurrentStep(1)
    setIsQuizMode(false)
    setUserAnswers({})
    setQuizResult(null)
    saveSessionProgressMutation.mutate({ step: 1, completed: false })
  }

  const selectLesson = (id: string) => {
    stopSpeech()
    setSelectedLessonId(id)
    setActiveTab('study')
  }

  return {
    lessons: lessonsWithProgress,
    currentLesson,
    parsedContent,
    quizQuestions,
    selectedLessonId,
    activeTab,
    setActiveTab,
    selectLesson,
    currentStep,
    isPlaying,
    isPaused,
    highlightRange,
    focusedCharIndex,
    setFocusedWord,
    availableVoices,
    selectedVoiceURI,
    setSelectedVoiceURI,
    speechRate,
    setSpeechRate,
    isQuizMode,
    userAnswers,
    quizResult,
    todaySession: currentLesson?.todaySession,
    isTodayCompleted: !!currentLesson?.isCompletedToday,
    isLoading: isLoadingLessons || isLoadingSessions || isLoadingWords,
    playSpeech,
    resumeOrPlayFromFocus,
    pauseSpeech,
    stopSpeech,
    restartSpeech,
    advanceStep,
    setAnswer,
    submitQuiz,
    restartStudy,
    setIsQuizMode,
    createLesson: createLessonMutation.mutateAsync,
    isCreatingLesson: createLessonMutation.isPending,
    updateLesson: (id: string, values: UpdateLessonFormValues) =>
      updateLessonMutation.mutateAsync({ id, values }),
    isUpdatingLesson: updateLessonMutation.isPending,
    deleteLesson: deleteLessonMutation.mutateAsync,
    // Vocabulary methods
    savedWords,
    toggleSaveWord: (word: string, meaning: string) =>
      toggleSaveWordMutation.mutateAsync({ word, meaning }),
    deleteWord: (id: string) => deleteWordMutation.mutateAsync(id),
    isWordSaved,
    contextMenu,
    openContextMenu,
    closeContextMenu,
  }
}
