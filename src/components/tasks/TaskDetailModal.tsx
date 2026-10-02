import { useState, useEffect } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Play,
  CheckCircle2,
  Circle,
  Eye,
  Sparkles,
  Plus,
  Trash2,
  CheckSquare,
  Flame,
} from 'lucide-react'
import type { Task, TaskStatus } from '@/types'
import { formatTimeAgo, formatCompletedAt, formatDate } from '@/lib/date'
import { TaskWorkflowBadge } from './TaskWorkflowBadge'

interface TaskDetailModalProps {
  task: Task | null
  isOpen: boolean
  onClose: () => void
  onUpdateTask: (taskId: string, updates: Partial<Task>) => Promise<any>
  onUpdateStatus: (taskId: string, status: TaskStatus, extra?: { review_note?: string }) => Promise<any>
  onStartTask: (taskId: string) => Promise<any>
  onReviewTask: (taskId: string, reviewNote: string) => Promise<any>
  onTogglePriority: (taskId: string, currentIsPriority: boolean) => Promise<any>
  onAddDefinitionItem: (taskId: string, title: string) => Promise<any>
  onToggleDefinitionItem: (itemId: string, currentCompleted: boolean) => Promise<any>
  onDeleteDefinitionItem: (itemId: string) => Promise<any>
  onOpenFocusMode: (task: Task) => void
  onDeleteTask: (taskId: string) => Promise<any>
}

