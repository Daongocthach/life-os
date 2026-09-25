import React, { useMemo, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import {
  Volume2,
  Play,
  Pause,
  Square,
  RotateCcw,
  Sparkles,
  Award,
  Headphones,
  BookOpen,
  Mic,
  Sliders,
  CheckCircle2,
  AlertTriangle,
  Pointer,
  List,
  Plus,
  Trash2,
  Pencil,
  Layers,
  GraduationCap,
  Heart,
  Search,
  ExternalLink,
  Languages,
} from 'lucide-react'

function YoutubeIcon({ className = 'h-4 w-4' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
    </svg>
  )
}
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { useEnglishStudy } from '@/hooks/useEnglishStudy'
import { useI18n } from '@/hooks/useI18n'
import { useConfirm } from '@/hooks/useConfirm'
import {
  createLessonSchema,
  type CreateLessonFormValues,
  updateLessonSchema,
  type UpdateLessonFormValues,
} from '@/schemas/englishSchema'
import type { EnglishLessonContent } from '@/types'

interface TextToken {
  text: string
  isWord: boolean
  startIndex: number
  endIndex: number
}

interface LineData {
  lineIndex: number
  rawText: string
  translationText?: string
  isEmpty: boolean
  tokens: TextToken[]
}

export function EnglishView() {
  const { t } = useI18n()
  const confirm = useConfirm()
  const {
    lessons,
    currentLesson,
    parsedContent,
    quizQuestions,
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
    isTodayCompleted,
    todaySession,
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
    createLesson,
    isCreatingLesson,
    updateLesson,
    isUpdatingLesson,
    deleteLesson,
    savedWords,
    toggleSaveWord,
    deleteWord,
    isWordSaved,
    contextMenu,
    openContextMenu,
    closeContextMenu,
  } = useEnglishStudy()

  const [isAddLessonOpen, setIsAddLessonOpen] = useState(false)
  const [isEditLessonOpen, setIsEditLessonOpen] = useState(false)
  const [editingLessonId, setEditingLessonId] = useState<string | null>(null)
  const [vocabSearch, setVocabSearch] = useState('')
  // Active Translation Toggle state (Chế độ dịch chủ động: Bật/Tắt)
  const [showTranslation, setShowTranslation] = useState<boolean>(true)

  // React Hook Form for Creating New Lesson
  const {
    register: registerLesson,
    handleSubmit: handleSubmitLesson,
    reset: resetLesson,
    formState: { errors: errorsLesson },
  } = useForm<CreateLessonFormValues>({
    resolver: zodResolver(createLessonSchema),
    defaultValues: {
      title: '',
      level: 'TOEIC 550–650',
      topic: 'Music Lyrics',
      youtube_url: '',
      transcript: '',
      translation: '',
    },
  })

  // React Hook Form for Updating Existing Lesson
  const {
    register: registerEditLesson,
    handleSubmit: handleSubmitEditLesson,
    reset: resetEditLesson,
    formState: { errors: errorsEditLesson },
  } = useForm<UpdateLessonFormValues>({
    resolver: zodResolver(updateLessonSchema),
  })

  const onCreateLessonSubmit = async (values: CreateLessonFormValues) => {
    await createLesson(values)
    resetLesson()
    setIsAddLessonOpen(false)
  }

  const openEditLessonModal = (lessonId: string) => {
    const lesson = lessons.find((l) => l.id === lessonId)
    if (!lesson) return
    let parsed: Partial<EnglishLessonContent> = {}
    try {
      parsed = JSON.parse(lesson.content)
    } catch {
      parsed = {}
    }
    setEditingLessonId(lesson.id)
    resetEditLesson({
      title: lesson.title,
      level: lesson.level || 'B1',
      topic: lesson.topic || 'General',
      youtube_url: parsed.youtube_id ? `https://www.youtube.com/watch?v=${parsed.youtube_id}` : '',
      transcript: parsed.transcript || '',
      translation: parsed.translation || '',
    })
    setIsEditLessonOpen(true)
  }

  const onUpdateLessonSubmit = async (values: UpdateLessonFormValues) => {
    if (!editingLessonId) return
    await updateLesson(editingLessonId, values)
    setIsEditLessonOpen(false)
    setEditingLessonId(null)
  }

  const handleDeleteLesson = async (id: string, title: string) => {
    const ok = await confirm({
      title: 'Xóa bài học tiếng Anh?',
      description: `Bài học "${title}" cùng toàn bộ lịch sử học và câu hỏi sẽ bị xóa vĩnh viễn.`,
      variant: 'destructive',
      confirmText: t.common.delete,
      cancelText: t.common.cancel,
    })
    if (ok) {
      await deleteLesson(id)
    }
  }

  // Split transcript into structured lines preserving verse breaks & stanzas
  const lines = useMemo<LineData[]>(() => {
    if (!parsedContent?.transcript) return []
    const rawLines = parsedContent.transcript.split('\n')
    const rawTranslations = parsedContent?.translation ? parsedContent.translation.split('\n') : []

    const isSameLength = rawLines.length === rawTranslations.length
    const nonEmptyTranslations = rawTranslations.filter((t) => t.trim().length > 0)
    let transNonEmptyIdx = 0

    let runningIndex = 0

    return rawLines.map((rawLine, lIdx) => {
      const lineStartIndex = runningIndex
      // Increase runningIndex for this line + 1 for '\n'
      runningIndex += rawLine.length + 1

      const lineTokens: TextToken[] = []
      const regex = /([A-Za-z0-9'’]+|[^A-Za-z0-9'’]+)/g
      let match: RegExpExecArray | null

      while ((match = regex.exec(rawLine)) !== null) {
        const text = match[0]
        const startInLine = match.index
        const isWord = /^[A-Za-z0-9'’]+$/.test(text)
        lineTokens.push({
          text,
          isWord,
          startIndex: lineStartIndex + startInLine,
          endIndex: lineStartIndex + startInLine + text.length,
        })
      }

      let lineTranslation = ''
      if (rawLine.trim().length > 0) {
        if (isSameLength) {
          lineTranslation = rawTranslations[lIdx] || ''
        } else {
          lineTranslation = nonEmptyTranslations[transNonEmptyIdx++] || ''
        }
      }

      return {
        lineIndex: lIdx,
        rawText: rawLine,
        translationText: lineTranslation,
        isEmpty: rawLine.trim().length === 0,
        tokens: lineTokens,
      }
    })
  }, [parsedContent?.transcript, parsedContent?.translation])

  // Filter saved vocabulary words
  const filteredWords = useMemo(() => {
    if (!vocabSearch.trim()) return savedWords
    const q = vocabSearch.toLowerCase().trim()
    return savedWords.filter(
      (w) =>
        w.word.toLowerCase().includes(q) ||
        (w.meaning && w.meaning.toLowerCase().includes(q))
    )
  }, [savedWords, vocabSearch])

  const stepProgress = Math.round((currentStep / 7) * 100)

  // Step Mode Description
  const getStepModeDescription = () => {
    if (currentStep <= 2) {
      return {
        label: t.english.stepMode1,
        variant: 'info' as const,
        showSub: true,
        showTrans: true,
      }
    }
    if (currentStep <= 5) {
      return {
        label: t.english.stepMode2,
        variant: 'warning' as const,
        showSub: true,
        showTrans: false,
      }
    }
    return {
      label: t.english.stepMode3,
      variant: 'destructive' as const,
      showSub: false,
      showTrans: false,
    }
  }

  const mode = getStepModeDescription()

  // Right-click context menu handler on any word
  const handleWordContextMenu = (e: React.MouseEvent, token: TextToken) => {
    e.preventDefault()
    e.stopPropagation()
    const cleanWord = token.text.toLowerCase().replace(/^[^\w]+|[^\w]+$/g, '')
    const found = parsedContent?.words?.find(
      ([w]) => w.toLowerCase() === cleanWord || cleanWord.includes(w.toLowerCase())
    )
    const meaning = found ? found[1] : 'Từ vựng trong bài hát'
    openContextMenu(e, token.text, meaning)
  }

  return (
    <div className="space-y-6 pb-24 relative">
      {/* Top Header Row with Navigation Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight">
              {t.english.title}
            </h1>
            {isTodayCompleted && (
              <Badge variant="success" className="text-xs">
                Đã đạt hôm nay ({todaySession?.listening_score}/20đ)
              </Badge>
            )}
          </div>
          <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
            {currentLesson?.title} • {currentLesson?.level} • {currentLesson?.topic}
          </p>
        </div>

        {/* View Switcher: Luyện nghe vs Danh sách bài vs Sổ từ vựng */}
        <div className="flex items-center space-x-2 flex-wrap gap-y-2">
          <div className="inline-flex rounded-xl bg-muted p-1 border border-border/60">
            <button
              onClick={() => setActiveTab('study')}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                activeTab === 'study'
                  ? 'bg-background text-foreground shadow-xs'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <Headphones className="h-3.5 w-3.5 inline mr-1" />
              Luyện nghe
            </button>
            <button
              onClick={() => setActiveTab('list')}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                activeTab === 'list'
                  ? 'bg-background text-foreground shadow-xs'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <List className="h-3.5 w-3.5 inline mr-1" />
              Danh sách ({lessons.length})
            </button>
            <button
              onClick={() => setActiveTab('vocabulary')}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                activeTab === 'vocabulary'
                  ? 'bg-background text-foreground shadow-xs'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <Heart className="h-3.5 w-3.5 inline mr-1 text-rose-500 fill-rose-500" />
              Sổ từ vựng ({savedWords.length})
            </button>
          </div>

          {currentLesson && activeTab === 'study' && (
            <Button
              size="sm"
              variant="outline"
              onClick={() => openEditLessonModal(currentLesson.id)}
              className="text-xs h-8"
              title="Chỉnh sửa bài học & video đang học"
            >
              <Pencil className="h-3.5 w-3.5 mr-1" />
              Sửa bài
            </Button>
          )}

          <Button
            size="sm"
            onClick={() => setIsAddLessonOpen(true)}
            className="text-xs h-8"
          >
            <Plus className="h-3.5 w-3.5 mr-1" />
            Tạo bài mới
          </Button>
        </div>
      </div>

      {/* ================= TAB 1: DANH SÁCH BÀI HỌC (CATALOG VIEW) ================= */}
      {activeTab === 'list' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold flex items-center gap-2">
              <Layers className="h-4 w-4 text-primary" />
              Tất cả các bài học tiếng Anh ({lessons.length} bài)
            </h2>
            <span className="text-xs text-muted-foreground">
              Tiến độ được lưu riêng cho từng bài mỗi ngày
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {lessons.map((lesson) => {
              const isSelected = lesson.id === currentLesson?.id
              return (
                <Card
                  key={lesson.id}
                  className={`border transition-all hover:shadow-md ${
                    isSelected
                      ? 'border-primary/60 bg-primary/5 ring-1 ring-primary/30'
                      : 'border-border/80'
                  }`}
                >
                  <CardHeader className="p-4 pb-2 flex flex-row items-start justify-between">
                    <div>
                      <div className="flex items-center space-x-2">
                        <CardTitle className="text-sm font-bold text-foreground">
                          {lesson.title}
                        </CardTitle>
                        {isSelected && (
                          <Badge variant="default" className="text-[9px] h-4 px-1.5">
                            Đang chọn
                          </Badge>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {lesson.topic || 'General'} • Trình độ: {lesson.level || 'Intermediate'}
                      </p>
                    </div>

                    <div className="flex items-center space-x-0.5 shrink-0">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={(e) => {
                          e.stopPropagation()
                          openEditLessonModal(lesson.id)
                        }}
                        className="h-7 w-7 text-muted-foreground hover:text-primary shrink-0"
                        title="Chỉnh sửa bài học này"
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={(e) => {
                          e.stopPropagation()
                          handleDeleteLesson(lesson.id, lesson.title)
                        }}
                        className="h-7 w-7 text-muted-foreground hover:text-destructive shrink-0"
                        title="Xóa bài học này"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </CardHeader>

                  <CardContent className="p-4 pt-1 space-y-3">
                    {/* Status & Progress Badges */}
                    <div className="flex items-center justify-between text-xs pt-1 border-t border-border/40">
                      <div className="flex items-center space-x-2">
                        <span className="text-muted-foreground">Tiến độ hôm nay:</span>
                        <Badge variant="outline" className="text-[11px] font-semibold">
                          Lần nghe {lesson.currentStep} / 7
                        </Badge>
                      </div>

                      {lesson.isCompletedToday ? (
                        <Badge variant="success" className="text-[11px] font-semibold">
                          <CheckCircle2 className="h-3 w-3 mr-1" />
                          Đã hoàn thành ({lesson.score}/20đ)
                        </Badge>
                      ) : (
                        <Badge variant="warning" className="text-[11px]">
                          Chưa hoàn thành
                        </Badge>
                      )}
                    </div>

                    {/* Action button */}
                    <Button
                      size="sm"
                      variant={isSelected ? 'default' : 'outline'}
                      onClick={() => selectLesson(lesson.id)}
                      className="w-full text-xs h-8 font-semibold mt-1"
                    >
                      {lesson.isCompletedToday
                        ? 'Ôn luyện lại bài này'
                        : lesson.currentStep > 1
                        ? `Tiếp tục học (Lần ${lesson.currentStep}/7)`
                        : 'Bắt đầu học bài này'}
                    </Button>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </div>
      )}

      {/* ================= TAB 2: PHÒNG LUYỆN NGHE & KIỂM TRA ================= */}
      {activeTab === 'study' && !isQuizMode && (
        <div className="space-y-4">
          {/* Step Progress Bar */}
          <Card className="p-4 border-border/80 bg-card/60">
            <div className="flex items-center justify-between text-xs mb-2">
              <span className="font-semibold flex items-center gap-1.5">
                <Headphones className="h-4 w-4 text-primary" />
                {t.english.listenStep} {currentStep} / 7 (Tự động lưu tiến độ)
              </span>
              <Badge variant={mode.variant} className="text-[11px]">
                {mode.label}
              </Badge>
            </div>
            <Progress value={stepProgress} className="h-2.5" />
          </Card>

          {/* Voice Tuning & Speed Controls */}
          <Card className="p-3 bg-muted/20 border-border/60">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
              {/* Voice selector */}
              <div className="flex items-center space-x-2 flex-1">
                <Mic className="h-3.5 w-3.5 text-primary shrink-0" />
                <span className="font-medium text-muted-foreground shrink-0">Giọng đọc:</span>
                <select
                  value={selectedVoiceURI || ''}
                  onChange={(e) => setSelectedVoiceURI(e.target.value)}
                  className="w-full max-w-xs h-8 rounded-lg border border-input bg-background/90 px-2 text-xs font-medium focus-visible:outline-none"
                >
                  {availableVoices.map((v) => (
                    <option key={v.voiceURI} value={v.voiceURI}>
                      {v.name} ({v.lang})
                    </option>
                  ))}
                </select>
              </div>

              {/* Speed selector */}
              <div className="flex items-center space-x-2 shrink-0">
                <Sliders className="h-3.5 w-3.5 text-primary shrink-0" />
                <span className="font-medium text-muted-foreground">Tốc độ:</span>
                <div className="flex space-x-1">
                  {[
                    { label: '0.8x', val: 0.8 },
                    { label: '0.9x', val: 0.92 },
                    { label: '1.0x', val: 1.0 },
                  ].map((speed) => (
                    <button
                      key={speed.label}
                      type="button"
                      onClick={() => setSpeechRate(speed.val)}
                      className={`px-2 py-1 rounded text-[11px] font-semibold transition-colors ${
                        Math.abs(speechRate - speed.val) < 0.05
                          ? 'bg-primary text-primary-foreground shadow-xs'
                          : 'bg-muted hover:bg-muted/80 text-muted-foreground'
                      }`}
                    >
                      {speed.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </Card>

          {/* YouTube Lyric Video (Official Audio & Lyrics) Placed Directly Above Lyrics Box */}
          {parsedContent?.youtube_id ? (
            <Card className="border-border/80 overflow-hidden shadow-sm">
              <div className="flex items-center justify-between px-4 py-2 bg-muted/50 border-b border-border/60 text-xs">
                <span className="font-semibold flex items-center gap-1.5 text-foreground">
                  <YoutubeIcon className="h-4 w-4 text-red-600 fill-current" />
                  Video YouTube Lyrics (Chính thức)
                </span>
                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => currentLesson && openEditLessonModal(currentLesson.id)}
                    className="h-6 px-2 text-[11px] text-muted-foreground hover:text-foreground"
                    title="Chỉnh sửa bài học & link video"
                  >
                    <Pencil className="h-3 w-3 mr-1" />
                    Sửa video / bài
                  </Button>
                  <a
                    href={`https://www.youtube.com/watch?v=${parsedContent.youtube_id}`}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-1 text-muted-foreground hover:text-primary transition-colors text-[11px]"
                  >
                    Mở trên YouTube
                    <ExternalLink className="h-3 w-3" />
                  </a>
                </div>
              </div>
              <div className="relative w-full aspect-video max-h-[380px] bg-black">
                <iframe
                  className="w-full h-full"
                  src={`https://www.youtube-nocookie.com/embed/${parsedContent.youtube_id}?rel=0`}
                  title={currentLesson?.title || 'YouTube Lyric Video'}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                />
              </div>
            </Card>
          ) : (
            <div className="flex items-center justify-between px-3.5 py-2.5 rounded-lg bg-muted/30 border border-dashed border-border/70 text-xs">
              <span className="text-muted-foreground flex items-center gap-1.5 text-[11px]">
                <YoutubeIcon className="h-3.5 w-3.5 text-muted-foreground/60" />
                Chưa có video YouTube cho bài này.
              </span>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => currentLesson && openEditLessonModal(currentLesson.id)}
                className="h-6 px-2 text-[11px] text-primary hover:bg-primary/10"
              >
                <Plus className="h-3 w-3 mr-1" />
                Gắn link YouTube
              </Button>
            </div>
          )}

          {/* Interactive Player Card with Full Controls & Word Focus Playback */}
          <Card className="border-border/80 overflow-hidden">
            <CardHeader className="bg-muted/40 border-b border-border/50 py-3 px-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <BookOpen className="h-4 w-4 text-primary" />
                Nội dung bài nghe
              </CardTitle>

              {/* Control Buttons Bar: Play/Resume, Pause, Stop, Restart */}
              <div className="flex items-center space-x-2">
                {!isPlaying || isPaused ? (
                  <Button
                    size="sm"
                    onClick={resumeOrPlayFromFocus}
                    className="text-xs h-8 bg-primary text-primary-foreground shadow-xs"
                    title={
                      isPaused
                        ? 'Tiếp tục đọc'
                        : focusedCharIndex !== null
                        ? 'Đọc tiếp từ từ đang chọn'
                        : 'Phát âm bài nghe'
                    }
                  >
                    <Play className="h-3.5 w-3.5 mr-1.5 fill-current" />
                    {isPaused
                      ? 'Tiếp tục'
                      : focusedCharIndex !== null
                      ? 'Đọc từ vị trí chọn'
                      : 'Phát âm'}
                  </Button>
                ) : (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={pauseSpeech}
                    className="text-xs h-8 text-amber-600 border-amber-500/40 hover:bg-amber-500/10"
                    title="Tạm dừng"
                  >
                    <Pause className="h-3.5 w-3.5 mr-1.5 fill-current" />
                    Tạm dừng
                  </Button>
                )}

                <Button
                  size="sm"
                  variant="outline"
                  onClick={stopSpeech}
                  disabled={!isPlaying && !isPaused}
                  className="text-xs h-8 text-rose-600 border-rose-500/30 hover:bg-rose-500/10"
                  title="Dừng hẳn"
                >
                  <Square className="h-3 w-3 mr-1.5 fill-current" />
                  Dừng
                </Button>

                <Button
                  size="sm"
                  variant="ghost"
                  onClick={restartSpeech}
                  className="text-xs h-8 text-muted-foreground hover:text-foreground"
                  title="Bắt đầu lại từ đầu bài"
                >
                  <RotateCcw className="h-3.5 w-3.5 mr-1" />
                  Đọc lại
                </Button>
              </div>
            </CardHeader>

            <CardContent className="p-6 space-y-6">
              {/* Conditional Display based on currentStep */}
              {mode.showSub ? (
                <div className="space-y-4">
                  {/* Interactive Word-Clickable Karaoke Box with Preserved Line Breaks */}
                  <div className="p-5 rounded-xl bg-background border border-border/70 shadow-xs relative">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3 pb-2 border-b border-border/40">
                      <span className="text-[11px] font-medium text-muted-foreground flex items-center gap-1.5">
                        <Pointer className="h-3.5 w-3.5 text-primary" />
                        <span>
                          <strong className="text-foreground">Nhấp chuột trái:</strong> Focus từ (chưa đọc) •{' '}
                          <strong className="text-foreground">Nhấp chuột phải:</strong> Xem nghĩa & lưu từ vựng ❤️
                        </span>
                      </span>

                      <div className="flex items-center space-x-2">
                        {isPlaying && !isPaused && (
                          <span className="flex items-center text-[11px] text-primary font-semibold animate-pulse mr-1">
                            <Volume2 className="h-3.5 w-3.5 mr-1" />
                            Đang đọc...
                          </span>
                        )}
                        {isPaused && (
                          <span className="flex items-center text-[11px] text-amber-500 font-semibold mr-1">
                            <Pause className="h-3.5 w-3.5 mr-1" />
                            Đang tạm dừng
                          </span>
                        )}

                        {/* Nút tắt/bật chế độ dịch chủ động */}
                        <Button
                          size="sm"
                          variant={showTranslation ? 'secondary' : 'outline'}
                          onClick={() => setShowTranslation((prev) => !prev)}
                          className={`h-7 px-2.5 text-xs rounded-lg transition-all ${
                            showTranslation
                              ? 'bg-primary/10 text-primary border-primary/30 font-semibold hover:bg-primary/20'
                              : 'text-muted-foreground hover:text-foreground'
                          }`}
                          title="Bật hoặc tắt hiển thị bản dịch tiếng Việt dưới từng dòng"
                        >
                          <Languages className="h-3.5 w-3.5 mr-1.5" />
                          {showTranslation ? 'Dịch: Đang Bật' : 'Dịch: Đang Tắt'}
                        </Button>
                      </div>
                    </div>

                    {/* Scrollable Container with Fixed Max-Height */}
                    <div className="max-h-[420px] overflow-y-auto pr-2 space-y-1.5 scrollbar-thin select-text">
                      {lines.map((line) => {
                        if (line.isEmpty) {
                          return <div key={line.lineIndex} className="h-3" />
                        }

                        return (
                          <div
                            key={line.lineIndex}
                            className="py-1 px-2 -mx-2 rounded-lg transition-colors hover:bg-muted/20"
                          >
                            {/* Dòng tiếng Anh */}
                            <div className="min-h-[1.75rem] leading-relaxed text-base sm:text-lg">
                              {line.tokens.map((token, tIdx) => {
                                if (!token.isWord) {
                                  return (
                                    <span key={tIdx} className="text-foreground">
                                      {token.text}
                                    </span>
                                  )
                                }

                                const isCurrentPlaying =
                                  highlightRange !== null &&
                                  token.startIndex >= highlightRange.start &&
                                  token.startIndex < highlightRange.end

                                const isFocused =
                                  focusedCharIndex !== null &&
                                  token.startIndex <= focusedCharIndex &&
                                  focusedCharIndex < token.endIndex

                                const isSaved = isWordSaved(token.text)

                                return (
                                  <span
                                    key={tIdx}
                                    tabIndex={0}
                                    role="button"
                                    onClick={() => setFocusedWord(token.startIndex, token.text.length)}
                                    onContextMenu={(e) => handleWordContextMenu(e, token)}
                                    onKeyDown={(e) => {
                                      if (e.key === 'Enter' || e.key === ' ') {
                                        e.preventDefault()
                                        setFocusedWord(token.startIndex, token.text.length)
                                      }
                                    }}
                                    title={`Nhấp trái để chọn từ "${token.text}" • Chuột phải để xem nghĩa & lưu từ ❤️`}
                                    className={`inline-block transition-all duration-100 rounded px-1 cursor-pointer select-none focus:outline-none ${
                                      isCurrentPlaying
                                        ? 'bg-primary text-primary-foreground font-bold shadow-md scale-105 ring-2 ring-primary/40 animate-pulse z-10'
                                        : isFocused
                                        ? 'bg-amber-500/25 text-amber-800 dark:text-amber-200 font-bold ring-2 ring-amber-500/50 shadow-xs z-10'
                                        : 'hover:bg-primary/20 hover:text-primary active:scale-95 text-foreground'
                                    } ${
                                      isSaved
                                        ? 'underline decoration-rose-500/80 decoration-wavy underline-offset-4'
                                        : ''
                                    }`}
                                  >
                                    {token.text}
                                  </span>
                                )
                              })}
                            </div>

                            {/* Dịch nằm ngay dưới dòng của câu tiếng Anh, chữ nghiêng và font bé hơn */}
                            {showTranslation && line.translationText && (
                              <p className="mt-0.5 text-xs sm:text-sm italic font-normal text-muted-foreground/85 dark:text-muted-foreground/75 leading-normal pl-0.5 select-text">
                                {line.translationText}
                              </p>
                            )}
                          </div>
                        )
                      })}
                    </div>
                  </div>

                  {/* Toàn bộ bản dịch tiếng Việt (có thể thu gọn/mở rộng) */}
                  {parsedContent?.translation && (
                    <details className="group rounded-xl bg-muted/30 border border-border/40 p-3 text-xs text-muted-foreground">
                      <summary className="font-semibold cursor-pointer hover:text-foreground list-none flex items-center justify-between select-none">
                        <span className="flex items-center gap-1.5">
                          <Languages className="h-3.5 w-3.5 text-primary" />
                          Xem toàn văn bản dịch tiếng Việt
                        </span>
                        <span className="text-[10px] text-muted-foreground group-open:rotate-180 transition-transform">
                          ▼
                        </span>
                      </summary>
                      <div className="mt-2.5 pt-2.5 border-t border-border/40 max-h-48 overflow-y-auto pr-2 scrollbar-thin text-xs sm:text-sm leading-relaxed text-muted-foreground whitespace-pre-line">
                        {parsedContent.translation}
                      </div>
                    </details>
                  )}

                  {/* Key vocabulary words */}
                  {parsedContent?.words && parsedContent.words.length > 0 && (
                    <div className="space-y-2">
                      <span className="text-xs font-semibold text-muted-foreground">
                        Từ vựng trọng tâm trong bài:
                      </span>
                      <div className="flex flex-wrap gap-2">
                        {parsedContent?.words.map(([word, meaning], i) => (
                          <div
                            key={i}
                            onClick={() => playSpeech(word)}
                            onContextMenu={(e) => {
                              e.preventDefault()
                              openContextMenu(e, word, meaning)
                            }}
                            className="px-3 py-1.5 rounded-lg border border-border/60 bg-muted/20 hover:bg-primary/10 cursor-pointer text-xs transition-colors flex items-center space-x-1.5 active:scale-95"
                            title="Bấm để phát âm • Chuột phải để lưu vào sổ từ vựng"
                          >
                            <Volume2 className="h-3 w-3 text-primary" />
                            <span className="font-semibold text-foreground">{word}:</span>
                            <span className="text-muted-foreground">{meaning}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                /* Steps 6-7: Pure Audio Only */
                <div className="py-12 px-4 text-center space-y-4 rounded-2xl bg-muted/20 border border-dashed border-border">
                  <div className="flex justify-center">
                    <div className="relative">
                      <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center animate-pulse">
                        <Headphones className="h-8 w-8 text-primary" />
                      </div>
                    </div>
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-foreground">
                      Chế độ Nghe Thuần Túy (Lần {currentStep}/7)
                    </h3>
                    <p className="text-xs text-muted-foreground max-w-sm mx-auto mt-1">
                      Toàn bộ phụ đề và bản dịch đã được ẩn. Hãy tập trung tối đa thính giác vào ngữ điệu và phát âm!
                    </p>
                  </div>
                  <div className="flex items-center justify-center space-x-3">
                    <Button
                      onClick={() =>
                        isPlaying && !isPaused
                          ? pauseSpeech()
                          : isPaused
                          ? resumeOrPlayFromFocus()
                          : playSpeech()
                      }
                      size="lg"
                      className="text-sm rounded-xl px-6"
                    >
                      {isPlaying && !isPaused ? (
                        <>
                          <Pause className="h-4 w-4 mr-2" />
                          Tạm dừng
                        </>
                      ) : isPaused ? (
                        <>
                          <Play className="h-4 w-4 mr-2" />
                          Tiếp tục nghe
                        </>
                      ) : (
                        <>
                          <Play className="h-4 w-4 mr-2" />
                          Bắt đầu nghe
                        </>
                      )}
                    </Button>
                    <Button
                      variant="outline"
                      size="lg"
                      onClick={stopSpeech}
                      disabled={!isPlaying && !isPaused}
                      className="text-sm rounded-xl px-4"
                    >
                      <Square className="h-4 w-4 mr-1.5" />
                      Dừng
                    </Button>
                  </div>
                </div>
              )}

              {/* Bottom Action: Advance Step or Start Quiz */}
              <div className="flex justify-end pt-2 border-t border-border/50">
                <Button
                  onClick={advanceStep}
                  size="default"
                  className="text-xs sm:text-sm font-semibold shadow-md"
                >
                  {currentStep < 7 ? (
                    <>
                      Hoàn thành lần {currentStep} $\rightarrow$ Qua lần {currentStep + 1}
                    </>
                  ) : (
                    <>
                      <Award className="h-4 w-4 mr-1.5" />
                      {t.english.startQuiz}
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* ================= TAB 3: QUIZ 20 CÂU ================= */}
      {isQuizMode && (
        <div className="space-y-4">
          <Card className="p-5 border-border/80 bg-card/70">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h2 className="text-lg font-bold flex items-center gap-2">
                  <Award className="h-5 w-5 text-primary" />
                  {t.english.quizTitle} (20 Câu)
                </h2>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {t.english.quizSubtitle}
                </p>
              </div>

              {quizResult && (
                <div
                  className={`px-4 py-2 rounded-xl border text-center font-bold text-sm ${
                    quizResult.passed
                      ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-600 dark:text-emerald-400'
                      : 'bg-rose-500/15 border-rose-500/30 text-rose-600 dark:text-rose-400'
                  }`}
                >
                  Điểm: {quizResult.score} / 20 ({quizResult.passed ? 'ĐẠT' : 'CHƯA ĐẠT'})
                </div>
              )}
            </div>

            {/* Quiz Result Callout */}
            {quizResult && (
              <div
                className={`mt-4 p-4 rounded-xl border flex items-start space-x-3 ${
                  quizResult.passed
                    ? 'bg-emerald-500/10 border-emerald-500/20'
                    : 'bg-rose-500/10 border-rose-500/20'
                }`}
              >
                {quizResult.passed ? (
                  <CheckCircle2 className="h-5 w-5 text-emerald-500 shrink-0 mt-0.5" />
                ) : (
                  <AlertTriangle className="h-5 w-5 text-rose-500 shrink-0 mt-0.5" />
                )}
                <div className="space-y-2">
                  <p className="text-xs sm:text-sm font-semibold">
                    {quizResult.passed ? t.english.passed : t.english.failed}
                  </p>
                  {!quizResult.passed && (
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={restartStudy}
                      className="text-xs h-8"
                    >
                      <RotateCcw className="h-3.5 w-3.5 mr-1" />
                      {t.english.retake}
                    </Button>
                  )}
                </div>
              </div>
            )}
          </Card>

          {/* Question List */}
          <div className="space-y-3">
            {quizQuestions.map((q, idx) => {
              const userAns = userAnswers[idx] || ''
              const isCorrect =
                quizResult?.submitted &&
                userAns.trim().toLowerCase() === q.answer.trim().toLowerCase()

              return (
                <Card
                  key={idx}
                  className={`p-4 border-border/80 transition-colors ${
                    quizResult?.submitted
                      ? isCorrect
                        ? 'border-emerald-500/40 bg-emerald-500/5'
                        : 'border-rose-500/40 bg-rose-500/5'
                      : ''
                  }`}
                >
                  <div className="space-y-2.5">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-primary">
                        Câu {idx + 1} / 20 ({q.type === 'fill' ? 'Điền từ' : 'Đọc hiểu'})
                      </span>
                      {quizResult?.submitted && (
                        <Badge
                          variant={isCorrect ? 'success' : 'destructive'}
                          className="text-[10px]"
                        >
                          {isCorrect ? 'Đúng (+1đ)' : `Sai (Đáp án: ${q.answer})`}
                        </Badge>
                      )}
                    </div>

                    <p className="text-sm font-medium text-foreground">
                      {q.question}
                    </p>

                    <div className="pt-1">
                      <Input
                        disabled={quizResult?.submitted}
                        placeholder={t.english.yourAnswer}
                        value={userAns}
                        onChange={(e) => setAnswer(idx, e.target.value)}
                        className="text-xs h-9 bg-background/80"
                      />
                    </div>
                  </div>
                </Card>
              )
            })}
          </div>

          {/* Submit Button */}
          {!quizResult?.submitted && (
            <div className="flex justify-end pt-3">
              <Button
                onClick={submitQuiz}
                size="lg"
                className="w-full sm:w-auto text-sm font-bold shadow-md"
              >
                <Sparkles className="h-4 w-4 mr-2" />
                {t.english.submitQuiz}
              </Button>
            </div>
          )}
        </div>
      )}

      {/* ================= TAB 4: SỔ TỪ VỰNG (VOCABULARY NOTEBOOK) ================= */}
      {activeTab === 'vocabulary' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-base font-bold flex items-center gap-2">
                <Heart className="h-4 w-4 text-rose-500 fill-rose-500" />
                Sổ từ vựng đã lưu ({savedWords.length} từ)
              </h2>
              <p className="text-xs text-muted-foreground mt-0.5">
                Nhấp chuột phải vào bất kỳ từ nào trong lời bài hát để lưu từ vựng vào đây
              </p>
            </div>

            {/* Search Bar */}
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
              <Input
                placeholder="Tìm từ vựng hoặc nghĩa..."
                value={vocabSearch}
                onChange={(e) => setVocabSearch(e.target.value)}
                className="text-xs h-8 pl-8"
              />
            </div>
          </div>

          {filteredWords.length === 0 ? (
            <Card className="p-10 text-center border-dashed border-border/80 bg-card/40">
              <Heart className="h-10 w-10 text-muted-foreground/30 mx-auto mb-2" />
              <h3 className="text-sm font-semibold text-foreground">
                {vocabSearch ? 'Không tìm thấy từ vựng phù hợp' : 'Chưa có từ vựng nào trong sổ'}
              </h3>
              <p className="text-xs text-muted-foreground max-w-sm mx-auto mt-1">
                {vocabSearch
                  ? 'Hãy thử tìm kiếm với từ khóa khác'
                  : 'Vào mục "Luyện nghe", nhấp chuột phải vào từ bất kỳ trên lời bài hát để lưu từ vựng yêu thích!'}
              </p>
            </Card>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {filteredWords.map((wordItem) => (
                <Card
                  key={wordItem.id}
                  className="p-3.5 border-border/70 hover:border-primary/40 transition-all hover:shadow-xs flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-start justify-between gap-2">
                      <span className="text-sm font-bold text-foreground capitalize">
                        {wordItem.word}
                      </span>
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => deleteWord(wordItem.id)}
                        className="h-6 w-6 text-muted-foreground hover:text-destructive shrink-0"
                        title="Xóa khỏi sổ từ vựng"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                      {wordItem.meaning || 'Chưa có ghi chú nghĩa'}
                    </p>
                  </div>

                  <div className="pt-2 mt-3 border-t border-border/40 flex items-center justify-between text-[11px]">
                    <Badge variant="outline" className="text-[10px] font-normal">
                      Cấp độ {wordItem.mastery || 1}
                    </Badge>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => playSpeech(wordItem.word)}
                      className="h-7 px-2.5 text-xs"
                    >
                      <Volume2 className="h-3 w-3 mr-1 text-primary" />
                      Phát âm
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Floating Right-Click Context Menu for Vocabulary */}
      {contextMenu && (
        <>
          {/* Click-outside transparent overlay */}
          <div
            className="fixed inset-0 z-40 bg-transparent"
            onClick={closeContextMenu}
            onContextMenu={(e) => {
              e.preventDefault()
              closeContextMenu()
            }}
          />

          {/* Floating popup positioned at cursor */}
          <div
            style={{
              top: Math.min(
                contextMenu.y,
                (typeof window !== 'undefined' ? window.innerHeight : 800) - 220
              ),
              left: Math.min(
                contextMenu.x,
                (typeof window !== 'undefined' ? window.innerWidth : 1200) - 270
              ),
            }}
            className="fixed z-50 w-64 rounded-xl border border-border/80 bg-popover/95 p-3.5 shadow-2xl backdrop-blur-md animate-in fade-in zoom-in-95 duration-150 text-foreground"
          >
            <div className="flex items-start justify-between gap-2 border-b border-border/50 pb-2 mb-2">
              <div className="min-w-0 pr-1">
                <span className="text-sm font-bold text-foreground capitalize truncate block">
                  {contextMenu.word}
                </span>
                <p className="text-xs text-muted-foreground mt-0.5 break-words">
                  {contextMenu.meaning || 'Từ vựng trong bài hát'}
                </p>
              </div>
              <Button
                size="icon"
                variant="ghost"
                onClick={() => toggleSaveWord(contextMenu.word, contextMenu.meaning)}
                className="h-8 w-8 shrink-0 hover:bg-rose-500/10 text-rose-500"
                title={
                  isWordSaved(contextMenu.word)
                    ? 'Bỏ lưu khỏi sổ từ vựng'
                    : 'Lưu vào sổ từ vựng'
                }
              >
                <Heart
                  className={`h-4 w-4 ${
                    isWordSaved(contextMenu.word)
                      ? 'fill-rose-500 text-rose-500'
                      : 'text-rose-500'
                  }`}
                />
              </Button>
            </div>

            <div className="space-y-1.5">
              <Button
                size="sm"
                variant="secondary"
                onClick={() => {
                  playSpeech(contextMenu.word)
                }}
                className="w-full h-8 text-xs font-semibold justify-start"
              >
                <Volume2 className="h-3.5 w-3.5 mr-2 text-primary" />
                Phát âm từ này
              </Button>

              <Button
                size="sm"
                variant={isWordSaved(contextMenu.word) ? 'outline' : 'default'}
                onClick={() => {
                  toggleSaveWord(contextMenu.word, contextMenu.meaning)
                }}
                className={`w-full h-8 text-xs font-semibold justify-start ${
                  isWordSaved(contextMenu.word)
                    ? 'text-rose-500 border-rose-500/30 hover:bg-rose-500/10'
                    : 'bg-rose-600 hover:bg-rose-700 text-white'
                }`}
              >
                <Heart
                  className={`h-3.5 w-3.5 mr-2 ${
                    isWordSaved(contextMenu.word)
                      ? 'fill-current text-rose-500'
                      : 'fill-white text-white'
                  }`}
                />
                {isWordSaved(contextMenu.word)
                  ? 'Đã lưu (Bấm để bỏ lưu)'
                  : 'Thêm vào Sổ từ vựng ❤️'}
              </Button>
            </div>
          </div>
        </>
      )}

      {/* ================= MODAL: TẠO BÀI HỌC TIẾNG ANH MỚI ================= */}
      <Dialog open={isAddLessonOpen} onOpenChange={setIsAddLessonOpen}>
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <GraduationCap className="h-5 w-5 text-primary" />
              Thêm bài học tiếng Anh mới
            </DialogTitle>
            <DialogDescription>
              Nhập tiêu đề, đoạn văn và bản dịch. Hệ thống sẽ tự động tạo sẵn 20 câu hỏi trắc nghiệm & điền từ tương ứng!
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmitLesson(onCreateLessonSubmit)} className="space-y-3.5 mt-2">
            <div className="space-y-1">
              <label className="text-xs font-semibold">Tiêu đề bài học</label>
              <Input
                placeholder="VD: Lesson 3 — Ordering food at a restaurant"
                {...registerLesson('title')}
              />
              {errorsLesson.title && (
                <p className="text-[11px] text-destructive">{errorsLesson.title.message}</p>
              )}
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <YoutubeIcon className="h-3.5 w-3.5 text-red-600 fill-current" />
                  Link YouTube / Video ID (Tùy chọn)
                </span>
                <span className="text-[10px] text-muted-foreground font-normal">Link bài hát hoặc lyric video</span>
              </label>
              <Input
                placeholder="VD: https://www.youtube.com/watch?v=m-M1AtrxztU hoặc m-M1AtrxztU"
                {...registerLesson('youtube_url')}
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-xs font-semibold">Chủ đề (Topic)</label>
                <Input placeholder="VD: Travel, Work, Food..." {...registerLesson('topic')} />
                {errorsLesson.topic && (
                  <p className="text-[11px] text-destructive">{errorsLesson.topic.message}</p>
                )}
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold">Trình độ (Level)</label>
                <Input placeholder="VD: TOEIC 500-600, B1, B2..." {...registerLesson('level')} />
                {errorsLesson.level && (
                  <p className="text-[11px] text-destructive">{errorsLesson.level.message}</p>
                )}
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold">Đoạn văn tiếng Anh (Transcript)</label>
              <Textarea
                rows={4}
                placeholder="Nhập toàn bộ đoạn văn tiếng Anh để luyện nghe 7 lần..."
                {...registerLesson('transcript')}
              />
              {errorsLesson.transcript && (
                <p className="text-[11px] text-destructive">{errorsLesson.transcript.message}</p>
              )}
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold">Bản dịch nghĩa (Tiếng Việt)</label>
              <Textarea
                rows={3}
                placeholder="Nhập bản dịch nghĩa để hiển thị trong lần nghe 1 & 2..."
                {...registerLesson('translation')}
              />
              {errorsLesson.translation && (
                <p className="text-[11px] text-destructive">{errorsLesson.translation.message}</p>
              )}
            </div>

            <div className="flex justify-end space-x-2 pt-2 border-t border-border/50">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsAddLessonOpen(false)}
                className="text-xs"
              >
                {t.common.cancel}
              </Button>
              <Button type="submit" disabled={isCreatingLesson} className="text-xs font-bold">
                {isCreatingLesson ? t.common.loading : 'Lưu bài học'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* ================= MODAL: CHỈNH SỬA BÀI HỌC TIẾNG ANH ================= */}
      <Dialog open={isEditLessonOpen} onOpenChange={setIsEditLessonOpen}>
        <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Pencil className="h-5 w-5 text-primary" />
              Chỉnh sửa bài học & video
            </DialogTitle>
            <DialogDescription>
              Cập nhật lại tiêu đề, link video YouTube/lời bài hát, đoạn văn hoặc bản dịch nghĩa.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmitEditLesson(onUpdateLessonSubmit)} className="space-y-3.5 mt-2">
            <div className="space-y-1">
              <label className="text-xs font-semibold">Tiêu đề bài học</label>
              <Input
                placeholder={'VD: Song: "Rather Be" — Clean Bandit ft. Jess Glynne'}
                {...registerEditLesson('title')}
              />
              {errorsEditLesson.title && (
                <p className="text-[11px] text-destructive">{errorsEditLesson.title.message}</p>
              )}
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <YoutubeIcon className="h-3.5 w-3.5 text-red-600 fill-current" />
                  Link YouTube / Video ID
                </span>
                <span className="text-[10px] text-muted-foreground font-normal">Hỗ trợ link full hoặc mã ID 11 ký tự</span>
              </label>
              <Input
                placeholder="VD: https://www.youtube.com/watch?v=m-M1AtrxztU hoặc m-M1AtrxztU"
                {...registerEditLesson('youtube_url')}
              />
              {errorsEditLesson.youtube_url && (
                <p className="text-[11px] text-destructive">{errorsEditLesson.youtube_url.message}</p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-xs font-semibold">Chủ đề (Topic)</label>
                <Input placeholder="VD: Pop / Electronic, Travel, Work..." {...registerEditLesson('topic')} />
                {errorsEditLesson.topic && (
                  <p className="text-[11px] text-destructive">{errorsEditLesson.topic.message}</p>
                )}
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold">Trình độ (Level)</label>
                <Input placeholder="VD: B1, B2, TOEIC 500-600..." {...registerEditLesson('level')} />
                {errorsEditLesson.level && (
                  <p className="text-[11px] text-destructive">{errorsEditLesson.level.message}</p>
                )}
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold">Đoạn văn tiếng Anh / Lời bài hát (Transcript)</label>
              <Textarea
                rows={5}
                placeholder="Nhập toàn bộ lời bài hát hoặc văn bản tiếng Anh..."
                {...registerEditLesson('transcript')}
              />
              {errorsEditLesson.transcript && (
                <p className="text-[11px] text-destructive">{errorsEditLesson.transcript.message}</p>
              )}
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold">Bản dịch nghĩa (Tiếng Việt)</label>
              <Textarea
                rows={4}
                placeholder="Nhập bản dịch nghĩa tiếng Việt..."
                {...registerEditLesson('translation')}
              />
              {errorsEditLesson.translation && (
                <p className="text-[11px] text-destructive">{errorsEditLesson.translation.message}</p>
              )}
            </div>

            <div className="flex justify-end space-x-2 pt-2 border-t border-border/50">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsEditLessonOpen(false)}
                className="text-xs"
              >
                {t.common.cancel}
              </Button>
              <Button type="submit" disabled={isUpdatingLesson} className="text-xs font-bold">
                {isUpdatingLesson ? t.common.loading : 'Cập nhật thay đổi'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
