import {
  Circle,
  CheckCircle2,
  Calendar,
  Clock,
  Trash2,
  Flame,
  Sparkles,
  Play,
  CheckSquare,
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import type { Task } from '@/types'
import { formatDate, formatTimeAgo, formatCompletedAt } from '@/lib/date'
import { TaskWorkflowBadge } from './TaskWorkflowBadge'

interface TaskItemRowProps {
  task: Task
  onToggleTask: (taskId: string, currentCompleted: boolean) => void
  onTogglePriority: (taskId: string, currentIsPriority: boolean) => void
  onSelectTask: (task: Task) => void
  onStartTask: (taskId: string) => void
  onOpenFocusMode: (task: Task) => void
  onDeleteTask: (taskId: string, title: string) => void
}

export const TaskItemRow: React.FC<TaskItemRowProps> = ({
  task,
  onToggleTask,
  onTogglePriority,
  onSelectTask,
  onStartTask,
  onOpenFocusMode,
  onDeleteTask,
}) => {
  const isDone = task.status === 'DONE'
  const isInProgress = task.status === 'IN_PROGRESS'

  const dodItems = task.definition_items || []
  const dodTotal = dodItems.length
  const dodCompletedCount = dodItems.filter((i) => i.is_completed).length

  return (
    <div
      onClick={() => onSelectTask(task)}
      className={`py-3 px-3 rounded-xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 cursor-pointer group ${
        isDone
          ? 'bg-muted/20 border-border/40 opacity-70'
          : isInProgress
          ? 'bg-blue-500/[0.03] border-blue-500/25 hover:border-blue-500/40'
          : 'bg-card border-border/70 hover:bg-muted/40 hover:border-primary/30'
      }`}
    >
      {/* Left: Checkbox + Content */}
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

        <div className="flex-1 min-w-0">
          <div className="flex items-center space-x-2 flex-wrap gap-y-1">
            <p
              className={`text-xs sm:text-sm font-medium transition-all truncate ${
                isDone ? 'line-through text-muted-foreground' : 'text-foreground'
              }`}
            >
              {task.title}
            </p>

            <TaskWorkflowBadge status={task.status} />

            <Badge
              variant={
                task.priority === 1
                  ? 'destructive'
                  : task.priority === 2
                  ? 'warning'
                  : 'secondary'
              }
              className="text-[9px] px-1.5 py-0 h-4"
            >
              {task.priority === 1 ? 'High' : task.priority === 2 ? 'Medium' : 'Low'}
            </Badge>

            {task.is_today_priority && (
              <Badge
                variant="outline"
                className="text-[9px] px-1.5 py-0 h-4 border-amber-500/40 text-amber-500 font-semibold flex items-center gap-0.5"
              >
                <Flame className="h-2.5 w-2.5 fill-current" />
                Focus
              </Badge>
            )}
          </div>

          {/* Description preview */}
          {task.description && (
            <p
              className={`text-xs mt-0.5 truncate ${
                isDone ? 'line-through text-muted-foreground/50' : 'text-muted-foreground'
              }`}
            >
              {task.description}
            </p>
          )}

          {/* Success criteria snippet */}
          {task.success_criteria && (
            <p className="text-[11px] text-muted-foreground/90 italic mt-0.5 truncate flex items-center gap-1">
              <span className="font-semibold text-primary/70 not-italic">Done:</span>{' '}
              «{task.success_criteria}»
            </p>
          )}

          {/* Metadata badges */}
          <div className="flex items-center space-x-2.5 text-[10px] text-muted-foreground mt-1.5 flex-wrap gap-y-1">
            {task.due_date && (
              <span className="flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                {formatDate(task.due_date)}
              </span>
            )}

            {task.due_time && (
              <span className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {task.due_time}
              </span>
            )}

            {dodTotal > 0 && (
              <span
                className={`flex items-center gap-1 px-1.5 py-0.2 rounded font-mono ${
                  dodCompletedCount === dodTotal
                    ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-semibold'
                    : 'bg-muted text-muted-foreground'
                }`}
              >
                <CheckSquare className="h-2.5 w-2.5" />
                DoD: {dodCompletedCount}/{dodTotal}
              </span>
            )}

            {isInProgress && task.started_at && (
              <span className="text-blue-600 dark:text-blue-400 font-medium">
                Started {formatTimeAgo(task.started_at)}
              </span>
            )}

            {isDone && task.completed_at && (
              <span className="text-muted-foreground/70">
                {formatCompletedAt(task.completed_at)}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Right: Quick actions */}
      <div className="flex items-center justify-end space-x-1 flex-shrink-0 pt-1 sm:pt-0">
        {!isDone && (
          <Button
            variant="ghost"
            size="icon"
            onClick={(e) => {
              e.stopPropagation()
              onTogglePriority(task.id, task.is_today_priority)
            }}
            className={`h-7 w-7 rounded-lg ${
              task.is_today_priority
                ? 'text-amber-500 hover:text-amber-600'
                : 'text-muted-foreground hover:text-amber-500 opacity-60 group-hover:opacity-100'
            }`}
            title={task.is_today_priority ? 'Bỏ Focus' : 'Thêm vào Today Focus'}
          >
            <Flame className={`h-3.5 w-3.5 ${task.is_today_priority ? 'fill-current' : ''}`} />
          </Button>
        )}

        {!isDone && task.status === 'TODO' && (
          <Button
            variant="outline"
            size="sm"
            onClick={(e) => {
              e.stopPropagation()
              onStartTask(task.id)
            }}
            className="h-7 text-[11px] px-2 rounded-lg border-blue-500/30 text-blue-600 hover:bg-blue-500/10"
            title="Start Task"
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
            onDeleteTask(task.id, task.title)
          }}
          className="h-7 w-7 text-muted-foreground hover:text-destructive rounded-lg opacity-40 group-hover:opacity-100 transition-opacity"
          title="Delete Task"
        >
          <Trash2 className="h-3.5 w-3.5" />
        </Button>
      </div>
    </div>
  )
}
