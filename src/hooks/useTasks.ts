import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from '@/stores/authStore'
import { toast } from 'sonner'
import type { Task, TaskCompletion } from '@/types'
import type { TaskFormValues } from '@/schemas/taskSchema'
import { format } from 'date-fns'

export function useTasks() {
  const queryClient = useQueryClient()
  const user = useAuthStore((state) => state.user)
  const todayStr = format(new Date(), 'yyyy-MM-dd')

  // 1. Fetch tasks
  const { data: tasks = [], isLoading: isLoadingTasks } = useQuery<Task[]>({
    queryKey: ['tasks', user?.id],
    queryFn: async () => {
      let query = supabase.from('tasks').select('*').order('created_at', { ascending: false })
      if (user?.id) {
        query = query.eq('user_id', user.id)
      }
      const { data, error } = await query
      if (error) throw error
      return (data || []) as Task[]
    },
  })

  // 2. Fetch completions
  const { data: completions = [], isLoading: isLoadingCompletions } = useQuery<TaskCompletion[]>({
    queryKey: ['task_completions'],
    queryFn: async () => {
      const { data, error } = await supabase.from('task_completions').select('*')
      if (error) throw error
      return (data || []) as TaskCompletion[]
    },
  })

  // Merge completion status into tasks
  const tasksWithStatus: Task[] = tasks.map((t) => {
    const isCompleted = completions.some(
      (c) => c.task_id === t.id && (!t.is_recurring || c.completed_on === todayStr)
    )
    return {
      ...t,
      is_completed: isCompleted,
    }
  })

  // Pending tasks today
  const pendingTasksToday = tasksWithStatus.filter(
    (t) => !t.is_completed && (!t.due_date || t.due_date <= todayStr)
  )

  // Mutations
  const addTaskMutation = useMutation({
    mutationFn: async (values: TaskFormValues) => {
      const { data, error } = await supabase.from('tasks').insert([
        {
          user_id: user?.id || '94f8ff1b-439c-43b1-b9f0-5a970754da31',
          title: values.title,
          description: values.description || null,
          priority: values.priority,
          due_date: values.due_date || null,
          due_time: values.due_time || null,
          category: values.category || null,
        },
      ]).select().single()

      if (error) throw error
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] })
      toast.success('Đã tạo công việc mới')
    },
    onError: (err: Error) => {
      toast.error('Lỗi khi tạo công việc: ' + err.message)
    },
  })

  const toggleTaskMutation = useMutation({
    mutationFn: async ({ taskId, isCompleted }: { taskId: string; isCompleted: boolean }) => {
      if (isCompleted) {
        // Remove completion
        const { error } = await supabase
          .from('task_completions')
          .delete()
          .eq('task_id', taskId)
        if (error) throw error
      } else {
        // Add completion
        const { error } = await supabase.from('task_completions').insert([
          {
            task_id: taskId,
            completed_on: todayStr,
            completed_at: new Date().toISOString(),
          },
        ])
        if (error) throw error
      }
      return { taskId, isCompleted }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['task_completions'] })
    },
    onError: (err: Error) => {
      toast.error('Lỗi khi cập nhật trạng thái task: ' + err.message)
    },
  })

  const deleteTaskMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('tasks').delete().eq('id', id)
      if (error) throw error
      return id
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] })
      toast.success('Đã xóa công việc')
    },
    onError: (err: Error) => {
      toast.error('Lỗi khi xóa công việc: ' + err.message)
    },
  })

  return {
    tasks: tasksWithStatus,
    pendingTasksToday,
    isLoading: isLoadingTasks || isLoadingCompletions,
    addTask: addTaskMutation.mutateAsync,
    toggleTask: (taskId: string, currentCompleted: boolean) =>
      toggleTaskMutation.mutateAsync({ taskId, isCompleted: currentCompleted }),
    deleteTask: deleteTaskMutation.mutateAsync,
  }
}
