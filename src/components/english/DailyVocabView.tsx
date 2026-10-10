import React, { useState, useEffect } from 'react'
import {
  Volume2,
  Sparkles,
  Award,
  BookOpen,
  CheckCircle2,
  XCircle,
  RotateCcw,
  Play,
  Pause,
  ChevronLeft,
  ChevronRight,
  Heart,
  Search,
  HelpCircle,
  Clock,
  ArrowRight,
  Headphones,
  Check,
  ListFilter,
  Layers,
  GraduationCap,
  Target,
  PenTool,
  FileEdit,
  Lightbulb,
} from 'lucide-react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Input } from '@/components/ui/input'
import { useDailyVocabulary, sentenceContainsWord } from '@/hooks/useDailyVocabulary'
import type { DailyVocabWord } from '@/types/vocabulary'

interface DailyVocabViewProps {
  onNavigateToSavedVocab?: () => void
}

export function DailyVocabView({ onNavigateToSavedVocab }: DailyVocabViewProps) {
  const {
    selectedDay,
    setSelectedDay,
    dailyGoal,
    setDailyGoal,
    currentPack,
    words,
    // Flashcard
    cardIndex,
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
    quizQuestions,
    currentQuizIndex,
    setCurrentQuizIndex,
    userAnswers,
    selectAnswer,
    userSentences,
    updateSentenceAnswer,
    changeSentenceQuestionWord,
    submitQuiz,
    restartQuiz,
    quizSubmitted,
    quizResult,
    startQuiz,
    // Notebook Sync
    isWordSavedInNotebook,
    toggleSaveNotebook,
    // Overall Stats
    completedDays,
    allPacks,
    todayIndex,
  } = useDailyVocabulary()

  const [activeMode, setActiveMode] = useState<'flashcard' | 'list' | 'quiz'>('flashcard')
  const [listSearch, setListSearch] = useState<string>('')
  const [filterMastered, setFilterMastered] = useState<'all' | 'mastered' | 'unlearned'>('all')
  const [showSentenceHint, setShowSentenceHint] = useState<boolean>(false)

  const currentWord: DailyVocabWord | undefined = words[cardIndex]
  const currentProgress = completedDays[selectedDay]
  const masteredCount = words.filter((w) => masteredWordIds.has(w.id)).length
  const progressPercent = Math.round((masteredCount / words.length) * 100)

  // Keyboard navigation for flashcards
  useEffect(() => {
    if (activeMode !== 'flashcard' || isQuizActive) return

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return

      if (e.code === 'Space') {
        e.preventDefault()
        flipCard()
      } else if (e.code === 'ArrowRight') {
        e.preventDefault()
        nextCard()
      } else if (e.code === 'ArrowLeft') {
        e.preventDefault()
        prevCard()
      } else if (e.key === 'p' || e.key === 'P') {
        e.preventDefault()
        if (currentWord) speak(currentWord.word)
      } else if (e.key === 'm' || e.key === 'M') {
        e.preventDefault()
        if (currentWord) toggleMasterWord(currentWord.id)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [activeMode, isQuizActive, flipCard, nextCard, prevCard, currentWord, speak, toggleMasterWord])

  // Filtered words for List view
  const filteredWords = words.filter((item) => {
    const matchesSearch =
      item.word.toLowerCase().includes(listSearch.toLowerCase()) ||
      item.meaning.toLowerCase().includes(listSearch.toLowerCase()) ||
      item.topic.toLowerCase().includes(listSearch.toLowerCase())

    if (!matchesSearch) return false
    if (filterMastered === 'mastered') return masteredWordIds.has(item.id)
    if (filterMastered === 'unlearned') return !masteredWordIds.has(item.id)
    return true
  })

  // Current quiz question
  const currentQuestion = quizQuestions[currentQuizIndex]

  return (
    <div className="space-y-5 w-full max-w-full min-w-0 overflow-x-hidden">
      {/* 1. Header Banner & Day Selector */}
      <Card className="border-border/80 bg-linear-to-r from-card/90 via-card to-card/90 shadow-xs overflow-hidden">
        <div className="p-4 sm:p-5">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-2 flex-wrap">
                <Badge variant="secondary" className="text-xs font-semibold px-2.5 py-0.5">
                  <Sparkles className="h-3 w-3 mr-1 text-amber-500" />
                  Học {words.length} từ vựng
                </Badge>
                {selectedDay === todayIndex && (
                  <Badge variant="success" className="text-[10px] px-2 py-0.5">
                    Hôm nay (Ngày {todayIndex})
                  </Badge>
                )}
                {currentProgress?.quizScore !== undefined && (
                  <Badge
                    variant={currentProgress.percentage && currentProgress.percentage >= 70 ? 'success' : 'outline'}
                    className="text-[10px] px-2 py-0.5 flex items-center gap-1"
                  >
                    <CheckCircle2 className="h-3 w-3" />
                    Đã kiểm tra: {currentProgress.quizScore}/{currentProgress.quizTotal || words.length} ({currentProgress.percentage}%)
                  </Badge>
                )}

                {/* Daily Goal Switcher: 20, 30, 50 words */}
                <div className="inline-flex items-center gap-1 bg-muted/80 p-0.5 rounded-lg border border-border/60">
                  <span className="text-[10px] font-semibold text-muted-foreground px-1.5 flex items-center gap-0.5">
                    <Target className="h-3 w-3 text-primary" /> Mục tiêu:
                  </span>
                  {[20, 30, 50].map((goal) => (
                    <button
                      key={goal}
                      onClick={() => setDailyGoal(goal)}
                      className={`px-2 py-0.5 rounded-md text-[11px] font-bold transition-all ${
                        dailyGoal === goal
                          ? 'bg-primary text-primary-foreground shadow-xs'
                          : 'text-muted-foreground hover:text-foreground hover:bg-background/60'
                      }`}
                    >
                      {goal} từ {goal === 50 && '🔥'}
                    </button>
                  ))}
                </div>
              </div>

              <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
                <span>Ngày {selectedDay}:</span>
                <span className="text-primary">{currentPack.title}</span>
              </h1>
              <p className="text-xs sm:text-sm text-muted-foreground mt-1 max-w-2xl">
                {currentPack.description}
              </p>
            </div>

            {/* Daily stats summary */}
            <div className="flex items-center gap-3 bg-muted/60 p-3 rounded-xl border border-border/60 shrink-0">
              <div className="text-center px-2">
                <span className="text-lg font-black text-foreground block">{masteredCount}/{words.length}</span>
                <span className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">
                  Đã thuộc
                </span>
              </div>
              <div className="h-7 w-[1px] bg-border" />
              <div className="text-center px-2">
                <span className="text-lg font-black text-primary block">
                  {currentProgress?.quizScore !== undefined
                    ? `${currentProgress.percentage}%`
                    : 'Chưa thi'}
                </span>
                <span className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">
                  Điểm KT
                </span>
              </div>
            </div>
          </div>

          {/* Day selection slider / buttons */}
          <div className="mt-4 pt-3 border-t border-border/50 flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none w-full max-w-full min-w-0">
            <span className="text-xs font-semibold text-muted-foreground shrink-0 mr-1 flex items-center gap-1">
              <Layers className="h-3.5 w-3.5" />
              Chọn ngày:
            </span>
            {allPacks.map((pack) => {
              const isSelected = pack.day === selectedDay
              const isToday = pack.day === todayIndex
              const dayProgress = completedDays[pack.day]
              const hasPassed = dayProgress?.percentage && dayProgress.percentage >= 70

              return (
                <button
                  key={pack.day}
                  onClick={() => setSelectedDay(pack.day)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium shrink-0 transition-all flex items-center gap-1.5 border ${
                    isSelected
                      ? 'bg-primary text-primary-foreground border-primary font-bold shadow-xs'
                      : 'bg-background hover:bg-muted text-muted-foreground hover:text-foreground border-border/60'
                  }`}
                >
                  <span>Ngày {pack.day}</span>
                  {isToday && <span className="h-1.5 w-1.5 rounded-full bg-amber-400" />}
                  {hasPassed && <Check className="h-3 w-3 text-emerald-400" />}
                </button>
              )
            })}
          </div>
        </div>
      </Card>

      {/* 2. Navigation Tabs between Flashcard / List / Daily Quiz */}
      <div className="flex items-center justify-between flex-wrap gap-3 w-full max-w-full min-w-0">
        <div className="w-full sm:w-auto overflow-x-auto scrollbar-none min-w-0 pb-1 sm:pb-0">
          <div className="inline-flex rounded-xl bg-muted p-1 border border-border/60 shrink-0">
          <button
            onClick={() => {
              setActiveMode('flashcard')
              stopAutoPlay()
            }}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
              activeMode === 'flashcard'
                ? 'bg-background text-foreground shadow-xs'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <BookOpen className="h-3.5 w-3.5" />
            Học Flashcards ({words.length} từ)
          </button>
          <button
            onClick={() => {
              setActiveMode('list')
              stopAutoPlay()
            }}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
              activeMode === 'list'
                ? 'bg-background text-foreground shadow-xs'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <Layers className="h-3.5 w-3.5" />
            Danh sách từ ({words.length})
          </button>
          <button
            onClick={() => {
              setActiveMode('quiz')
              stopAutoPlay()
              if (!isQuizActive && !quizSubmitted) {
                startQuiz()
              }
            }}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
              activeMode === 'quiz'
                ? 'bg-primary text-primary-foreground shadow-xs font-bold'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <GraduationCap className="h-3.5 w-3.5" />
            Bài kiểm tra ({quizQuestions.length || words.length} câu)
            {currentProgress?.quizScore !== undefined && (
              <span className="ml-1 text-[10px] bg-background/20 px-1.5 py-0.2 rounded-full">
                {currentProgress.quizScore}/{currentProgress.quizTotal || words.length}
              </span>
            )}
          </button>
        </div>
      </div>

        {/* Audio Tutor toggle button */}
        <div className="flex items-center gap-2">
          {activeMode === 'flashcard' && (
            <Button
              size="sm"
              variant={isAutoPlaying ? 'destructive' : 'outline'}
              onClick={isAutoPlaying ? stopAutoPlay : startAutoPlay}
              className="text-xs h-8.5 gap-1.5 shadow-xs"
            >
              {isAutoPlaying ? (
                <>
                  <Pause className="h-3.5 w-3.5" />
                  Dừng đọc tự động
                </>
              ) : (
                <>
                  <Headphones className="h-3.5 w-3.5 text-primary" />
                  Tự động đọc {words.length} từ
                </>
              )}
            </Button>
          )}

          {onNavigateToSavedVocab && (
            <Button
              size="sm"
              variant="ghost"
              onClick={onNavigateToSavedVocab}
              className="text-xs h-8.5 text-muted-foreground hover:text-foreground gap-1"
            >
              <Heart className="h-3.5 w-3.5 text-rose-500 fill-rose-500" />
              Sổ từ vựng
            </Button>
          )}
        </div>
      </div>

      {/* ================= MODE 1: FLASHCARDS ================= */}
      {activeMode === 'flashcard' && currentWord && (
        <div className="space-y-4 max-w-2xl mx-auto">
          {/* Card counter & progress */}
          <div className="flex items-center justify-between text-xs text-muted-foreground px-1">
            <span className="font-semibold text-foreground">
              Từ {cardIndex + 1} / {words.length}
            </span>
            <div className="flex items-center gap-2">
              <span className="text-[11px]">Đã thuộc: {progressPercent}%</span>
              <Progress value={((cardIndex + 1) / words.length) * 100} className="w-24 h-2" />
            </div>
          </div>

          {/* Interactive 3D Animated Flashcard */}
          <div className="perspective-1000 w-full min-h-[360px] sm:min-h-[380px]">
            <div
              onClick={flipCard}
              className={`cursor-pointer select-none relative w-full min-h-[360px] sm:min-h-[380px] rounded-2xl transform-style-3d transition-transform duration-500 shadow-md ${
                isFlipped ? 'rotate-y-180' : ''
              }`}
            >
              {/* FRONT FACE */}
              <div className="absolute inset-0 backface-hidden rounded-2xl border-2 border-border/80 bg-card p-6 sm:p-8 flex flex-col justify-between hover:border-primary/50 transition-colors group">
                {/* Top Bar of the Card */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-xs font-semibold uppercase tracking-wider">
                      {currentWord.partOfSpeech}
                    </Badge>
                    {masteredWordIds.has(currentWord.id) && (
                      <Badge variant="success" className="text-[10px] px-2 py-0.5">
                        <CheckCircle2 className="h-3 w-3 mr-1" />
                        Đã thuộc
                      </Badge>
                    )}
                  </div>

                  <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                    {/* Voice Pronounce */}
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => speak(currentWord.word)}
                      className="h-9 w-9 rounded-full hover:bg-primary/10 text-primary"
                      title="Phát âm từ này (Nhấn phím P)"
                    >
                      <Volume2 className="h-5 w-5" />
                    </Button>

                    {/* Save to Notebook */}
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => toggleSaveNotebook(currentWord)}
                      className="h-9 w-9 rounded-full hover:bg-rose-500/10 text-rose-500"
                      title="Lưu vào Sổ từ vựng cá nhân"
                    >
                      <Heart
                        className={`h-5 w-5 ${
                          isWordSavedInNotebook(currentWord.word) ? 'fill-rose-500 text-rose-500' : ''
                        }`}
                      />
                    </Button>
                  </div>
                </div>

                {/* FRONT Center: Word, Phonetic, Topic */}
                <div className="text-center my-auto py-4">
                  <h2 className="text-3xl sm:text-4xl font-extrabold text-foreground tracking-tight mb-2 group-hover:scale-105 transition-transform duration-200">
                    {currentWord.word}
                  </h2>
                  <p className="text-base sm:text-lg text-primary font-mono tracking-wide font-medium">
                    {currentWord.phonetic}
                  </p>
                  <div className="mt-4 flex items-center justify-center gap-2">
                    <Badge variant="secondary" className="text-[11px]">
                      {currentWord.topic}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground/80 mt-6 flex items-center justify-center gap-1.5 font-medium">
                    <RotateCcw className="h-3.5 w-3.5 text-primary" />
                    Bấm vào thẻ hoặc phím Space để lật xem nghĩa
                  </p>
                </div>

                {/* FRONT Bottom Controls */}
                <div
                  className="flex items-center justify-between pt-3 border-t border-border/50 text-xs"
                  onClick={(e) => e.stopPropagation()}
                >
                  <Button
                    size="sm"
                    variant={masteredWordIds.has(currentWord.id) ? 'default' : 'outline'}
                    onClick={() => toggleMasterWord(currentWord.id)}
                    className={`text-xs h-8 gap-1.5 ${
                      masteredWordIds.has(currentWord.id)
                        ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                        : ''
                    }`}
                  >
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    {masteredWordIds.has(currentWord.id) ? 'Đã thuộc từ này' : 'Đánh dấu đã thuộc (M)'}
                  </Button>

                  <span className="text-[11px] text-muted-foreground hidden sm:inline font-mono">
                    Space: Lật • ←/→: Chuyển • P: Nghe
                  </span>
                </div>
              </div>

              {/* BACK FACE */}
              <div className="absolute inset-0 backface-hidden rotate-y-180 rounded-2xl border-2 border-primary/40 bg-card p-6 sm:p-8 flex flex-col justify-between shadow-lg">
                {/* BACK Top Bar */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary" className="text-xs font-semibold">
                      Định nghĩa & Ví dụ
                    </Badge>
                    <span className="text-xs font-mono text-muted-foreground">
                      {currentWord.word} ({currentWord.partOfSpeech})
                    </span>
                  </div>

                  <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => speak(currentWord.word)}
                      className="h-9 w-9 rounded-full hover:bg-primary/10 text-primary"
                      title="Phát âm từ"
                    >
                      <Volume2 className="h-5 w-5" />
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => toggleSaveNotebook(currentWord)}
                      className="h-9 w-9 rounded-full hover:bg-rose-500/10 text-rose-500"
                      title="Lưu sổ từ vựng"
                    >
                      <Heart
                        className={`h-5 w-5 ${
                          isWordSavedInNotebook(currentWord.word) ? 'fill-rose-500 text-rose-500' : ''
                        }`}
                      />
                    </Button>
                  </div>
                </div>

                {/* BACK Center: Meaning & Examples */}
                <div className="my-auto py-2 space-y-3.5">
                  <div className="text-center">
                    <span className="text-[11px] text-muted-foreground font-semibold uppercase tracking-wider block">
                      Nghĩa tiếng Việt:
                    </span>
                    <h3 className="text-xl sm:text-2xl font-bold text-foreground mt-0.5">
                      {currentWord.meaning}
                    </h3>
                  </div>

                  {/* Bilingual Example Box */}
                  <div className="bg-muted/60 p-3.5 rounded-xl border border-border/60 text-left space-y-1.5">
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-xs sm:text-sm font-semibold text-foreground italic">
                        "{currentWord.exampleEn}"
                      </p>
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={(e) => {
                          e.stopPropagation()
                          speak(currentWord.exampleEn)
                        }}
                        className="h-6 w-6 shrink-0 text-primary"
                        title="Phát âm câu ví dụ"
                      >
                        <Volume2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                    <p className="text-xs text-muted-foreground">→ {currentWord.exampleVi}</p>
                  </div>

                  {/* Collocation */}
                  {currentWord.collocation && (
                    <div className="text-xs text-center text-muted-foreground">
                      <span className="font-semibold text-foreground">Cụm từ thường gặp: </span>
                      <span className="font-mono text-primary font-medium">{currentWord.collocation}</span>
                    </div>
                  )}
                </div>

                {/* BACK Bottom Controls */}
                <div
                  className="flex items-center justify-between pt-3 border-t border-border/50 text-xs flex-wrap gap-2"
                  onClick={(e) => e.stopPropagation()}
                >
                  <Button
                    size="sm"
                    variant={masteredWordIds.has(currentWord.id) ? 'default' : 'outline'}
                    onClick={() => toggleMasterWord(currentWord.id)}
                    className={`text-xs h-8 gap-1.5 ${
                      masteredWordIds.has(currentWord.id)
                        ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                        : ''
                    }`}
                  >
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    {masteredWordIds.has(currentWord.id) ? 'Đã thuộc từ này' : 'Đánh dấu đã thuộc (M)'}
                  </Button>

                  <p className="text-[11px] text-muted-foreground flex items-center gap-1">
                    <RotateCcw className="h-3 w-3 text-primary" />
                    Bấm để quay về mặt trước
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Navigation Controls */}
          <div className="flex items-center justify-between gap-3 pt-2">
            <Button
              variant="outline"
              size="sm"
              onClick={prevCard}
              className="flex-1 text-xs h-9 gap-1"
            >
              <ChevronLeft className="h-4 w-4" />
              Từ trước
            </Button>

            <Button
              variant="secondary"
              size="sm"
              onClick={flipCard}
              className="flex-1 text-xs h-9 gap-1 font-semibold"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              Lật thẻ
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={nextCard}
              className="flex-1 text-xs h-9 gap-1"
            >
              Từ tiếp theo
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>

          {/* Call to Action for Quiz */}
          <Card className="p-4 border-dashed border-primary/40 bg-primary/5 text-center mt-6">
            <h3 className="text-sm font-bold text-foreground flex items-center justify-center gap-1.5">
              <GraduationCap className="h-4 w-4 text-primary" />
              Sẵn sàng kiểm tra kiến thức Ngày {selectedDay}?
            </h3>
            <p className="text-xs text-muted-foreground mt-1 max-w-md mx-auto">
              Làm ngay bài kiểm tra {words.length} câu trắc nghiệm cho {words.length} từ hôm nay để khắc sâu trí nhớ và lưu điểm số vào hệ thống.
            </p>
            <Button
              size="sm"
              onClick={() => {
                setActiveMode('quiz')
                if (!isQuizActive) startQuiz()
              }}
              className="mt-3 text-xs h-8.5 px-4 font-bold gap-1.5 shadow-sm"
            >
              <Award className="h-3.5 w-3.5" />
              Bắt đầu bài kiểm tra ngay ({words.length} câu)
            </Button>
          </Card>
        </div>
      )}

      {/* ================= MODE 2: DANH SÁCH 20 TỪ (FULL LIST) ================= */}
      {activeMode === 'list' && (
        <div className="space-y-4">
          {/* Search & Filter Bar */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 w-full max-w-full min-w-0">
            <div className="relative w-full sm:w-72">
              <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
              <Input
                placeholder="Tìm từ vựng, nghĩa, chủ đề..."
                value={listSearch}
                onChange={(e) => setListSearch(e.target.value)}
                className="text-xs h-8.5 pl-8"
              />
            </div>

            <div className="flex items-center gap-1.5 flex-wrap self-start sm:self-auto w-full sm:w-auto">
              <span className="text-xs text-muted-foreground flex items-center gap-1">
                <ListFilter className="h-3.5 w-3.5" /> Lọc:
              </span>
              <button
                onClick={() => setFilterMastered('all')}
                className={`px-2.5 py-1 rounded-md text-xs font-medium transition-all ${
                  filterMastered === 'all'
                    ? 'bg-muted text-foreground font-bold'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                Tất cả ({words.length})
              </button>
              <button
                onClick={() => setFilterMastered('mastered')}
                className={`px-2.5 py-1 rounded-md text-xs font-medium transition-all ${
                  filterMastered === 'mastered'
                    ? 'bg-emerald-500/10 text-emerald-600 font-bold'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                Đã thuộc ({masteredCount})
              </button>
              <button
                onClick={() => setFilterMastered('unlearned')}
                className={`px-2.5 py-1 rounded-md text-xs font-medium transition-all ${
                  filterMastered === 'unlearned'
                    ? 'bg-amber-500/10 text-amber-600 font-bold'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                Cần học ({words.length - masteredCount})
              </button>
            </div>
          </div>

          {/* Words Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {filteredWords.map((wordItem, idx) => {
              const isMastered = masteredWordIds.has(wordItem.id)
              const isSaved = isWordSavedInNotebook(wordItem.word)

              return (
                <Card
                  key={wordItem.id}
                  className={`p-4 border transition-all hover:shadow-xs flex flex-col justify-between ${
                    isMastered
                      ? 'border-emerald-500/30 bg-emerald-500/5'
                      : 'border-border/70 hover:border-primary/40'
                  }`}
                >
                  <div>
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-semibold text-muted-foreground/60">
                            #{idx + 1}
                          </span>
                          <h3 className="text-base font-bold text-foreground">{wordItem.word}</h3>
                          <Badge variant="outline" className="text-[10px] uppercase">
                            {wordItem.partOfSpeech}
                          </Badge>
                        </div>
                        <p className="text-xs text-primary font-mono mt-0.5 font-medium">
                          {wordItem.phonetic}
                        </p>
                      </div>

                      <div className="flex items-center gap-1">
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => speak(wordItem.word)}
                          className="h-7 w-7 text-primary hover:bg-primary/10"
                          title="Phát âm"
                        >
                          <Volume2 className="h-4 w-4" />
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => toggleSaveNotebook(wordItem)}
                          className="h-7 w-7 text-rose-500 hover:bg-rose-500/10"
                          title="Lưu vào sổ từ vựng"
                        >
                          <Heart className={`h-4 w-4 ${isSaved ? 'fill-rose-500' : ''}`} />
                        </Button>
                      </div>
                    </div>

                    <div className="mt-2.5">
                      <p className="text-sm font-semibold text-foreground">{wordItem.meaning}</p>
                    </div>

                    <div className="mt-2 p-2.5 rounded-lg bg-muted/50 border border-border/40 text-xs space-y-1">
                      <p className="text-foreground italic">"{wordItem.exampleEn}"</p>
                      <p className="text-muted-foreground">→ {wordItem.exampleVi}</p>
                    </div>
                  </div>

                  <div className="mt-3 pt-2.5 border-t border-border/40 flex items-center justify-between text-xs">
                    <span className="text-[11px] text-muted-foreground">
                      {wordItem.collocation ? (
                        <>
                          <span className="font-medium text-foreground">Cụm từ:</span>{' '}
                          {wordItem.collocation}
                        </>
                      ) : (
                        wordItem.topic
                      )}
                    </span>

                    <Button
                      size="sm"
                      variant={isMastered ? 'secondary' : 'outline'}
                      onClick={() => toggleMasterWord(wordItem.id)}
                      className="h-6 px-2 text-[11px] gap-1"
                    >
                      <CheckCircle2
                        className={`h-3 w-3 ${isMastered ? 'text-emerald-500' : 'text-muted-foreground'}`}
                      />
                      {isMastered ? 'Đã nhớ' : 'Chưa nhớ'}
                    </Button>
                  </div>
                </Card>
              )
            })}
          </div>
        </div>
      )}

      {/* ================= MODE 3: BÀI KIỂM TRA 20 CÂU (DAILY QUIZ) ================= */}
      {activeMode === 'quiz' && (
        <div className="max-w-2xl mx-auto space-y-5">
          {/* Case A: Quiz Completed Result Screen */}
          {quizSubmitted && quizResult ? (
            <Card className="p-6 sm:p-8 border-border/80 bg-card shadow-lg text-center space-y-6">
              <div className="space-y-2">
                <div className="inline-flex p-3 rounded-full bg-primary/10 text-primary mb-1">
                  <Award className="h-10 w-10" />
                </div>
                <h2 className="text-2xl sm:text-3xl font-black text-foreground">
                  Kết Quả Kiểm Tra Ngày {selectedDay}
                </h2>
                <p className="text-xs sm:text-sm text-muted-foreground">
                  {quizResult.passed
                    ? 'Chúc mừng! Bạn đã hoàn thành xuất sắc bài kiểm tra từ vựng hôm nay!'
                    : 'Bạn đã hoàn thành bài kiểm tra. Hãy xem lại các câu sai để ghi nhớ tốt hơn!'}
                </p>
              </div>

              {/* Score Display Card */}
              <div className="p-5 rounded-2xl bg-muted/60 border border-border/70 flex items-center justify-around">
                <div>
                  <span className="text-3xl sm:text-4xl font-extrabold text-primary block">
                    {quizResult.score} / {quizResult.total}
                  </span>
                  <span className="text-xs text-muted-foreground font-semibold uppercase tracking-wider">
                    Số câu đúng
                  </span>
                </div>
                <div className="h-10 w-[1px] bg-border" />
                <div>
                  <span className="text-3xl sm:text-4xl font-extrabold text-foreground block">
                    {quizResult.percentage}%
                  </span>
                  <span className="text-xs text-muted-foreground font-semibold uppercase tracking-wider">
                    Điểm số
                  </span>
                </div>
                <div className="h-10 w-[1px] bg-border" />
                <div>
                  <span className="text-3xl sm:text-4xl font-extrabold text-foreground block">
                    {quizResult.timeSpentSeconds}s
                  </span>
                  <span className="text-xs text-muted-foreground font-semibold uppercase tracking-wider">
                    Thời gian
                  </span>
                </div>
              </div>

              {/* Review of Custom Created Sentences */}
              {quizResult.createdSentences && quizResult.createdSentences.length > 0 && (
                <div className="text-left space-y-2.5 pt-2">
                  <h3 className="text-sm font-bold text-foreground flex items-center gap-1.5">
                    <PenTool className="h-4 w-4 text-primary" />
                    Câu tiếng Anh bạn đã tự đặt trong bài thi ({quizResult.createdSentences.length} câu):
                  </h3>

                  <div className="space-y-2.5">
                    {quizResult.createdSentences.map((sent, sIdx) => (
                      <div
                        key={sIdx}
                        className="p-3.5 rounded-xl border border-primary/30 bg-primary/5 text-xs space-y-1.5"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <p className="font-bold text-foreground sm:text-sm">
                            &quot;{sent.sentenceEn}&quot;
                          </p>
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => speak(sent.sentenceEn)}
                            className="h-7 w-7 text-primary hover:bg-primary/10 shrink-0"
                            title="Nghe phát âm câu vừa đặt"
                          >
                            <Volume2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                        <p className="text-muted-foreground font-medium">
                          → Nghĩa: <span className="text-foreground font-semibold">{sent.sentenceVi}</span>
                        </p>
                        <Badge variant="secondary" className="text-[10px] mt-1 font-semibold">
                          Từ vựng mục tiêu: {sent.word}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Review of incorrect answers */}
              {quizResult.wrongAnswers.length > 0 && (
                <div className="text-left space-y-3 pt-2">
                  <h3 className="text-sm font-bold text-foreground flex items-center gap-1.5">
                    <XCircle className="h-4 w-4 text-rose-500" />
                    Các câu cần ôn lại ({quizResult.wrongAnswers.length} câu):
                  </h3>

                  <div className="space-y-2.5 max-h-80 overflow-y-auto pr-1">
                    {quizResult.wrongAnswers.map((item, idx) => (
                      <div
                        key={idx}
                        className="p-3 rounded-xl border border-rose-500/20 bg-rose-500/5 text-xs space-y-1.5"
                      >
                        <p className="font-semibold text-foreground">{item.prompt}</p>
                        <div className="flex items-center gap-3">
                          <span className="text-rose-600 font-medium">
                            Bạn chọn: <del>{item.userChoice}</del>
                          </span>
                          <span className="text-emerald-600 font-bold">
                            Đáp án đúng: {item.correctChoice}
                          </span>
                        </div>
                        <p className="text-[11px] text-muted-foreground mt-1 bg-background/60 p-2 rounded-md">
                          💡 {item.explanation}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex items-center justify-center gap-3 pt-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={restartQuiz}
                  className="text-xs h-9 gap-1.5"
                >
                  <RotateCcw className="h-3.5 w-3.5" />
                  Làm lại bài kiểm tra
                </Button>

                {selectedDay < allPacks.length && (
                  <Button
                    size="sm"
                    onClick={() => {
                      setSelectedDay(selectedDay + 1)
                      setActiveMode('flashcard')
                    }}
                    className="text-xs h-9 font-bold gap-1.5 shadow-xs"
                  >
                    Học Ngày tiếp theo ({selectedDay + 1})
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Button>
                )}
              </div>
            </Card>
          ) : isQuizActive && currentQuestion ? (
            /* Case B: Actively Taking the Quiz */
            <div className="space-y-4">
              {/* Quiz Header Bar */}
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-xs font-bold text-foreground">
                    Câu {currentQuizIndex + 1} / {quizQuestions.length}
                  </Badge>
                  <span className="hidden sm:inline">
                    {currentQuestion.type === 'listening'
                      ? '🎧 Nghe chọn từ'
                      : currentQuestion.type === 'fill_in'
                        ? '✍️ Điền từ vào câu'
                        : currentQuestion.type === 'make_sentence'
                          ? '📝 Đặt câu & viết nghĩa'
                          : '🎯 Trắc nghiệm nghĩa'}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <span>
                    Đã trả lời:{' '}
                    {
                      quizQuestions.filter((q, i) => {
                        if (q.type === 'make_sentence') {
                          const s = userSentences[i]
                          return (
                            (s?.sentenceEn?.trim().length || 0) >= 3 &&
                            (s?.sentenceVi?.trim().length || 0) >= 2
                          )
                        }
                        return userAnswers[i] !== undefined
                      }).length
                    }
                    /{quizQuestions.length}
                  </span>
                  <Progress
                    value={((currentQuizIndex + 1) / quizQuestions.length) * 100}
                    className="w-24 h-2"
                  />
                </div>
              </div>

              {/* Question Card */}
              <Card className="p-5 sm:p-7 border-border/80 bg-card shadow-sm space-y-5">
                <div className="space-y-3">
                  <h3 className="text-base sm:text-lg font-bold text-foreground leading-snug">
                    {currentQuestion.prompt}
                  </h3>

                  {/* Context sentence for fill-in type */}
                  {currentQuestion.type === 'fill_in' && currentQuestion.contextSentence && (
                    <div className="p-3.5 rounded-xl bg-muted/60 border border-border/60 text-xs sm:text-sm font-medium text-foreground whitespace-pre-line">
                      {currentQuestion.contextSentence}
                    </div>
                  )}

                  {/* Audio button for listening type */}
                  {currentQuestion.type === 'listening' && (
                    <div className="text-center py-4">
                      <Button
                        size="lg"
                        onClick={() => speak(currentQuestion.word)}
                        className="rounded-full h-16 w-16 p-0 shadow-md hover:scale-105 transition-transform"
                      >
                        <Volume2 className="h-8 w-8" />
                      </Button>
                      <p className="text-xs text-muted-foreground mt-2 font-medium">
                        Bấm nút để nghe phát âm từ vựng
                      </p>
                    </div>
                  )}
                </div>

                {/* Question Body: Type make_sentence vs Multiple Choice */}
                {currentQuestion.type === 'make_sentence' ? (
                  <div className="space-y-4 pt-1">
                    {/* Target word display & selector */}
                    <div className="p-4 rounded-2xl bg-muted/50 border border-border/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-xl sm:text-2xl font-black text-foreground tracking-tight">
                            {currentQuestion.targetWord?.word || currentQuestion.word}
                          </span>
                          <span className="text-xs text-primary font-mono font-semibold">
                            {currentQuestion.targetWord?.phonetic}
                          </span>
                          <Badge variant="outline" className="text-[10px] uppercase font-bold">
                            {currentQuestion.targetWord?.partOfSpeech}
                          </Badge>
                        </div>
                        <p className="text-xs sm:text-sm text-muted-foreground mt-1 font-medium">
                          Nghĩa:{' '}
                          <span className="text-foreground font-semibold">
                            {currentQuestion.targetWord?.meaning}
                          </span>
                          {currentQuestion.targetWord?.collocation && (
                            <span className="ml-2 text-primary font-mono text-xs">
                              • Cụm: {currentQuestion.targetWord.collocation}
                            </span>
                          )}
                        </p>
                      </div>

                      <div className="flex items-center gap-2 self-start sm:self-auto flex-wrap">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => speak(currentQuestion.targetWord?.word || currentQuestion.word)}
                          className="h-8.5 px-2.5 text-primary hover:bg-primary/10 gap-1 text-xs"
                          title="Phát âm từ này"
                        >
                          <Volume2 className="h-4 w-4" />
                          Nghe từ
                        </Button>

                        {/* Optional change word dropdown */}
                        {words.length > 1 && (
                          <select
                            value={currentQuestion.wordId}
                            onChange={(e) => {
                              const selected = words.find((w) => w.id === e.target.value)
                              if (selected) changeSentenceQuestionWord(currentQuizIndex, selected)
                            }}
                            className="text-xs bg-background border border-border/80 rounded-lg px-2 py-1.5 text-muted-foreground hover:text-foreground cursor-pointer focus:ring-1 focus:ring-primary max-w-[180px] truncate"
                            title="Chọn từ khác để đặt câu"
                          >
                            {words.map((w) => (
                              <option key={w.id} value={w.id}>
                                Đổi từ: {w.word} ({w.meaning})
                              </option>
                            ))}
                          </select>
                        )}
                      </div>
                    </div>

                    {/* Step 1: Input English sentence */}
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between flex-wrap gap-1">
                        <label className="text-xs font-bold text-foreground flex items-center gap-1.5">
                          <PenTool className="h-3.5 w-3.5 text-primary" />
                          1. Đặt 1 câu tiếng Anh (phải chứa từ &quot;{currentQuestion.targetWord?.word || currentQuestion.word}&quot;):
                        </label>
                        {/* Word presence indicator badge */}
                        {sentenceContainsWord(
                          userSentences[currentQuizIndex]?.sentenceEn || '',
                          currentQuestion.targetWord?.word || currentQuestion.word
                        ) ? (
                          <Badge variant="success" className="text-[10px] px-2 py-0.5 gap-1">
                            <Check className="h-3 w-3" />
                            Đã chứa từ &quot;{currentQuestion.targetWord?.word || currentQuestion.word}&quot;
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="text-[10px] px-2 py-0.5 text-amber-500 border-amber-500/40">
                            Cần chứa từ &quot;{currentQuestion.targetWord?.word || currentQuestion.word}&quot;
                          </Badge>
                        )}
                      </div>

                      <div className="relative">
                        <textarea
                          rows={2}
                          value={userSentences[currentQuizIndex]?.sentenceEn || ''}
                          onChange={(e) =>
                            updateSentenceAnswer(
                              currentQuizIndex,
                              e.target.value,
                              userSentences[currentQuizIndex]?.sentenceVi || ''
                            )
                          }
                          placeholder={`Ví dụ: The company will ${currentQuestion.targetWord?.word || currentQuestion.word} the new policy next month.`}
                          className="w-full text-xs sm:text-sm p-3 rounded-xl border border-border/80 bg-background focus:ring-2 focus:ring-primary/20 focus:border-primary resize-none pr-10 font-medium"
                        />
                        {userSentences[currentQuizIndex]?.sentenceEn && (
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => speak(userSentences[currentQuizIndex].sentenceEn)}
                            className="absolute right-2 top-2 h-7 w-7 text-primary hover:bg-primary/10"
                            title="Nghe phát âm câu bạn vừa đặt"
                          >
                            <Volume2 className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </div>

                    {/* Step 2: Input Vietnamese meaning */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-foreground flex items-center gap-1.5">
                        <FileEdit className="h-3.5 w-3.5 text-primary" />
                        2. Viết nghĩa tiếng Việt của câu bạn vừa đặt:
                      </label>
                      <textarea
                        rows={2}
                        value={userSentences[currentQuizIndex]?.sentenceVi || ''}
                        onChange={(e) =>
                          updateSentenceAnswer(
                            currentQuizIndex,
                            userSentences[currentQuizIndex]?.sentenceEn || '',
                            e.target.value
                          )
                        }
                        placeholder="Ví dụ: Công ty sẽ triển khai chính sách mới vào tháng tới."
                        className="w-full text-xs sm:text-sm p-3 rounded-xl border border-border/80 bg-background focus:ring-2 focus:ring-primary/20 focus:border-primary resize-none font-medium"
                      />
                    </div>

                    {/* Toggle Sample Example Sentence Hint */}
                    <div className="pt-1">
                      <button
                        type="button"
                        onClick={() => setShowSentenceHint((prev) => !prev)}
                        className="text-xs text-muted-foreground hover:text-primary flex items-center gap-1 font-semibold transition-colors"
                      >
                        <Lightbulb className="h-3.5 w-3.5 text-amber-500" />
                        {showSentenceHint ? 'Ẩn câu ví dụ gợi ý' : 'Bí ý tưởng? Bấm để xem câu ví dụ gợi ý mẫu'}
                      </button>

                      {showSentenceHint && currentQuestion.targetWord && (
                        <div className="mt-2 p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-xs space-y-1 animate-in fade-in duration-200">
                          <p className="font-semibold text-foreground italic">
                            &quot;{currentQuestion.targetWord.exampleEn}&quot;
                          </p>
                          <p className="text-muted-foreground">
                            → {currentQuestion.targetWord.exampleVi}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  /* 4 Multiple Choice Options */
                  <div className="grid grid-cols-1 gap-2.5 pt-2">
                    {currentQuestion.options.map((opt, optIdx) => {
                      const isSelected = userAnswers[currentQuizIndex] === opt
                      const label = ['A', 'B', 'C', 'D'][optIdx]

                      return (
                        <button
                          key={optIdx}
                          onClick={() => selectAnswer(currentQuizIndex, opt)}
                          className={`w-full text-left p-3.5 sm:p-4 rounded-xl border text-xs sm:text-sm font-medium transition-all flex items-center justify-between ${
                            isSelected
                              ? 'border-primary bg-primary/10 text-primary font-bold shadow-xs'
                              : 'border-border/70 hover:border-primary/40 bg-card hover:bg-muted/40 text-foreground'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <span
                              className={`h-6 w-6 rounded-md flex items-center justify-center text-xs font-bold shrink-0 ${
                                isSelected
                                  ? 'bg-primary text-primary-foreground'
                                  : 'bg-muted text-muted-foreground'
                              }`}
                            >
                              {label}
                            </span>
                            <span>{opt}</span>
                          </div>

                          {isSelected && <CheckCircle2 className="h-4 w-4 text-primary shrink-0" />}
                        </button>
                      )
                    })}
                  </div>
                )}

                {/* Question Navigation Controls */}
                <div className="flex items-center justify-between pt-4 border-t border-border/50 gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={currentQuizIndex === 0}
                    onClick={() => {
                      setCurrentQuizIndex((prev) => Math.max(0, prev - 1))
                      setShowSentenceHint(false)
                    }}
                    className="text-xs h-8.5"
                  >
                    <ChevronLeft className="h-3.5 w-3.5 mr-1" />
                    Câu trước
                  </Button>

                  {currentQuizIndex < quizQuestions.length - 1 ? (
                    <Button
                      size="sm"
                      onClick={() => {
                        setCurrentQuizIndex((prev) =>
                          Math.min(quizQuestions.length - 1, prev + 1)
                        )
                        setShowSentenceHint(false)
                      }}
                      className="text-xs h-8.5 font-semibold"
                    >
                      Câu tiếp theo
                      <ChevronRight className="h-3.5 w-3.5 ml-1" />
                    </Button>
                  ) : (
                    <Button
                      size="sm"
                      onClick={submitQuiz}
                      className="text-xs h-8.5 font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs"
                    >
                      <Check className="h-3.5 w-3.5 mr-1" />
                      Nộp bài kiểm tra
                    </Button>
                  )}
                </div>
              </Card>

              {/* Quick Jump Question Grid */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none justify-center">
                {quizQuestions.map((q, idx) => {
                  const answered =
                    q.type === 'make_sentence'
                      ? (userSentences[idx]?.sentenceEn?.trim().length || 0) >= 3 &&
                        (userSentences[idx]?.sentenceVi?.trim().length || 0) >= 2
                      : userAnswers[idx] !== undefined
                  const isCurrent = idx === currentQuizIndex

                  return (
                    <button
                      key={idx}
                      onClick={() => {
                        setCurrentQuizIndex(idx)
                        setShowSentenceHint(false)
                      }}
                      className={`h-7 w-7 rounded-lg text-[11px] font-bold shrink-0 transition-all ${
                        isCurrent
                          ? 'ring-2 ring-primary ring-offset-2 bg-primary text-primary-foreground'
                          : answered
                            ? 'bg-muted text-foreground border border-border'
                            : 'bg-muted/40 text-muted-foreground/60 border border-border/30'
                      }`}
                      title={q.type === 'make_sentence' ? 'Thử thách đặt câu' : `Câu ${idx + 1}`}
                    >
                      {q.type === 'make_sentence' ? '✍️' : idx + 1}
                    </button>
                  )
                })}
              </div>
            </div>
          ) : (
            /* Case C: Quiz Intro / Start Screen */
            <Card className="p-6 sm:p-8 text-center border-border/80 bg-card space-y-5">
              <div className="p-3.5 rounded-full bg-primary/10 text-primary w-fit mx-auto">
                <GraduationCap className="h-8 w-8" />
              </div>

              <div>
                <h3 className="text-xl font-bold text-foreground">
                  Bài Kiểm Tra Từ Vựng - Ngày {selectedDay}
                </h3>
                <p className="text-xs sm:text-sm text-muted-foreground mt-1 max-w-md mx-auto">
                  Bộ đề kiểm tra toàn diện gồm trắc nghiệm nghĩa, điền từ vào câu ngữ cảnh, luyện nghe phát âm và{' '}
                  <span className="font-semibold text-foreground">thử thách tự đặt 1 câu tiếng Anh kèm viết nghĩa tiếng Việt</span>.
                </p>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 max-w-lg mx-auto text-left text-xs">
                <div className="p-2.5 rounded-lg bg-muted/60 border border-border/60">
                  <span className="text-muted-foreground block text-[10px]">Số câu hỏi:</span>
                  <span className="font-bold text-foreground">{words.length + 1} câu (kèm đặt câu)</span>
                </div>
                <div className="p-2.5 rounded-lg bg-muted/60 border border-border/60">
                  <span className="text-muted-foreground block text-[10px]">Thời lượng:</span>
                  <span className="font-bold text-foreground">Tự do</span>
                </div>
                <div className="p-2.5 rounded-lg bg-muted/60 border border-border/60">
                  <span className="text-muted-foreground block text-[10px]">Chuẩn đạt:</span>
                  <span className="font-bold text-emerald-600">≥ {Math.ceil((words.length + 1) * 0.7)}/{words.length + 1} (70%)</span>
                </div>
                <div className="p-2.5 rounded-lg bg-muted/60 border border-border/60">
                  <span className="text-muted-foreground block text-[10px]">Khen thưởng:</span>
                  <span className="font-bold text-amber-500">Lưu streak</span>
                </div>
              </div>

              <Button
                size="default"
                onClick={startQuiz}
                className="font-bold text-xs h-9.5 px-6 shadow-md gap-1.5"
              >
                <Award className="h-4 w-4" />
                Bắt đầu làm bài kiểm tra ngay
              </Button>
            </Card>
          )}
        </div>
      )}
    </div>
  )
}