export function TaskDetailModal({
  task,
  isOpen,
  onClose,
  onUpdateTask,
  onUpdateStatus,
  onStartTask,
  onReviewTask,
  onTogglePriority,
  onAddDefinitionItem,
  onToggleDefinitionItem,
  onDeleteDefinitionItem,
  onOpenFocusMode,
  onDeleteTask,
}: TaskDetailModalProps) {
  const [title, setTitle] = useState(task?.title || '')
  const [description, setDescription] = useState(task?.description || '')
  const [successCriteria, setSuccessCriteria] = useState(task?.success_criteria || '')
  const [priority, setPriority] = useState<number>(task?.priority || 2)
  const [dueDate, setDueDate] = useState(task?.due_date || '')
  const [category, setCategory] = useState(task?.category || '')
  const [newDodTitle, setNewDodTitle] = useState('')

  // Review step form
  const [isReviewFormOpen, setIsReviewFormOpen] = useState(false)
  const [accomplishedNote, setAccomplishedNote] = useState('')
  const [remainingNote, setRemainingNote] = useState('')
  const [isEverythingComplete, setIsEverythingComplete] = useState(false)

  // Sync state when task changes
  useEffect(() => {
    if (!task) return
    setTitle(task.title)
    setDescription(task.description || '')
    setSuccessCriteria(task.success_criteria || '')
    setPriority(task.priority)
    setDueDate(task.due_date || '')
    setCategory(task.category || '')
    setIsReviewFormOpen(task.status === 'REVIEW')
    setAccomplishedNote(task.review_note || '')
    setRemainingNote('')
    setIsEverythingComplete(false)
  }, [task])

  if (!task) return null

  const dodItems = task.definition_items || []
  const dodTotal = dodItems.length
  const dodCompletedCount = dodItems.filter((i) => i.is_completed).length
  const isDoDFullyMet = dodTotal > 0 && dodCompletedCount === dodTotal

  const handleSaveBasic = async () => {
    await onUpdateTask(task.id, {
      title: title.trim() || task.title,
      description: description.trim() || null,
      success_criteria: successCriteria.trim() || null,
      priority: priority as 1 | 2 | 3,
      due_date: dueDate || null,
      category: category.trim() || null,
    })
  }

  const handleAddDod = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newDodTitle.trim()) return
    await onAddDefinitionItem(task.id, newDodTitle.trim())
    setNewDodTitle('')
  }

  const handleFinishReviewAndComplete = async () => {
    const combinedReview = [
      accomplishedNote.trim() ? `Accomplished: ${accomplishedNote.trim()}` : '',
      remainingNote.trim() ? `Remaining: ${remainingNote.trim()}` : '',
    ]
      .filter(Boolean)
      .join('\n')

    await onReviewTask(task.id, combinedReview)
    setIsReviewFormOpen(false)
    onClose()
  }

  const handleForceComplete = async () => {
    await onUpdateStatus(task.id, 'DONE')
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto p-4 sm:p-6">
        <DialogHeader className="space-y-2 pb-2 border-b border-border/50">
          <div className="flex items-center justify-between gap-2 flex-wrap">
            <div className="flex items-center space-x-2">
              <TaskWorkflowBadge status={task.status} />
              <Badge
                variant={
                  task.priority === 1
                    ? 'destructive'
                    : task.priority === 2
                    ? 'warning'
                    : 'secondary'
                }
                className="text-[10px] h-5"
              >
                {task.priority === 1 ? 'High' : task.priority === 2 ? 'Medium' : 'Low'}
              </Badge>
            </div>

            <div className="flex items-center space-x-2">
              <Button
                variant={task.is_today_priority ? 'default' : 'outline'}
                size="sm"
                onClick={() => onTogglePriority(task.id, task.is_today_priority)}
                className={`h-7 text-xs px-2.5 rounded-lg ${
                  task.is_today_priority ? 'bg-amber-500 hover:bg-amber-600 text-white' : ''
                }`}
              >
                <Flame className="h-3 w-3 mr-1" />
                {task.is_today_priority ? "Today's Focus" : 'Set Priority'}
              </Button>

              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  onClose()
                  onOpenFocusMode(task)
                }}
                className="h-7 text-xs px-2.5 rounded-lg"
              >
                <Sparkles className="h-3 w-3 mr-1 text-primary" />
                Focus
              </Button>
            </div>
          </div>

          {/* Title input */}
          <Input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onBlur={handleSaveBasic}
            className="text-base sm:text-lg font-bold border-transparent hover:border-input focus:border-input bg-transparent px-1 py-0 h-auto"
            placeholder="Tên công việc..."
          />
        </DialogHeader>

        <div className="space-y-5 py-2">
          {/* 1. WORKFLOW STATE ACTIONS (TODO -> IN_PROGRESS -> REVIEW -> DONE) */}
          <div className="p-3 rounded-xl bg-muted/40 border border-border/60 space-y-2">
            <div className="flex items-center justify-between text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              <span>Workflow Transition</span>
              {task.status === 'IN_PROGRESS' && task.started_at && (
                <span className="text-blue-600 dark:text-blue-400 font-mono lowercase normal-case">
                  started {formatTimeAgo(task.started_at)}
                </span>
              )}
              {task.status === 'DONE' && task.completed_at && (
                <span className="text-emerald-600 dark:text-emerald-400 font-mono lowercase normal-case">
                  {formatCompletedAt(task.completed_at)}
                </span>
              )}
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <Button
                variant={task.status === 'TODO' ? 'default' : 'outline'}
                size="sm"
                onClick={() => onUpdateStatus(task.id, 'TODO')}
                className="h-8 text-xs justify-start px-2"
              >
                <Circle className="h-3.5 w-3.5 mr-1 text-muted-foreground" />
                TODO
              </Button>

              <Button
                variant={task.status === 'IN_PROGRESS' ? 'default' : 'outline'}
                size="sm"
                onClick={() => onStartTask(task.id)}
                className={`h-8 text-xs justify-start px-2 ${
                  task.status === 'IN_PROGRESS' ? 'bg-blue-600 hover:bg-blue-700 text-white' : ''
                }`}
              >
                <Play className="h-3.5 w-3.5 mr-1 fill-current" />
                IN PROGRESS
              </Button>

              <Button
                variant={task.status === 'REVIEW' ? 'default' : 'outline'}
                size="sm"
                onClick={() => {
                  onUpdateStatus(task.id, 'REVIEW')
                  setIsReviewFormOpen(true)
                }}
                className={`h-8 text-xs justify-start px-2 ${
                  task.status === 'REVIEW' ? 'bg-amber-600 hover:bg-amber-700 text-white' : ''
                }`}
              >
                <Eye className="h-3.5 w-3.5 mr-1" />
                REVIEW
              </Button>

              <Button
                variant={task.status === 'DONE' ? 'default' : 'outline'}
                size="sm"
                onClick={handleForceComplete}
                className={`h-8 text-xs justify-start px-2 ${
                  task.status === 'DONE' ? 'bg-emerald-600 hover:bg-emerald-700 text-white' : ''
                }`}
              >
                <CheckCircle2 className="h-3.5 w-3.5 mr-1" />
                DONE
              </Button>
            </div>
          </div>

          {/* 2. PLAN SECTION: «What does "done" look like?» */}
          <div className="space-y-1.5 p-3 rounded-xl border border-border/70 bg-card">
            <div className="flex items-center space-x-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-primary px-1.5 py-0.5 rounded bg-primary/10">
                PLAN
              </span>
              <label className="text-xs font-semibold text-foreground">
                What does &quot;done&quot; look like?
              </label>
            </div>
            <Input
              value={successCriteria}
              onChange={(e) => setSuccessCriteria(e.target.value)}
              onBlur={handleSaveBasic}
              placeholder="VD: Hoàn thành giao diện responsive và không còn console error..."
              className="text-xs italic bg-background/50 h-9"
            />
            <p className="text-[10px] text-muted-foreground">
              Mô tả kết quả mong muốn rõ ràng để tránh làm lan man hoặc xong dở dang.
            </p>
          </div>

          {/* 3. DEFINITION OF DONE CHECKLIST */}
          <div className="space-y-2 p-3 rounded-xl border border-border/70 bg-card">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <CheckSquare className="h-4 w-4 text-primary" />
                <span className="text-xs font-semibold">Definition of Done</span>
              </div>

              {dodTotal > 0 && (
                <Badge
                  variant={isDoDFullyMet ? 'success' : 'outline'}
                  className="text-[10px] font-mono px-2 py-0.5"
                >
                  {isDoDFullyMet ? 'READY TO COMPLETE' : `${dodCompletedCount}/${dodTotal}`}
                </Badge>
              )}
            </div>

            {/* List of DoD items */}
            <div className="space-y-1.5 pt-1">
              {dodItems.length === 0 ? (
                <p className="text-xs text-muted-foreground italic py-1">
                  Chưa có tiêu chí Definition of Done nào. Hãy thêm tiêu chí bên dưới!
                </p>
              ) : (
                dodItems.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between p-2 rounded-lg bg-muted/40 hover:bg-muted/70 text-xs transition-colors group"
                  >
                    <div className="flex items-center space-x-2.5 flex-1 min-w-0">
                      <Checkbox
                        checked={item.is_completed}
                        onCheckedChange={() => onToggleDefinitionItem(item.id, item.is_completed)}
                        className="h-4 w-4"
                      />
                      <span
                        className={`truncate ${
                          item.is_completed
                            ? 'line-through text-muted-foreground opacity-60'
                            : 'text-foreground font-medium'
                        }`}
                      >
                        {item.title}
                      </span>
                    </div>

                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onDeleteDefinitionItem(item.id)}
                      className="h-6 w-6 text-muted-foreground hover:text-destructive opacity-40 group-hover:opacity-100"
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                ))
              )}

              {/* Add item input */}
              <form onSubmit={handleAddDod} className="flex gap-2 pt-1">
                <Input
                  value={newDodTitle}
                  onChange={(e) => setNewDodTitle(e.target.value)}
                  placeholder="Thêm tiêu chí (VD: Test responsive, Không còn error)..."
                  className="text-xs h-8"
                />
                <Button type="submit" size="sm" variant="outline" className="h-8 text-xs px-2.5">
                  <Plus className="h-3.5 w-3.5 mr-1" /> Thêm
                </Button>
              </form>
            </div>
          </div>

          {/* 4. REVIEW FORM (Khi người dùng review hoặc task ở status REVIEW) */}
          {(isReviewFormOpen || task.status === 'REVIEW') && (
            <div className="p-3.5 rounded-xl border border-amber-500/30 bg-amber-500/[0.04] space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400 px-1.5 py-0.5 rounded bg-amber-500/10">
                    REVIEW
                  </span>
                  <h4 className="text-xs font-bold text-foreground">REVIEW TASK</h4>
                </div>
              </div>

              <div className="space-y-2">
                <div className="space-y-1">
                  <label className="text-[11px] font-medium text-muted-foreground">
                    What was accomplished?
                  </label>
                  <Textarea
                    value={accomplishedNote}
                    onChange={(e) => setAccomplishedNote(e.target.value)}
                    placeholder="Mô tả công việc đã hoàn thành được..."
                    className="text-xs min-h-[60px] bg-background/80"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-medium text-muted-foreground">
                    Anything remaining?
                  </label>
                  <Input
                    value={remainingNote}
                    onChange={(e) => setRemainingNote(e.target.value)}
                    placeholder="Có việc gì tồn đọng hoặc cần theo dõi thêm không?"
                    className="text-xs bg-background/80 h-8"
                  />
                </div>

                <div className="flex items-center space-x-2 pt-1">
                  <Checkbox
                    id="everything-complete"
                    checked={isEverythingComplete}
                    onCheckedChange={(checked) => setIsEverythingComplete(Boolean(checked))}
                  />
                  <label
                    htmlFor="everything-complete"
                    className="text-xs font-medium cursor-pointer select-none"
                  >
                    Everything is complete
                  </label>
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <Button
                    size="sm"
                    onClick={handleFinishReviewAndComplete}
                    disabled={!isEverythingComplete}
                    className="text-xs bg-emerald-600 hover:bg-emerald-700 text-white"
                  >
                    <CheckCircle2 className="h-3.5 w-3.5 mr-1" />
                    Mark as Done
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* 5. METADATA: Priority, Due Date, Category */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-medium text-muted-foreground">Độ ưu tiên</label>
              <select
                value={priority}
                onChange={(e) => {
                  const val = Number(e.target.value) as 1 | 2 | 3
                  setPriority(val)
                  onUpdateTask(task.id, { priority: val })
                }}
                className="w-full h-8 rounded-lg border border-input bg-background/80 px-2.5 text-xs"
              >
                <option value={1}>High (Cao)</option>
                <option value={2}>Medium (Trung bình)</option>
                <option value={3}>Low (Thấp)</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-medium text-muted-foreground">Hạn hoàn thành</label>
              <Input
                type="date"
                value={dueDate}
                onChange={(e) => {
                  setDueDate(e.target.value)
                  onUpdateTask(task.id, { due_date: e.target.value || null })
                }}
                className="h-8 text-xs"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-medium text-muted-foreground">Category / Tag</label>
              <Input
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                onBlur={handleSaveBasic}
                placeholder="VD: Dev, Finance..."
                className="h-8 text-xs"
              />
            </div>
          </div>

          {/* 6. DESCRIPTION */}
          <div className="space-y-1">
            <label className="text-xs font-medium text-muted-foreground">Mô tả chi tiết</label>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              onBlur={handleSaveBasic}
              placeholder="Chi tiết nội dung cần làm..."
              className="text-xs min-h-[70px]"
            />
          </div>

          {/* 7. ACTIVITY / TIMESTAMPS */}
          <div className="pt-2 border-t border-border/40 text-[11px] text-muted-foreground flex flex-wrap gap-x-4 gap-y-1">
            <span>Tạo lúc: {formatDate(task.created_at, 'dd/MM/yyyy HH:mm')}</span>
            {task.started_at && <span>Bắt đầu: {formatDate(task.started_at, 'dd/MM/yyyy HH:mm')}</span>}
            {task.completed_at && (
              <span className="text-emerald-600 dark:text-emerald-400 font-medium">
                Hoàn thành: {formatDate(task.completed_at, 'dd/MM/yyyy HH:mm')}
              </span>
            )}
          </div>
        </div>

        {/* Footer actions */}
        <div className="flex items-center justify-between pt-3 border-t border-border/50">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              onDeleteTask(task.id)
              onClose()
            }}
            className="text-xs text-destructive hover:bg-destructive/10"
          >
            <Trash2 className="h-3.5 w-3.5 mr-1" />
            Xóa task
          </Button>

          <Button variant="default" size="sm" onClick={onClose} className="text-xs">
            Đóng
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
