import { useState, useEffect } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import {
  ClipboardCheck,
  CheckCircle2,
  AlertCircle,
  Calendar,
  Flame,
  ArrowRight,
  Archive,
  XCircle,
  Save,
} from 'lucide-react'
import type { Task, TodoDailyReview } from '@/types'

interface DailyReviewModalProps {
  isOpen: boolean
  onClose: () => void
  tasks: Task[]
  existingReview: TodoDailyReview | null
  onSaveDailyReview: (data: {
    accomplishments: string
    carry_over_notes: string
    carryOverActions?: Record<string, 'tomorrow' | 'backlog' | 'cancel'>
  }) => Promise<any>
}

export function DailyReviewModal({
  isOpen,
  onClose,
  tasks,
  existingReview,
  onSaveDailyReview,
}: DailyReviewModalProps) {
  const [accomplishments, setAccomplishments] = useState('')
  const [carryOverNotes, setCarryOverNotes] = useState('')
  const [carryOverActions, setCarryOverActions] = useState<
    Record<string, 'tomorrow' | 'backlog' | 'cancel'>
  >({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Calculations for Today summary
  const priorityTasks = tasks.filter((t) => t.is_today_priority)
  const priorityCount = priorityTasks.length
  const priorityCompletedCount = priorityTasks.filter((t) => t.status === 'DONE').length

  const completedTasks = tasks.filter((t) => t.status === 'DONE')
  const incompleteTasks = tasks.filter((t) => t.status !== 'DONE')

  useEffect(() => {
    if (existingReview) {
      setAccomplishments(existingReview.accomplishments || '')
      setCarryOverNotes(existingReview.carry_over_notes || '')
    } else {
      // Prepopulate accomplishments summary if empty
      const doneTitles = completedTasks.map((t) => `• ${t.title}`).join('\n')
      setAccomplishments(doneTitles ? `Hôm nay đã hoàn thành:\n${doneTitles}` : '')
      setCarryOverNotes('')
    }

    // Default carry-over actions for incomplete tasks
    const initialActions: Record<string, 'tomorrow' | 'backlog' | 'cancel'> = {}
    incompleteTasks.forEach((t) => {
      initialActions[t.id] = 'tomorrow'
    })
    setCarryOverActions(initialActions)
  }, [existingReview, isOpen])

  const handleActionChange = (
    taskId: string,
    action: 'tomorrow' | 'backlog' | 'cancel'
  ) => {
    setCarryOverActions((prev) => ({
      ...prev,
      [taskId]: action,
    }))
  }

  const handleSave = async () => {
    setIsSubmitting(true)
    try {
      await onSaveDailyReview({
        accomplishments,
        carry_over_notes: carryOverNotes,
        carryOverActions,
      })
      onClose()
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto p-4 sm:p-6">
        <DialogHeader className="border-b border-border/50 pb-3">
          <div className="flex items-center space-x-2">
            <div className="p-1.5 rounded-lg bg-primary/10 text-primary">
              <ClipboardCheck className="h-5 w-5" />
            </div>
            <div>
              <DialogTitle className="text-base sm:text-lg font-bold">
                Daily Review — Tổng kết cuối ngày
              </DialogTitle>
              <DialogDescription className="text-xs">
                Đánh giá kết quả đã làm, giữ tính kỷ luật và sắp xếp việc cho ngày mai.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-5 py-2">
          {/* 1. TODAY STATS SUMMARY */}
          <div className="p-4 rounded-xl bg-muted/30 border border-border/60">
            <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3">
              TODAY STATS
            </h4>

            <div className="grid grid-cols-3 gap-3 text-center">
              <div className="p-2.5 rounded-lg bg-card border border-border/50">
                <div className="flex items-center justify-center text-amber-500 mb-1">
                  <Flame className="h-4 w-4 mr-1" />
                  <span className="text-xs font-semibold">Priority</span>
                </div>
                <p className="text-lg font-bold">
                  {priorityCompletedCount} <span className="text-xs text-muted-foreground">/ {priorityCount}</span>
                </p>
                <p className="text-[10px] text-muted-foreground">việc ưu tiên</p>
              </div>

              <div className="p-2.5 rounded-lg bg-card border border-border/50">
                <div className="flex items-center justify-center text-emerald-500 mb-1">
                  <CheckCircle2 className="h-4 w-4 mr-1" />
                  <span className="text-xs font-semibold">Completed</span>
                </div>
                <p className="text-lg font-bold text-emerald-600 dark:text-emerald-400">
                  {completedTasks.length}
                </p>
                <p className="text-[10px] text-muted-foreground">đã hoàn tất</p>
              </div>

              <div className="p-2.5 rounded-lg bg-card border border-border/50">
                <div className="flex items-center justify-center text-rose-500 mb-1">
                  <AlertCircle className="h-4 w-4 mr-1" />
                  <span className="text-xs font-semibold">Incomplete</span>
                </div>
                <p className="text-lg font-bold text-foreground">
                  {incompleteTasks.length}
                </p>
                <p className="text-[10px] text-muted-foreground">cần xử lý</p>
              </div>
            </div>
          </div>

          {/* 2. WHAT DID YOU ACCOMPLISH? */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
              <span>What did you accomplish?</span>
              <span className="text-muted-foreground font-normal">(Hôm nay bạn đã làm được gì?)</span>
            </label>
            <Textarea
              value={accomplishments}
              onChange={(e) => setAccomplishments(e.target.value)}
              placeholder="Ghi nhận thành tựu, các công việc cốt lõi đã giải quyết..."
              className="text-xs min-h-[75px]"
            />
          </div>

          {/* 3. WHAT SHOULD CONTINUE TOMORROW? */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
              <span>What should continue tomorrow?</span>
              <span className="text-muted-foreground font-normal">(Điều gì cần tiếp tục ngày mai?)</span>
            </label>
            <Textarea
              value={carryOverNotes}
              onChange={(e) => setCarryOverNotes(e.target.value)}
              placeholder="Ghi chú kế hoạch trọng tâm cho ngày mai..."
              className="text-xs min-h-[60px]"
            />
          </div>

          {/* 4. INCOMPLETE TASKS ACTION PLAN */}
          {incompleteTasks.length > 0 && (
            <div className="space-y-2 p-3.5 rounded-xl border border-border/70 bg-card">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold text-foreground">
                  Xử lý task chưa hoàn thành ({incompleteTasks.length})
                </h4>
                <span className="text-[10px] text-muted-foreground">
                  Chọn hành động cụ thể cho từng việc
                </span>
              </div>

              <div className="space-y-2 max-h-56 overflow-y-auto pr-1 pt-1 divide-y divide-border/40">
                {incompleteTasks.map((task) => (
                  <div
                    key={task.id}
                    className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-2"
                  >
                    <div className="min-w-0 flex-1 mr-2">
                      <p className="text-xs font-medium text-foreground truncate">
                        {task.title}
                      </p>
                      {task.is_today_priority && (
                        <Badge variant="outline" className="text-[9px] px-1 py-0 h-4 border-amber-500/40 text-amber-500">
                          Priority
                        </Badge>
                      )}
                    </div>

                    <div className="flex items-center space-x-1.5 flex-shrink-0">
                      <Button
                        type="button"
                        size="sm"
                        variant={carryOverActions[task.id] === 'tomorrow' ? 'default' : 'outline'}
                        onClick={() => handleActionChange(task.id, 'tomorrow')}
                        className="h-7 text-[10px] px-2 rounded-lg"
                      >
                        <ArrowRight className="h-3 w-3 mr-1" />
                        Chuyển ngày mai
                      </Button>

                      <Button
                        type="button"
                        size="sm"
                        variant={carryOverActions[task.id] === 'backlog' ? 'default' : 'outline'}
                        onClick={() => handleActionChange(task.id, 'backlog')}
                        className="h-7 text-[10px] px-2 rounded-lg"
                      >
                        <Archive className="h-3 w-3 mr-1" />
                        Backlog
                      </Button>

                      <Button
                        type="button"
                        size="sm"
                        variant={carryOverActions[task.id] === 'cancel' ? 'destructive' : 'ghost'}
                        onClick={() => handleActionChange(task.id, 'cancel')}
                        className="h-7 text-[10px] px-2 rounded-lg"
                      >
                        <XCircle className="h-3 w-3 mr-1" />
                        Hủy
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer actions */}
        <div className="flex items-center justify-end space-x-2 pt-3 border-t border-border/50">
          <Button variant="outline" size="sm" onClick={onClose} className="text-xs">
            Đóng
          </Button>
          <Button
            size="sm"
            onClick={handleSave}
            disabled={isSubmitting}
            className="text-xs bg-primary hover:bg-primary/90"
          >
            <Save className="h-3.5 w-3.5 mr-1" />
            Lưu Daily Review
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
