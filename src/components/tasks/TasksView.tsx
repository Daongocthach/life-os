import { useState, useEffect, useMemo } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import {
  Plus,
  Trash2,
  Search,
  Zap,
  ClipboardCheck,
  Flame,
  X,
  ListTodo,
} from 'lucide-react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { useTasks } from '@/hooks/useTasks'
import { useI18n } from '@/hooks/useI18n'
import { useConfirm } from '@/hooks/useConfirm'
import { taskSchema, type TaskFormValues } from '@/schemas/taskSchema'
import { format } from 'date-fns'
import type { Task } from '@/types'

import { TodaysFocusSection } from './TodaysFocusSection'
import { TaskItemRow } from './TaskItemRow'
import { TaskDetailModal } from './TaskDetailModal'
import { ParkingLotSection } from './ParkingLotSection'
import { FocusModeOverlay } from './FocusModeOverlay'
import { DailyReviewModal } from './DailyReviewModal'
import { QuickCaptureModal } from './QuickCaptureModal'

type FilterType = 'all' | 'today' | 'priority' | 'in_progress' | 'review' | 'done'

export function TasksView() {
  const { t } = useI18n()
  const confirm = useConfirm()
  const {
    tasks,
    ideas,
    dailyReview,
    addTask,
    updateTask,
    deleteTask,
    toggleTask,
    updateTaskStatus,
    startTask,
    reviewTask,
    toggleTodayPriority,
    addDefinitionItem,
    toggleDefinitionItem,
    deleteDefinitionItem,
    addIdea,
    updateIdea,
    discardIdea,
    deleteIdea,
    convertIdeaToTask,
    saveDailyReview,
  } = useTasks()

  // UI state
  const [filter, setFilter] = useState<FilterType>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [isAddTaskOpen, setIsAddTaskOpen] = useState(false)
  const [isQuickCaptureOpen, setIsQuickCaptureOpen] = useState(false)
  const [isDailyReviewOpen, setIsDailyReviewOpen] = useState(false)
  const [selectedTask, setSelectedTask] = useState<Task | null>(null)
  const [focusingTask, setFocusingTask] = useState<Task | null>(null)

  // Add Task DoD items state in creation dialog
  const [enableDoD, setEnableDoD] = useState(false)
  const [dodItems, setDodItems] = useState<string[]>([])
  const [newDodItem, setNewDodItem] = useState('')

  const todayStr = format(new Date(), 'yyyy-MM-dd')

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm<TaskFormValues>({
    resolver: zodResolver(taskSchema),
    defaultValues: {
      title: '',
      description: '',
      priority: 2,
      due_date: todayStr,
      success_criteria: '',
      is_today_priority: false,
    },
  })

  // Keyboard shortcuts (N -> New Task, I -> Quick Idea, F -> Focus, D -> Today)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger if user is typing in an input, textarea, or contentEditable
      const target = e.target as HTMLElement
      if (
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.tagName === 'SELECT' ||
        target.isContentEditable
      ) {
        return
      }

      // Ignore if modifier keys are pressed
      if (e.metaKey || e.ctrlKey || e.altKey) return

      if (e.key === 'n' || e.key === 'N') {
        e.preventDefault()
        setIsAddTaskOpen(true)
      } else if (e.key === 'i' || e.key === 'I') {
        e.preventDefault()
        setIsQuickCaptureOpen(true)
      } else if (e.key === 'f' || e.key === 'F') {
        e.preventDefault()
        // Focus on active in-progress task or first priority task
        const activeTask =
          tasks.find((t) => t.status === 'IN_PROGRESS') ||
          tasks.find((t) => t.is_today_priority && t.status !== 'DONE') ||
          tasks.find((t) => t.status !== 'DONE')
        if (activeTask) {
          setFocusingTask(activeTask)
        }
      } else if (e.key === 'd' || e.key === 'D') {
        e.preventDefault()
        setFilter((prev) => (prev === 'today' ? 'all' : 'today'))
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [tasks])

  // Keep selectedTask and focusingTask fresh when tasks array updates
  useEffect(() => {
    if (selectedTask) {
      const updated = tasks.find((t) => t.id === selectedTask.id)
      if (updated) setSelectedTask(updated)
    }
    if (focusingTask) {
      const updated = tasks.find((t) => t.id === focusingTask.id)
      if (updated) setFocusingTask(updated)
    }
  }, [tasks])

  const onTaskSubmit = async (values: TaskFormValues) => {
    await addTask({
      ...values,
      initialDefinitionItems: enableDoD ? dodItems : undefined,
    })
    reset()
    setDodItems([])
    setEnableDoD(false)
    setIsAddTaskOpen(false)
  }

  const handleAddDodItem = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newDodItem.trim()) return
    setDodItems((prev) => [...prev, newDodItem.trim()])
    setNewDodItem('')
  }

  const handleRemoveDodItem = (index: number) => {
    setDodItems((prev) => prev.filter((_, i) => i !== index))
  }

  const handleDelete = async (id: string, title: string) => {
    const ok = await confirm({
      title: t.tasks.confirmDelete,
      description: `Công việc "${title}" sẽ bị xóa vĩnh viễn.`,
      variant: 'destructive',
      confirmText: t.common.delete,
      cancelText: t.common.cancel,
    })
    if (ok) {
      await deleteTask(id)
      if (selectedTask?.id === id) setSelectedTask(null)
      if (focusingTask?.id === id) setFocusingTask(null)
    }
  }

  // Filter & search logic
  const filteredTasks = useMemo(() => {
    return tasks.filter((task) => {
      // 1. Search filter
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase().trim()
        const matchesTitle = task.title.toLowerCase().includes(query)
        const matchesDesc = task.description?.toLowerCase().includes(query)
        const matchesCriteria = task.success_criteria?.toLowerCase().includes(query)
        const matchesCategory = task.category?.toLowerCase().includes(query)
        if (!matchesTitle && !matchesDesc && !matchesCriteria && !matchesCategory) {
          return false
        }
      }

      // 2. Status / Category filters
      switch (filter) {
        case 'today':
          return !task.is_completed && (!task.due_date || task.due_date <= todayStr)
        case 'priority':
          return task.is_today_priority
        case 'in_progress':
          return task.status === 'IN_PROGRESS'
        case 'review':
          return task.status === 'REVIEW'
        case 'done':
          return task.status === 'DONE'
        case 'all':
        default:
          return true
      }
    })
  }, [tasks, filter, searchQuery, todayStr])

  return (
    <div className="space-y-6 pb-24">
      {/* 1. Header with Title & Action Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight">{t.tasks.title}</h1>
            <Badge variant="outline" className="text-[10px] font-mono">
              PLAN → DO → REVIEW → DONE
            </Badge>
          </div>
          <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
            {t.tasks.subtitle}
          </p>
        </div>

        {/* Action Toolbar */}
        <div className="flex items-center space-x-2 flex-wrap gap-y-2">
          {/* Quick Capture */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsQuickCaptureOpen(true)}
            className="text-xs h-8 px-2.5 rounded-lg border-primary/20 hover:bg-primary/5"
            title="Ghi nhanh task hoặc idea (I)"
          >
            <Zap className="h-3.5 w-3.5 mr-1 text-primary" />
            Quick Capture
          </Button>

          {/* Daily Review */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsDailyReviewOpen(true)}
            className="text-xs h-8 px-2.5 rounded-lg border-primary/20 hover:bg-primary/5"
            title="Đánh giá tổng kết cuối ngày"
          >
            <ClipboardCheck className="h-3.5 w-3.5 mr-1 text-amber-500" />
            Daily Review
          </Button>

          {/* Add Task */}
          <Button
            size="sm"
            onClick={() => setIsAddTaskOpen(true)}
            className="text-xs h-8 px-3 rounded-lg"
            title="Tạo công việc mới (N)"
          >
            <Plus className="h-3.5 w-3.5 mr-1" />
            {t.tasks.addTask}
          </Button>
        </div>
      </div>

      {/* 2. TODAY'S FOCUS SECTION (UP TO 3 TASKS) */}
      <TodaysFocusSection
        tasks={tasks}
        onToggleTask={toggleTask}
        onTogglePriority={toggleTodayPriority}
        onSelectTask={setSelectedTask}
        onStartTask={startTask}
        onOpenFocusMode={setFocusingTask}
        onQuickAddTask={() => setIsAddTaskOpen(true)}
      />

      {/* 3. Filter & Search Controls */}
      <div className="space-y-3">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5">
          {/* Filter Pills */}
          <div className="flex items-center space-x-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
            <Button
              variant={filter === 'all' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilter('all')}
              className="text-xs h-7 px-2.5 rounded-lg"
            >
              All ({tasks.length})
            </Button>

            <Button
              variant={filter === 'today' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilter('today')}
              className="text-xs h-7 px-2.5 rounded-lg"
              title="Shortcut: D"
            >
              Today ({tasks.filter((t) => !t.is_completed && (!t.due_date || t.due_date <= todayStr)).length})
            </Button>

            <Button
              variant={filter === 'priority' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilter('priority')}
              className="text-xs h-7 px-2.5 rounded-lg"
            >
              <Flame className="h-3 w-3 mr-1 text-amber-500" />
              Priority ({tasks.filter((t) => t.is_today_priority).length})
            </Button>

            <Button
              variant={filter === 'in_progress' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilter('in_progress')}
              className="text-xs h-7 px-2.5 rounded-lg"
            >
              In Progress ({tasks.filter((t) => t.status === 'IN_PROGRESS').length})
            </Button>

            <Button
              variant={filter === 'review' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilter('review')}
              className="text-xs h-7 px-2.5 rounded-lg"
            >
              Review ({tasks.filter((t) => t.status === 'REVIEW').length})
            </Button>

            <Button
              variant={filter === 'done' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilter('done')}
              className="text-xs h-7 px-2.5 rounded-lg"
            >
              Done ({tasks.filter((t) => t.status === 'DONE').length})
            </Button>
          </div>

          {/* Search bar */}
          <div className="relative w-full sm:w-56">
            <Search className="h-3.5 w-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Tìm kiếm task..."
              className="h-8 pl-8 pr-7 text-xs rounded-lg"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                <X className="h-3 w-3" />
              </button>
            )}
          </div>
        </div>

        {/* 4. ALL TASKS LIST */}
        <Card className="border-border/80">
          <CardHeader className="py-3 px-4 border-b border-border/50 flex flex-row items-center justify-between">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <ListTodo className="h-4 w-4 text-primary" />
              ALL TASKS ({filteredTasks.length})
            </CardTitle>

            <span className="text-[11px] text-muted-foreground hidden sm:inline">
              Nhấn vào task để xem chi tiết PLAN • DO • REVIEW
            </span>
          </CardHeader>

          <CardContent className="p-3 sm:p-4 space-y-2">
            {filteredTasks.length === 0 ? (
              <div className="text-center py-10">
                <p className="text-xs text-muted-foreground">
                  {searchQuery
                    ? 'Không tìm thấy công việc phù hợp với từ khóa.'
                    : 'Không có công việc nào trong danh sách này.'}
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsAddTaskOpen(true)}
                  className="text-xs mt-3 h-8"
                >
                  <Plus className="h-3.5 w-3.5 mr-1" /> Thêm công việc
                </Button>
              </div>
            ) : (
              filteredTasks.map((task) => (
                <TaskItemRow
                  key={task.id}
                  task={task}
                  onToggleTask={toggleTask}
                  onTogglePriority={toggleTodayPriority}
                  onSelectTask={setSelectedTask}
                  onStartTask={startTask}
                  onOpenFocusMode={setFocusingTask}
                  onDeleteTask={handleDelete}
                />
              ))
            )}
          </CardContent>
        </Card>
      </div>

      {/* 5. 💡 PARKING LOT */}
      <ParkingLotSection
        ideas={ideas}
        onAddIdea={addIdea}
        onUpdateIdea={updateIdea}
        onDiscardIdea={discardIdea}
        onDeleteIdea={deleteIdea}
        onConvertIdeaToTask={convertIdeaToTask}
      />

      {/* 6. MODALS & OVERLAYS */}
      {/* Task Detail Modal */}
      <TaskDetailModal
        task={selectedTask}
        isOpen={!!selectedTask}
        onClose={() => setSelectedTask(null)}
        onUpdateTask={updateTask}
        onUpdateStatus={updateTaskStatus}
        onStartTask={startTask}
        onReviewTask={reviewTask}
        onTogglePriority={toggleTodayPriority}
        onAddDefinitionItem={addDefinitionItem}
        onToggleDefinitionItem={toggleDefinitionItem}
        onDeleteDefinitionItem={deleteDefinitionItem}
        onOpenFocusMode={setFocusingTask}
        onDeleteTask={(id) => handleDelete(id, selectedTask?.title || '')}
      />

      {/* Focus Mode Overlay */}
      {focusingTask && (
        <FocusModeOverlay
          task={focusingTask}
          onClose={() => setFocusingTask(null)}
          onToggleDefinitionItem={toggleDefinitionItem}
          onCompleteTask={async (id) => {
            await updateTaskStatus(id, 'DONE')
          }}
          onStartTask={startTask}
        />
      )}

      {/* Daily Review Modal */}
      <DailyReviewModal
        isOpen={isDailyReviewOpen}
        onClose={() => setIsDailyReviewOpen(false)}
        tasks={tasks}
        existingReview={dailyReview}
        onSaveDailyReview={saveDailyReview}
      />

      {/* Quick Capture Modal */}
      <QuickCaptureModal
        isOpen={isQuickCaptureOpen}
        onClose={() => setIsQuickCaptureOpen(false)}
        onAddTask={addTask}
        onAddIdea={addIdea}
      />

      {/* Add Task Dialog */}
      <Dialog open={isAddTaskOpen} onOpenChange={setIsAddTaskOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{t.tasks.addTask}</DialogTitle>
            <DialogDescription>
              Lên kế hoạch rõ ràng với Plan và Definition of Done
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit(onTaskSubmit)} className="space-y-4 mt-2">
            <div className="space-y-1">
              <label className="text-xs font-medium">{t.tasks.taskTitle} *</label>
              <Input
                placeholder="VD: Hoàn thành Screen Manager, Ôn tập Listening..."
                {...register('title')}
                autoFocus
              />
              {errors.title && (
                <p className="text-[11px] text-destructive">{errors.title.message}</p>
              )}
            </div>

            {/* PLAN Criteria */}
            <div className="space-y-1 p-2.5 rounded-xl bg-muted/30 border border-border/50">
              <label className="text-xs font-medium text-foreground flex items-center gap-1.5">
                <span className="text-[10px] font-bold uppercase tracking-wider text-primary px-1 py-0.5 rounded bg-primary/10">
                  PLAN
                </span>
                What does &quot;done&quot; look like?
              </label>
              <Input
                placeholder="VD: Responsive, không lỗi console, test pass..."
                {...register('success_criteria')}
                className="text-xs italic bg-background/80"
              />
            </div>

            {/* Definition of Done toggle */}
            <div className="space-y-2 p-3 rounded-xl border border-border/60">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="enable-dod"
                  checked={enableDoD}
                  onCheckedChange={(checked) => setEnableDoD(Boolean(checked))}
                />
                <label
                  htmlFor="enable-dod"
                  className="text-xs font-semibold cursor-pointer select-none"
                >
                  Definition of Done (Checklist nghiệm thu)
                </label>
              </div>

              {enableDoD && (
                <div className="space-y-2 pt-1 animate-in fade-in-50">
                  {dodItems.map((item, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between p-1.5 rounded-lg bg-muted/40 text-xs"
                    >
                      <span className="truncate">☐ {item}</span>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => handleRemoveDodItem(idx)}
                        className="h-5 w-5 text-muted-foreground hover:text-destructive"
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  ))}

                  <div className="flex gap-2">
                    <Input
                      value={newDodItem}
                      onChange={(e) => setNewDodItem(e.target.value)}
                      placeholder="Thêm tiêu chí (UI hoàn chỉnh, CRUD hoạt động...)"
                      className="text-xs h-8"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault()
                          handleAddDodItem(e)
                        }
                      }}
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={handleAddDodItem}
                      className="h-8 text-xs px-2.5"
                    >
                      <Plus className="h-3 w-3 mr-1" /> Thêm
                    </Button>
                  </div>
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-xs font-medium">{t.tasks.priority}</label>
                <select
                  {...register('priority')}
                  className="w-full h-10 rounded-xl border border-input bg-background/80 px-3 text-xs"
                >
                  <option value={1}>{t.tasks.priorityHigh} (Cao)</option>
                  <option value={2}>{t.tasks.priorityMedium} (TB)</option>
                  <option value={3}>{t.tasks.priorityLow} (Thấp)</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-medium">{t.tasks.dueDate}</label>
                <Input type="date" {...register('due_date')} />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-medium">Mô tả thêm (nếu có)</label>
              <Input
                placeholder="Chi tiết công việc..."
                {...register('description')}
              />
            </div>

            {/* Set as today priority */}
            <div className="flex items-center space-x-2 pt-1">
              <Checkbox
                id="is-today-priority"
                checked={watch('is_today_priority')}
                onCheckedChange={(checked) => setValue('is_today_priority', Boolean(checked))}
              />
              <label
                htmlFor="is-today-priority"
                className="text-xs font-medium cursor-pointer select-none flex items-center gap-1"
              >
                <Flame className="h-3.5 w-3.5 text-amber-500 fill-current" />
                Đưa ngay vào Today's Focus (tối đa 3 việc/ngày)
              </label>
            </div>

            <div className="flex justify-end space-x-2 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsAddTaskOpen(false)}
                className="text-xs"
              >
                {t.common.cancel}
              </Button>
              <Button type="submit" className="text-xs">
                {t.common.save}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
