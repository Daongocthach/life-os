import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import {
  CheckSquare,
  Plus,
  Trash2,
  Calendar,
  Clock,
  Circle,
  CheckCircle2,
} from 'lucide-react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
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
import { formatDate } from '@/lib/date'
import { format } from 'date-fns'

export function TasksView() {
  const { t } = useI18n()
  const confirm = useConfirm()
  const { tasks, addTask, toggleTask, deleteTask } = useTasks()

  const [isAddTaskOpen, setIsAddTaskOpen] = useState(false)
  const [filter, setFilter] = useState<'all' | 'pending' | 'completed'>('all')

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<TaskFormValues>({
    resolver: zodResolver(taskSchema),
    defaultValues: {
      title: '',
      description: '',
      priority: 2,
      due_date: format(new Date(), 'yyyy-MM-dd'),
    },
  })

  const onTaskSubmit = async (values: TaskFormValues) => {
    await addTask(values)
    reset()
    setIsAddTaskOpen(false)
  }

  const handleDelete = async (id: string, title: string) => {
    const ok = await confirm({
      title: t.tasks.confirmDelete,
      description: `Công việc "${title}" sẽ bị xóa.`,
      variant: 'destructive',
      confirmText: t.common.delete,
      cancelText: t.common.cancel,
    })
    if (ok) {
      await deleteTask(id)
    }
  }

  const filteredTasks = tasks.filter((task) => {
    if (filter === 'pending') return !task.is_completed
    if (filter === 'completed') return task.is_completed
    return true
  })

  return (
    <div className="space-y-6 pb-24">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight">{t.tasks.title}</h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
            {t.tasks.subtitle}
          </p>
        </div>

        <Button
          size="sm"
          onClick={() => setIsAddTaskOpen(true)}
          className="text-xs"
        >
          <Plus className="h-3.5 w-3.5 mr-1" />
          {t.tasks.addTask}
        </Button>
      </div>

      {/* Filter Tabs */}
      <div className="flex space-x-2">
        <Button
          variant={filter === 'all' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setFilter('all')}
          className="text-xs h-8"
        >
          {t.common.all} ({tasks.length})
        </Button>
        <Button
          variant={filter === 'pending' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setFilter('pending')}
          className="text-xs h-8"
        >
          {t.tasks.pending} ({tasks.filter((t) => !t.is_completed).length})
        </Button>
        <Button
          variant={filter === 'completed' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setFilter('completed')}
          className="text-xs h-8"
        >
          {t.tasks.completed} ({tasks.filter((t) => t.is_completed).length})
        </Button>
      </div>

      {/* Task Checklist Items */}
      <Card className="border-border/80">
        <CardHeader className="py-3 px-4 border-b border-border/50">
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <CheckSquare className="h-4 w-4 text-primary" />
            Checklist ({filteredTasks.length})
          </CardTitle>
        </CardHeader>

        <CardContent className="p-3 divide-y divide-border/50">
          {filteredTasks.length === 0 ? (
            <p className="text-xs text-muted-foreground py-8 text-center">
              Không có công việc nào trong danh sách. Bấm "Thêm công việc" để tạo mới!
            </p>
          ) : (
            filteredTasks.map((task) => (
              <div
                key={task.id}
                className="py-3 px-2 flex items-center justify-between group hover:bg-muted/30 rounded-xl transition-all"
              >
                <div
                  onClick={() => toggleTask(task.id, !!task.is_completed)}
                  className="flex items-start space-x-3 cursor-pointer flex-1 mr-3 select-none"
                >
                  <div className="mt-0.5 transition-transform active:scale-90">
                    {task.is_completed ? (
                      <CheckCircle2 className="h-5 w-5 text-emerald-500 fill-emerald-500/20" />
                    ) : (
                      <Circle className="h-5 w-5 text-muted-foreground hover:text-primary transition-colors" />
                    )}
                  </div>
                  <div>
                    {/* Strikethrough requirement */}
                    <p
                      className={`text-xs sm:text-sm font-medium transition-all ${
                        task.is_completed
                          ? 'line-through text-muted-foreground opacity-60'
                          : 'text-foreground'
                      }`}
                    >
                      {task.title}
                    </p>
                    {task.description && (
                      <p
                        className={`text-xs mt-0.5 ${
                          task.is_completed
                            ? 'line-through text-muted-foreground/50'
                            : 'text-muted-foreground'
                        }`}
                      >
                        {task.description}
                      </p>
                    )}
                    <div className="flex items-center space-x-2 text-[10px] text-muted-foreground mt-1">
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
                        {task.priority === 1 ? 'Cao' : task.priority === 2 ? 'TB' : 'Thấp'}
                      </Badge>
                    </div>
                  </div>
                </div>

                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleDelete(task.id, task.title)}
                  className="h-8 w-8 text-muted-foreground hover:text-destructive opacity-70 group-hover:opacity-100"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>
            ))
          )}
        </CardContent>
      </Card>

      {/* Add Task Dialog */}
      <Dialog open={isAddTaskOpen} onOpenChange={setIsAddTaskOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t.tasks.addTask}</DialogTitle>
            <DialogDescription>
              Tạo việc cần làm mới cho danh sách checklist
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit(onTaskSubmit)} className="space-y-4 mt-2">
            <div className="space-y-1">
              <label className="text-xs font-medium">{t.tasks.taskTitle}</label>
              <Input
                placeholder="VD: Nộp báo cáo tài chính, Mua sữa chua..."
                {...register('title')}
              />
              {errors.title && (
                <p className="text-[11px] text-destructive">{errors.title.message}</p>
              )}
            </div>

            <div className="space-y-1">
              <label className="text-xs font-medium">Mô tả thêm (nếu có)</label>
              <Input
                placeholder="Chi tiết công việc..."
                {...register('description')}
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-xs font-medium">{t.tasks.priority}</label>
                <select
                  {...register('priority')}
                  className="w-full h-10 rounded-xl border border-input bg-background/80 px-3 text-xs"
                >
                  <option value={1}>{t.tasks.priorityHigh}</option>
                  <option value={2}>{t.tasks.priorityMedium}</option>
                  <option value={3}>{t.tasks.priorityLow}</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-medium">{t.tasks.dueDate}</label>
                <Input type="date" {...register('due_date')} />
              </div>
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
