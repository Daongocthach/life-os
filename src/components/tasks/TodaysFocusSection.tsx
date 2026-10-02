import { useState } from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import {
  Target,
  Plus,
  Play,
  CheckCircle2,
  Circle,
  X,
  Sparkles,
  Flame,
  CheckSquare,
} from 'lucide-react'
import type { Task, TaskStatus } from '@/types'
import { formatTimeAgo } from '@/lib/date'
import { TaskWorkflowBadge } from './TaskWorkflowBadge'

interface TodaysFocusSectionProps {
  tasks: Task[]
  onToggleTask: (taskId: string, currentCompleted: boolean) => void
  onTogglePriority: (taskId: string, currentIsPriority: boolean) => Promise<boolean> | boolean
  onSelectTask: (task: Task) => void
  onStartTask: (taskId: string) => void
  onOpenFocusMode: (task: Task) => void
  onQuickAddTask: () => void
}

export function TodaysFocusSection({
  tasks,
  onToggleTask,
  onTogglePriority,
  onSelectTask,
  onStartTask,
  onOpenFocusMode,
  onQuickAddTask,
}: TodaysFocusSectionProps) {
  const [isAddPickerOpen, setIsAddPickerOpen] = useState(false)

  // Priority tasks for today
  const priorityTasks = tasks.filter((t) => t.is_today_priority)
  const count = priorityTasks.length
  const completedCount = priorityTasks.filter((t) => t.status === 'DONE').length

  // Candidates to add to focus (non-priority, non-completed tasks)
  const candidateTasks = tasks.filter((t) => !t.is_today_priority && t.status !== 'DONE')

  const handlePickCandidate = async (taskId: string) => {
    const success = await onTogglePriority(taskId, false)
    if (success) {
      setIsAddPickerOpen(false)
    }
  }

  return (
    <>
      <Card className="border-border/80 bg-gradient-to-br from-amber-500/5 via-background to-background shadow-sm relative overflow-hidden">
        {/* Subtle decorative accent */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/5 rounded-full blur-2xl pointer-events-none" />

        <CardHeader className="py-3 px-4 sm:px-5 border-b border-border/50 flex flex-row items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="p-1.5 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400">
              <Flame className="h-4 w-4" />
            </div>
            <div>
              <CardTitle className="text-sm sm:text-base font-bold tracking-tight flex items-center gap-2">
                TODAY'S FOCUS
              </CardTitle>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Badge
              variant={count === 3 ? 'default' : 'outline'}
              className="text-xs font-mono font-medium px-2 py-0.5"
            >
              {count} / 3
            </Badge>

            {count < 3 && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsAddPickerOpen(true)}
                className="h-7 text-xs px-2.5 rounded-lg border-dashed hover:border-solid hover:bg-amber-500/10 hover:text-amber-600 transition-colors"
              >
                <Plus className="h-3 w-3 mr-1" />
                Add priority
              </Button>
            )}
          </div>
        </CardHeader>

        <CardContent className="p-3 sm:p-4">
          {priorityTasks.length === 0 ? (
            <div className="py-6 px-4 text-center border border-dashed border-border/70 rounded-xl bg-muted/20">
              <Target className="h-8 w-8 mx-auto text-muted-foreground/60 mb-2" />
              <p className="text-xs sm:text-sm font-medium text-foreground">
                No priorities for today.
              </p>
              <p className="text-xs text-muted-foreground mt-0.5 max-w-sm mx-auto">
                Pick up to 3 tasks to focus on. Tận dụng tối đa năng lượng cho điều quan trọng nhất.
              </p>
              <div className="flex justify-center gap-2 mt-3">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsAddPickerOpen(true)}
                  className="text-xs h-8"
                >
                  <Plus className="h-3.5 w-3.5 mr-1" />
                  Chọn từ danh sách
                </Button>
                <Button
                  variant="default"
                  size="sm"
                  onClick={onQuickAddTask}
                  className="text-xs h-8"
                >
                  <Plus className="h-3.5 w-3.5 mr-1" />
                  Tạo task mới
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-2">
              {priorityTasks.map((task) => {
                const isDone = task.status === 'DONE'
                const isInProgress = task.status === 'IN_PROGRESS'
                const isReview = task.status === 'REVIEW'
                const dodTotal = task.definition_items?.length || 0
                const dodCompleted = task.definition_items?.filter((d) => d.is_completed).length || 0

                return (
                  <div
                    key={task.id}
                    className={`group relative p-3 rounded-xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                      isDone
                        ? 'bg-muted/30 border-border/40 opacity-75'
                        : isInProgress
                        ? 'bg-blue-500/[0.04] border-blue-500/30 shadow-sm ring-1 ring-blue-500/10'
                        : 'bg-card border-border/80 hover:border-primary/30 hover:shadow-sm'
                    }`}
                  >
                    {/* Left: Checkbox + Title + Criteria */}
                    <div className="flex items-start space-x-3 flex-1 min-w-0">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation()
                          onToggleTask(task.id, isDone)
                        }}
                        className="mt-0.5 text-muted-foreground hover:text-primary transition-transform active:scale-90 flex-shrink-0"
                      >
                        {isDone ? (
                          <CheckCircle2 className="h-5 w-5 text-emerald-500 fill-emerald-500/20" />
                        ) : (
                          <Circle className="h-5 w-5 hover:text-primary transition-colors" />
                        )}
                      </button>

                      <div
                        onClick={() => onSelectTask(task)}
                        className="flex-1 min-w-0 cursor-pointer"
                      >
                        <div className="flex items-center space-x-2 flex-wrap gap-y-1">
                          <p
                            className={`text-xs sm:text-sm font-semibold truncate ${
                              isDone ? 'line-through text-muted-foreground' : 'text-foreground'
                            }`}
                          >
                            {task.title}
                          </p>
                          <TaskWorkflowBadge status={task.status} />
                        </div>

                        {/* Plan Success criteria preview if exists */}
                        {task.success_criteria && (
                          <p className="text-[11px] text-muted-foreground/90 italic mt-0.5 truncate flex items-center gap-1">
                            <span className="font-semibold text-primary/70 not-italic">Done looks like:</span>{' '}
                            «{task.success_criteria}»
                          </p>
                        )}

                        {/* DoD progress & Started timer */}
                        <div className="flex items-center space-x-3 text-[10px] text-muted-foreground mt-1">
                          {dodTotal > 0 && (
                            <span
                              className={`flex items-center gap-1 px-1.5 py-0.5 rounded font-mono ${
                                dodCompleted === dodTotal
                                  ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-semibold'
                                  : 'bg-muted text-muted-foreground'
                              }`}
                            >
                              <CheckSquare className="h-2.5 w-2.5" />
                              DoD: {dodCompleted}/{dodTotal}
                            </span>
                          )}

                          {isInProgress && task.started_at && (
                            <span className="text-blue-600 dark:text-blue-400 font-medium">
                              Started {formatTimeAgo(task.started_at)}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Right Action buttons */}
                    <div className="flex items-center justify-end space-x-1.5 flex-shrink-0 pt-1 sm:pt-0 border-t sm:border-t-0 border-border/40">
                      {!isDone && task.status === 'TODO' && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation()
                            onStartTask(task.id)
                          }}
                          className="h-7 text-[11px] px-2.5 rounded-lg border-blue-500/30 text-blue-600 hover:bg-blue-500/10"
                        >
                          <Play className="h-3 w-3 mr-1 fill-current" />
                          Start
                        </Button>
                      )}

                      {!isDone && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation()
                            onOpenFocusMode(task)
                          }}
                          className="h-7 text-[11px] px-2 rounded-lg text-primary hover:bg-primary/10"
                          title="Focus Mode"
                        >
                          <Sparkles className="h-3 w-3 mr-1" />
                          Focus
                        </Button>
                      )}

                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={(e) => {
                          e.stopPropagation()
                          onTogglePriority(task.id, true)
                        }}
                        className="h-7 w-7 text-muted-foreground hover:text-destructive rounded-lg opacity-60 group-hover:opacity-100"
                        title="Bỏ khỏi Today's Focus"
                      >
                        <X className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>
                )
              })}

              {count > 0 && (
                <div className="flex items-center justify-between pt-1 px-1 text-[11px] text-muted-foreground">
                  <span>
                    Hoàn thành {completedCount}/{count} việc ưu tiên hôm nay
                  </span>
                  {count < 3 && (
                    <button
                      type="button"
                      onClick={() => setIsAddPickerOpen(true)}
                      className="text-primary hover:underline font-medium flex items-center gap-1"
                    >
                      <Plus className="h-3 w-3" /> Add priority ({count}/3)
                    </button>
                  )}
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Picker Dialog to select task for Today's Focus */}
      <Dialog open={isAddPickerOpen} onOpenChange={setIsAddPickerOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Flame className="h-4 w-4 text-amber-500" />
              Chọn việc vào Today's Focus ({count} / 3)
            </DialogTitle>
            <DialogDescription>
              Tập trung tối đa vào 3 việc quan trọng nhất để tạo ra kết quả rõ rệt trong hôm nay.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3 mt-2">
            {candidateTasks.length === 0 ? (
              <div className="text-center py-6">
                <p className="text-xs text-muted-foreground mb-3">
                  Không còn công việc nào trong danh sách để chọn.
                </p>
                <Button
                  size="sm"
                  onClick={() => {
                    setIsAddPickerOpen(false)
                    onQuickAddTask()
                  }}
                  className="text-xs"
                >
                  <Plus className="h-3.5 w-3.5 mr-1" /> Tạo công việc mới
                </Button>
              </div>
            ) : (
              <div className="max-h-72 overflow-y-auto space-y-1.5 pr-1 divide-y divide-border/40">
                {candidateTasks.map((candidate) => (
                  <div
                    key={candidate.id}
                    onClick={() => handlePickCandidate(candidate.id)}
                    className="p-2.5 rounded-xl hover:bg-muted/60 cursor-pointer flex items-center justify-between group transition-colors pt-2"
                  >
                    <div className="min-w-0 flex-1 mr-2">
                      <p className="text-xs font-semibold text-foreground truncate group-hover:text-primary">
                        {candidate.title}
                      </p>
                      {candidate.description && (
                        <p className="text-[11px] text-muted-foreground truncate">
                          {candidate.description}
                        </p>
                      )}
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-7 text-[11px] px-2 rounded-lg flex-shrink-0"
                    >
                      <Plus className="h-3 w-3 mr-1" /> Focus
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
