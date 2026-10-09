import React, { useState, useEffect } from 'react'
import {
  Search,
  Volume2,
  Star,
  CheckCircle2,
  Sparkles,
  BookOpen,
  Eye,
  EyeOff,
  Layers,
  Save,
  HelpCircle,
  Check,
  Quote,
  Filter,
  ArrowRight,
  Database,
  Flame,
} from 'lucide-react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { useToeicWordBank } from '@/hooks/useToeicWordBank'
import type { ToeicWordItem, WordBankFilter } from '@/types/toeicVocab'

interface WordCardProps {
  item: ToeicWordItem
  onSaveMeaning: (id: string, meaning: string) => void
  onSaveCollocMeaning: (id: string, meaning: string) => void
  onToggleFlashcard: (item: ToeicWordItem) => void
  onToggleMastered: (item: ToeicWordItem) => void
  onSpeak: (text: string) => void
}

function ToeicWordCard({
  item,
  onSaveMeaning,
  onSaveCollocMeaning,
  onToggleFlashcard,
  onToggleMastered,
  onSpeak,
}: WordCardProps) {
  const [localMeaning, setLocalMeaning] = useState(item.user_meaning || '')
  const [showSuggestedMeaning, setShowSuggestedMeaning] = useState(false)

  const [localCollocMeaning, setLocalCollocMeaning] = useState(item.user_collocation_meaning || '')
  const [showSuggestedColloc, setShowSuggestedColloc] = useState(false)

  // Sync state if item changes
  useEffect(() => {
    setLocalMeaning(item.user_meaning || '')
  }, [item.user_meaning])

  useEffect(() => {
    setLocalCollocMeaning(item.user_collocation_meaning || '')
  }, [item.user_collocation_meaning])

  const handleSaveMeaning = () => {
    if (localMeaning !== item.user_meaning) {
      onSaveMeaning(item.id, localMeaning.trim())
    }
  }

  const handleSaveCollocMeaning = () => {
    if (localCollocMeaning !== item.user_collocation_meaning) {
      onSaveCollocMeaning(item.id, localCollocMeaning.trim())
    }
  }

  return (
    <Card className="border-border/80 bg-card hover:border-primary/40 transition-all duration-200 overflow-hidden shadow-xs">
      <div className="p-4 sm:p-5 space-y-4">
        {/* 1. Header: Word, IPA, Badges & Actions */}
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
          <div className="space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-xl sm:text-2xl font-black text-foreground tracking-tight">
                {item.word}
              </h3>
              <button
                type="button"
                onClick={() => onSpeak(item.word)}
                className="p-1 rounded-full text-muted-foreground hover:text-primary hover:bg-muted/80 transition-colors"
                title="Nghe phát âm"
              >
                <Volume2 className="h-4 w-4" />
              </button>
              {item.phonetic && (
                <span className="text-xs sm:text-sm text-primary font-mono bg-primary/10 px-2 py-0.5 rounded-md">
                  {item.phonetic}
                </span>
              )}
              {item.part_of_speech && (
                <Badge variant="outline" className="text-[10px] uppercase font-bold tracking-wider">
                  {item.part_of_speech}
                </Badge>
              )}
              <Badge variant="secondary" className="text-[10px] font-medium">
                Ngày {item.day}
              </Badge>
            </div>
            {item.topic && (
              <p className="text-xs text-muted-foreground">{item.topic}</p>
            )}
          </div>

          {/* Action buttons: Flashcard & Mastered */}
          <div className="flex items-center gap-1.5 shrink-0">
            <Button
              size="sm"
              variant={item.in_flashcard ? 'default' : 'outline'}
              onClick={() => onToggleFlashcard(item)}
              className={`text-xs h-8 gap-1.5 font-bold transition-all ${
                item.in_flashcard
                  ? 'bg-amber-500 hover:bg-amber-600 text-white border-amber-500 shadow-xs'
                  : 'text-muted-foreground hover:text-amber-500 hover:border-amber-500/50'
              }`}
            >
              <Star className={`h-3.5 w-3.5 ${item.in_flashcard ? 'fill-white' : ''}`} />
              {item.in_flashcard ? 'Trong Flashcard' : 'Thêm vào Flashcard'}
            </Button>

            <Button
              size="sm"
              variant={item.is_mastered ? 'success' : 'ghost'}
              onClick={() => onToggleMastered(item)}
              className="text-xs h-8 px-2.5"
              title={item.is_mastered ? 'Đã thuộc từ này' : 'Đánh dấu đã thuộc'}
            >
              <CheckCircle2 className={`h-4 w-4 ${item.is_mastered ? 'text-emerald-500' : 'text-muted-foreground'}`} />
            </Button>
          </div>
        </div>

        {/* 2. Section 1: User Meaning Input & Suggested Answer */}
        <div className="bg-muted/40 rounded-xl p-3 border border-border/50 space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-foreground flex items-center gap-1.5">
              <span>✍️ Nghĩa tiếng Việt của bạn:</span>
            </span>
            <button
              type="button"
              onClick={() => setShowSuggestedMeaning(!showSuggestedMeaning)}
              className="text-[11px] text-primary hover:underline flex items-center gap-1 font-medium"
            >
              {showSuggestedMeaning ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
              {showSuggestedMeaning ? 'Ẩn gợi ý' : 'Hiện đáp án gợi ý'}
            </button>
          </div>

          <div className="flex items-center gap-2">
            <Input
              value={localMeaning}
              onChange={(e) => setLocalMeaning(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleSaveMeaning()
              }}
              onBlur={handleSaveMeaning}
              placeholder="Nhập nghĩa tiếng Việt bạn hiểu..."
              className="h-8.5 text-xs bg-background"
            />
            <Button
              size="sm"
              variant="secondary"
              onClick={handleSaveMeaning}
              className="h-8.5 text-xs shrink-0 px-2.5 gap-1"
              title="Lưu nghĩa lên Supabase"
            >
              <Save className="h-3.5 w-3.5" />
              Lưu
            </Button>
          </div>

          {showSuggestedMeaning && (
            <div className="pt-1.5 border-t border-border/40 text-xs text-muted-foreground flex items-start gap-1.5 animate-in fade-in duration-200">
              <span className="font-bold text-emerald-600 shrink-0">Đáp án chuẩn:</span>
              <span className="text-foreground font-medium">{item.meaning}</span>
            </div>
          )}
        </div>

        {/* 3. Section 2: Collocation & Question for Collocation Meaning */}
        <div className="bg-primary/5 rounded-xl p-3 border border-primary/20 space-y-2.5">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-primary bg-primary/10 px-2 py-0.5 rounded-md">
                Cụm từ (Collocation)
              </span>
              <span className="text-sm font-bold text-foreground font-mono">
                {item.collocation}
              </span>
              <button
                type="button"
                onClick={() => onSpeak(item.collocation)}
                className="text-muted-foreground hover:text-primary transition-colors"
                title="Nghe cụm từ"
              >
                <Volume2 className="h-3.5 w-3.5" />
              </button>
            </div>

            <button
              type="button"
              onClick={() => setShowSuggestedColloc(!showSuggestedColloc)}
              className="text-[11px] text-primary hover:underline flex items-center gap-1 font-medium"
            >
              {showSuggestedColloc ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
              {showSuggestedColloc ? 'Ẩn đáp án cụm' : 'Xem nghĩa cụm từ'}
            </button>
          </div>

          {/* Prompt Question: Hỏi nghĩa cụm từ */}
          <div className="space-y-1.5">
            <p className="text-xs font-semibold text-foreground flex items-center gap-1">
              <HelpCircle className="h-3.5 w-3.5 text-amber-500" />
              <span>Hỏi: Cụm từ &quot;{item.collocation}&quot; nghĩa tiếng Việt là gì?</span>
            </p>
            <div className="flex items-center gap-2">
              <Input
                value={localCollocMeaning}
                onChange={(e) => setLocalCollocMeaning(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleSaveCollocMeaning()
                }}
                onBlur={handleSaveCollocMeaning}
                placeholder="Gõ câu trả lời nghĩa của cụm từ này..."
                className="h-8.5 text-xs bg-background"
              />
              <Button
                size="sm"
                variant="secondary"
                onClick={handleSaveCollocMeaning}
                className="h-8.5 text-xs shrink-0 px-2.5 gap-1"
                title="Lưu câu trả lời lên Supabase"
              >
                <Save className="h-3.5 w-3.5" />
                Lưu
              </Button>
            </div>
          </div>

          {showSuggestedColloc && (
            <div className="pt-1.5 border-t border-primary/20 text-xs flex items-start gap-1.5 animate-in fade-in duration-200">
              <span className="font-bold text-primary shrink-0">Nghĩa của cụm từ:</span>
              <span className="text-foreground font-semibold">{item.collocation_meaning}</span>
            </div>
          )}
        </div>

        {/* 4. Section 3: Lưu sẵn 1 vài câu ví dụ theo cụm từ đó trên Supabase */}
        {item.example_sentences && item.example_sentences.length > 0 && (
          <div className="space-y-2 pt-1 border-t border-border/50">
            <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider block flex items-center gap-1">
              <Quote className="h-3 w-3 text-primary" />
              Câu ví dụ theo cụm từ (Lưu sẵn trên Supabase):
            </span>
            <div className="space-y-2">
              {item.example_sentences.map((sent, sIdx) => (
                <div
                  key={sIdx}
                  className="bg-muted/30 rounded-lg p-2.5 border border-border/40 text-xs space-y-1"
                >
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-foreground font-medium leading-relaxed">
                      {sent.en}
                    </p>
                    <button
                      type="button"
                      onClick={() => onSpeak(sent.en)}
                      className="text-muted-foreground hover:text-primary shrink-0 transition-colors pt-0.5"
                      title="Nghe câu ví dụ"
                    >
                      <Volume2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                  <p className="text-muted-foreground text-[11px] leading-relaxed">
                    {sent.vi}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </Card>
  )
}

export function ToeicWordBankView() {
  const {
    filteredWords,
    isLoading,
    selectedDay,
    setSelectedDay,
    filterMode,
    setFilterMode,
    searchQuery,
    setSearchQuery,
    totalCount,
    inFlashcardCount,
    masteredCount,
    userMeaningCount,
    updateUserMeaning,
    updateUserCollocationMeaning,
    toggleFlashcard,
    toggleMastered,
    speak,
  } = useToeicWordBank()

  return (
    <div className="space-y-6">
      {/* 1. Header Banner & Analytics */}
      <Card className="border-border/80 bg-linear-to-r from-card/90 via-card to-card/90 shadow-xs overflow-hidden">
        <div className="p-4 sm:p-6 space-y-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                <Badge variant="secondary" className="text-xs font-semibold px-2.5 py-0.5">
                  <Database className="h-3 w-3 mr-1 text-primary" />
                  Supabase Vocab Bank
                </Badge>
                <Badge variant="outline" className="text-xs font-bold px-2 py-0.5 text-amber-500 border-amber-500/30">
                  <Flame className="h-3 w-3 mr-1" />
                  TOEIC 750 – 990
                </Badge>
              </div>

              <h1 className="text-xl sm:text-2xl font-black tracking-tight text-foreground">
                Kho Từ Vựng Nâng Cao & Ít Phổ Thông
              </h1>
              <p className="text-xs sm:text-sm text-muted-foreground mt-1 max-w-2xl">
                Tự do nhập nghĩa tiếng Việt, trả lời câu hỏi nghĩa cụm từ (Collocations) lưu thẳng lên Supabase. Từ nào chưa biết, bấm{' '}
                <span className="font-bold text-amber-500">⭐ Thêm vào Flashcard</span> để đưa vào lộ trình học hàng ngày!
              </p>
            </div>

            {/* Quick stats summary */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 bg-muted/60 p-3 rounded-xl border border-border/60 shrink-0 text-center">
              <div className="px-2">
                <span className="text-lg font-black text-foreground block">{totalCount}</span>
                <span className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">
                  Tổng từ
                </span>
              </div>
              <div className="px-2 border-l border-border/60">
                <span className="text-lg font-black text-amber-500 block">{inFlashcardCount}</span>
                <span className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">
                  Flashcard
                </span>
              </div>
              <div className="px-2 border-l border-border/60">
                <span className="text-lg font-black text-emerald-500 block">{masteredCount}</span>
                <span className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">
                  Đã thuộc
                </span>
              </div>
              <div className="px-2 border-l border-border/60">
                <span className="text-lg font-black text-primary block">{userMeaningCount}</span>
                <span className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">
                  Đã tự nhập
                </span>
              </div>
            </div>
          </div>

          {/* 30 Days Selection Slider */}
          <div className="pt-3 border-t border-border/50 flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
            <span className="text-xs font-semibold text-muted-foreground shrink-0 mr-1 flex items-center gap-1">
              <Layers className="h-3.5 w-3.5" />
              Chọn ngày:
            </span>
            <button
              onClick={() => setSelectedDay('all')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold shrink-0 transition-all border ${
                selectedDay === 'all'
                  ? 'bg-primary text-primary-foreground border-primary font-bold shadow-xs'
                  : 'bg-background hover:bg-muted text-muted-foreground hover:text-foreground border-border/60'
              }`}
            >
              Tất cả các ngày
            </button>
            {Array.from({ length: 30 }, (_, i) => i + 1).map((d) => (
              <button
                key={d}
                onClick={() => setSelectedDay(d)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium shrink-0 transition-all border ${
                  selectedDay === d
                    ? 'bg-primary text-primary-foreground border-primary font-bold shadow-xs'
                    : 'bg-background hover:bg-muted text-muted-foreground hover:text-foreground border-border/60'
                }`}
              >
                Ngày {d}
              </button>
            ))}
          </div>
        </div>
      </Card>

      {/* 2. Search & Filter Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        {/* Search Input */}
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Tìm từ vựng, nghĩa, cụm từ..."
            className="pl-9 h-9 text-xs bg-card"
          />
        </div>

        {/* Status Filter Buttons */}
        <div className="inline-flex rounded-xl bg-muted p-1 border border-border/60 w-full sm:w-auto overflow-x-auto">
          <button
            onClick={() => setFilterMode('all')}
            className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all shrink-0 ${
              filterMode === 'all'
                ? 'bg-background text-foreground shadow-xs'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            Tất cả ({totalCount})
          </button>
          <button
            onClick={() => setFilterMode('not_in_flashcard')}
            className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all shrink-0 ${
              filterMode === 'not_in_flashcard'
                ? 'bg-background text-foreground shadow-xs'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            Từ chưa biết / Chưa lưu
          </button>
          <button
            onClick={() => setFilterMode('in_flashcard')}
            className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all shrink-0 flex items-center gap-1 ${
              filterMode === 'in_flashcard'
                ? 'bg-amber-500 text-white font-bold shadow-xs'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <Star className="h-3 w-3 fill-current" />
            Trong Flashcard ({inFlashcardCount})
          </button>
          <button
            onClick={() => setFilterMode('mastered')}
            className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all shrink-0 flex items-center gap-1 ${
              filterMode === 'mastered'
                ? 'bg-emerald-500 text-white font-bold shadow-xs'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <Check className="h-3 w-3" />
            Đã thuộc ({masteredCount})
          </button>
        </div>
      </div>

      {/* 3. Word Cards Grid */}
      {isLoading ? (
        <div className="py-16 text-center space-y-3">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs text-muted-foreground font-medium">
            Đang tải kho từ vựng từ Supabase...
          </p>
        </div>
      ) : filteredWords.length === 0 ? (
        <Card className="p-12 text-center border-dashed border-border/80">
          <BookOpen className="h-10 w-10 text-muted-foreground/60 mx-auto mb-3" />
          <h3 className="text-base font-bold text-foreground">Không tìm thấy từ vựng nào</h3>
          <p className="text-xs text-muted-foreground mt-1 max-w-sm mx-auto">
            Hãy thử thay đổi từ khóa tìm kiếm hoặc chuyển sang ngày/bộ lọc khác.
          </p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredWords.map((item) => (
            <ToeicWordCard
              key={item.id}
              item={item}
              onSaveMeaning={(id, meaning) => updateUserMeaning({ id, user_meaning: meaning })}
              onSaveCollocMeaning={(id, meaning) =>
                updateUserCollocationMeaning({ id, user_collocation_meaning: meaning })
              }
              onToggleFlashcard={toggleFlashcard}
              onToggleMastered={toggleMastered}
              onSpeak={speak}
            />
          ))}
        </div>
      )}
    </div>
  )
}
