import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from '@/stores/authStore'
import { toast } from 'sonner'
import type { Task, TaskCompletion, TaskDefinitionItem, TodoIdea, TodoDailyReview, TaskStatus } from '@/types'
import type { TaskFormValues, IdeaFormValues } from '@/schemas/taskSchema'
import { format, addDays } from 'date-fns'

export function useTasks() {
  const queryClient = useQueryClient()
  const user = useAuthStore((state) => state.user)
  const defaultUserId = '94f8ff1b-439c-43b1-b9f0-5a970754da31'
  const activeUserId = user?.id || defaultUserId
  const todayStr = format(new Date(), 'yyyy-MM-dd')

  // 1. Fetch tasks with definition items
  const { data: rawTasks = [], isLoading: isLoadingTasks } = useQuery<Task[]>({
    queryKey: ['tasks', activeUserId],
    queryFn: async () => {
      let query = supabase
        .from('tasks')
        .select('*, task_definition_items(*)')
        .order('is_today_priority', { ascending: false })
        .order('priority', { ascending: true })
        .order('created_at', { ascending: false })

      if (activeUserId) {
        query = query.eq('user_id', activeUserId)
      }

      const { data, error } = await query
      if (error) throw error

      return (data || []).map((item) => ({
        ...item,
        status: (item.status || 'TODO') as TaskStatus,
        is_today_priority: Boolean(item.is_today_priority),
        definition_items: (item.task_definition_items || []) as TaskDefinitionItem[],
      })) as Task[]
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

  // 3. Fetch parking lot ideas
  const { data: ideas = [], isLoading: isLoadingIdeas } = useQuery<TodoIdea[]>({
    queryKey: ['todo_ideas', activeUserId],
    queryFn: async () => {
      let query = supabase
        .from('todo_ideas')
        .select('*')
        .order('created_at', { ascending: false })

      if (activeUserId) {
        query = query.eq('user_id', activeUserId)
      }

      const { data, error } = await query
      if (error) throw error
      return (data || []) as TodoIdea[]
    },
  })

  // 4. Fetch today's daily review
  const { data: dailyReview = null, isLoading: isLoadingReview } = useQuery<TodoDailyReview | null>({
    queryKey: ['todo_daily_review', activeUserId, todayStr],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('todo_daily_reviews')
        .select('*')
        .eq('user_id', activeUserId)
        .eq('date', todayStr)
        .maybeSingle()

      if (error && error.code !== 'PGRST116') throw error
      return (data || null) as TodoDailyReview | null
    },
  })

  // Merge completion status into tasks
  const tasksWithStatus: Task[] = rawTasks.map((t) => {
    const hasCompletion = completions.some(
      (c) => c.task_id === t.id && (!t.is_recurring || c.completed_on === todayStr)
    )
    const isCompleted = t.status === 'DONE' || hasCompletion
    return {
      ...t,
      is_completed: isCompleted,
      status: isCompleted ? 'DONE' : t.status || 'TODO',
    }
  })

  // Pending tasks today (for backward compatibility and quick views)
  const pendingTasksToday = tasksWithStatus.filter(
    (t) => !t.is_completed && (!t.due_date || t.due_date <= todayStr)
  )

  // Today's Focus tasks (up to 3 prioritized for today)
  const todayPriorityTasks = tasksWithStatus.filter((t) => t.is_today_priority)

  // Invalidate helper
  const invalidateTasks = () => {
    queryClient.invalidateQueries({ queryKey: ['tasks'] })
    queryClient.invalidateQueries({ queryKey: ['task_completions'] })
  }

  // Add Task Mutation
  const addTaskMutation = useMutation({
    mutationFn: async (
      values: TaskFormValues & { initialDefinitionItems?: string[] }
    ) => {
      const { data: newTask, error } = await supabase
        .from('tasks')
        .insert([
          {
            user_id: activeUserId,
            title: values.title.trim(),
            description: values.description?.trim() || null,
            priority: values.priority,
            due_date: values.due_date || null,
            due_time: values.due_time || null,
            category: values.category?.trim() || null,
            success_criteria: values.success_criteria?.trim() || null,
            is_today_priority: Boolean(values.is_today_priority),
            status: 'TODO',
          },
        ])
        .select()
        .single()

      if (error) throw error

      // Insert DoD items if provided
      if (values.initialDefinitionItems && values.initialDefinitionItems.length > 0) {
        const dodItems = values.initialDefinitionItems
          .map((item) => item.trim())
          .filter(Boolean)
          .map((title) => ({
            task_id: newTask.id,
            title,
            is_completed: false,
          }))

        if (dodItems.length > 0) {
          const { error: dodError } = await supabase
            .from('task_definition_items')
            .insert(dodItems)
          if (dodError) {
            console.error('Error inserting initial DoD items:', dodError)
          }
        }
      }

      return newTask
    },
    onSuccess: () => {
      invalidateTasks()
      toast.success('Đã tạo công việc mới')
    },
    onError: (err: Error) => {
      toast.error('Lỗi khi tạo công việc: ' + err.message)
    },
  })

  // Update Task Mutation
  const updateTaskMutation = useMutation({
    mutationFn: async ({ taskId, updates }: { taskId: string; updates: Partial<Task> }) => {
      // Exclude computed fields
      const { definition_items: _def, is_completed: _comp, ...dbFields } = updates as any

      const { data, error } = await supabase
        .from('tasks')
        .update(dbFields)
        .eq('id', taskId)
        .select()
        .single()

      if (error) throw error
      return data
    },
    onSuccess: () => {
      invalidateTasks()
    },
    onError: (err: Error) => {
      toast.error('Lỗi cập nhật task: ' + err.message)
    },
  })

  // Toggle Task Completion (Checkbox click)
  const toggleTaskMutation = useMutation({
    mutationFn: async ({ taskId, isCompleted }: { taskId: string; isCompleted: boolean }) => {
      if (isCompleted) {
        // Uncompleting: revert to TODO
        await supabase.from('task_completions').delete().eq('task_id', taskId)
        const { error } = await supabase
          .from('tasks')
          .update({
            status: 'TODO',
            completed_at: null,
          })
          .eq('id', taskId)
        if (error) throw error
      } else {
        // Completing: set status to DONE and record completion
        await supabase.from('task_completions').insert([
          {
            task_id: taskId,
            completed_on: todayStr,
            completed_at: new Date().toISOString(),
          },
        ])
        const { error } = await supabase
          .from('tasks')
          .update({
            status: 'DONE',
            completed_at: new Date().toISOString(),
          })
          .eq('id', taskId)
        if (error) throw error
      }
      return { taskId, isCompleted }
    },
    onSuccess: () => {
      invalidateTasks()
    },
    onError: (err: Error) => {
      toast.error('Lỗi khi cập nhật trạng thái: ' + err.message)
    },
  })

  // Workflow Status Transitions: TODO -> IN_PROGRESS -> REVIEW -> DONE
  const updateStatusMutation = useMutation({
    mutationFn: async ({
      taskId,
      status,
      extra,
    }: {
      taskId: string
      status: TaskStatus
      extra?: { review_note?: string }
    }) => {
      const nowIso = new Date().toISOString()
      const updates: Record<string, any> = { status }

      if (status === 'IN_PROGRESS') {
        // If not already started, set started_at
        const currentTask = rawTasks.find((t) => t.id === taskId)
        if (!currentTask?.started_at) {
          updates.started_at = nowIso
        }
      } else if (status === 'REVIEW') {
        // Maintain review state
      } else if (status === 'DONE') {
        updates.completed_at = nowIso
        if (extra?.review_note) {
          updates.review_note = extra.review_note
          updates.reviewed_at = nowIso
        }
        // Record completion entry
        await supabase.from('task_completions').insert([
          {
            task_id: taskId,
            completed_on: todayStr,
            completed_at: nowIso,
            note: extra?.review_note || null,
          },
        ])
      } else if (status === 'TODO') {
        updates.completed_at = null
        await supabase.from('task_completions').delete().eq('task_id', taskId)
      }

      const { error } = await supabase.from('tasks').update(updates).eq('id', taskId)
      if (error) throw error
      return { taskId, status }
    },
    onSuccess: (_, variables) => {
      invalidateTasks()
      if (variables.status === 'IN_PROGRESS') {
        toast.info('Đã bắt đầu công việc (In Progress)')
      } else if (variables.status === 'REVIEW') {
        toast.info('Chuyển sang kiểm tra (Review)')
      } else if (variables.status === 'DONE') {
        toast.success('Đã hoàn thành công việc!')
      }
    },
    onError: (err: Error) => {
      toast.error('Lỗi khi đổi trạng thái: ' + err.message)
    },
  })

  // Today Priority Toggle (Limit max 3)
  const toggleTodayPriority = async (taskId: string, currentIsPriority: boolean) => {
    if (!currentIsPriority) {
      // Check current count of priority tasks
      const activePriorityCount = tasksWithStatus.filter(
        (t) => t.is_today_priority && t.status !== 'DONE'
      ).length
      if (activePriorityCount >= 3) {
        toast.error('Chỉ được chọn tối đa 3 việc quan trọng nhất trong ngày!')
        return false
      }
    }

    try {
      const { error } = await supabase
        .from('tasks')
        .update({ is_today_priority: !currentIsPriority })
        .eq('id', taskId)

      if (error) throw error
      invalidateTasks()
      toast.success(
        !currentIsPriority
          ? "Đã thêm vào Today's Focus"
          : "Đã bỏ khỏi Today's Focus"
      )
      return true
    } catch (err: any) {
      toast.error('Lỗi khi cập nhật Today Focus: ' + err.message)
      return false
    }
  }

  // Delete Task
  const deleteTaskMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('tasks').delete().eq('id', id)
      if (error) throw error
      return id
    },
    onSuccess: () => {
      invalidateTasks()
      toast.success('Đã xóa công việc')
    },
    onError: (err: Error) => {
      toast.error('Lỗi khi xóa công việc: ' + err.message)
    },
  })

  // Definition of Done Items Mutations
  const addDefinitionItemMutation = useMutation({
    mutationFn: async ({ taskId, title }: { taskId: string; title: string }) => {
      const { data, error } = await supabase
        .from('task_definition_items')
        .insert([{ task_id: taskId, title: title.trim(), is_completed: false }])
        .select()
        .single()
      if (error) throw error
      return data
    },
    onSuccess: () => {
      invalidateTasks()
    },
    onError: (err: Error) => {
      toast.error('Lỗi thêm tiêu chí DoD: ' + err.message)
    },
  })

  const toggleDefinitionItemMutation = useMutation({
    mutationFn: async ({ itemId, isCompleted }: { itemId: string; isCompleted: boolean }) => {
      const nowIso = new Date().toISOString()
      const { data, error } = await supabase
        .from('task_definition_items')
        .update({
          is_completed: !isCompleted,
          completed_at: !isCompleted ? nowIso : null,
        })
        .eq('id', itemId)
        .select()
        .single()
      if (error) throw error
      return data
    },
    onSuccess: () => {
      invalidateTasks()
    },
    onError: (err: Error) => {
      toast.error('Lỗi cập nhật DoD: ' + err.message)
    },
  })

  const deleteDefinitionItemMutation = useMutation({
    mutationFn: async (itemId: string) => {
      const { error } = await supabase
        .from('task_definition_items')
        .delete()
        .eq('id', itemId)
      if (error) throw error
      return itemId
    },
    onSuccess: () => {
      invalidateTasks()
    },
    onError: (err: Error) => {
      toast.error('Lỗi xóa DoD: ' + err.message)
    },
  })

  // Parking Lot: Ideas Mutations
  const addIdeaMutation = useMutation({
    mutationFn: async (values: IdeaFormValues) => {
      const { data, error } = await supabase
        .from('todo_ideas')
        .insert([
          {
            user_id: activeUserId,
            title: values.title.trim(),
            note: values.note?.trim() || null,
            status: 'IDEA',
          },
        ])
        .select()
        .single()
      if (error) throw error
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['todo_ideas'] })
      toast.success('Đã lưu ý tưởng vào Parking Lot')
    },
    onError: (err: Error) => {
      toast.error('Lỗi lưu ý tưởng: ' + err.message)
    },
  })

  const updateIdeaMutation = useMutation({
    mutationFn: async ({
      ideaId,
      updates,
    }: {
      ideaId: string
      updates: Partial<TodoIdea>
    }) => {
      const { data, error } = await supabase
        .from('todo_ideas')
        .update(updates)
        .eq('id', ideaId)
        .select()
        .single()
      if (error) throw error
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['todo_ideas'] })
    },
    onError: (err: Error) => {
      toast.error('Lỗi cập nhật ý tưởng: ' + err.message)
    },
  })

  const discardIdeaMutation = useMutation({
    mutationFn: async (ideaId: string) => {
      const { error } = await supabase
        .from('todo_ideas')
        .update({ status: 'DISCARDED' })
        .eq('id', ideaId)
      if (error) throw error
      return ideaId
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['todo_ideas'] })
      toast.info('Đã bỏ qua ý tưởng')
    },
    onError: (err: Error) => {
      toast.error('Lỗi: ' + err.message)
    },
  })

  const deleteIdeaMutation = useMutation({
    mutationFn: async (ideaId: string) => {
      const { error } = await supabase.from('todo_ideas').delete().eq('id', ideaId)
      if (error) throw error
      return ideaId
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['todo_ideas'] })
      toast.success('Đã xóa ý tưởng')
    },
    onError: (err: Error) => {
      toast.error('Lỗi: ' + err.message)
    },
  })

  // Convert Idea -> Task
  const convertIdeaToTaskMutation = useMutation({
    mutationFn: async ({
      ideaId,
      priority = 2,
      isTodayPriority = false,
    }: {
      ideaId: string
      priority?: 1 | 2 | 3
      isTodayPriority?: boolean
    }) => {
      const targetIdea = ideas.find((i) => i.id === ideaId)
      if (!targetIdea) throw new Error('Không tìm thấy ý tưởng')

      // Create Task
      const { data: createdTask, error: taskError } = await supabase
        .from('tasks')
        .insert([
          {
            user_id: activeUserId,
            title: targetIdea.title,
            description: targetIdea.note || null,
            priority,
            due_date: isTodayPriority ? todayStr : null,
            is_today_priority: isTodayPriority,
            status: 'TODO',
          },
        ])
        .select()
        .single()

      if (taskError) throw taskError

      // Mark idea as CONVERTED
      const { error: ideaError } = await supabase
        .from('todo_ideas')
        .update({
          status: 'CONVERTED',
          converted_task_id: createdTask.id,
        })
        .eq('id', ideaId)

      if (ideaError) {
        console.error('Failed to link converted idea:', ideaError)
      }

      return createdTask
    },
    onSuccess: () => {
      invalidateTasks()
      queryClient.invalidateQueries({ queryKey: ['todo_ideas'] })
      toast.success('Đã chuyển ý tưởng thành Task!')
    },
    onError: (err: Error) => {
      toast.error('Lỗi chuyển ý tưởng thành task: ' + err.message)
    },
  })

  // Daily Review Mutation
  const saveDailyReviewMutation = useMutation({
    mutationFn: async ({
      accomplishments,
      carry_over_notes,
      carryOverActions,
    }: {
      accomplishments: string
      carry_over_notes: string
      carryOverActions?: Record<string, 'tomorrow' | 'backlog' | 'cancel'>
    }) => {
      // 1. Save or update daily review record
      const { data, error } = await supabase
        .from('todo_daily_reviews')
        .upsert(
          {
            user_id: activeUserId,
            date: todayStr,
            accomplishments: accomplishments.trim() || null,
            carry_over_notes: carry_over_notes.trim() || null,
          },
          { onConflict: 'user_id,date' }
        )
        .select()
        .single()

      if (error) throw error

      // 2. Handle carry-over task actions
      if (carryOverActions) {
        const tomorrowStr = format(addDays(new Date(), 1), 'yyyy-MM-dd')
        for (const [taskId, action] of Object.entries(carryOverActions)) {
          if (action === 'tomorrow') {
            await supabase
              .from('tasks')
              .update({
                due_date: tomorrowStr,
                is_today_priority: false,
              })
              .eq('id', taskId)
          } else if (action === 'backlog') {
            await supabase
              .from('tasks')
              .update({
                due_date: null,
                is_today_priority: false,
              })
              .eq('id', taskId)
          } else if (action === 'cancel') {
            await supabase.from('tasks').delete().eq('id', taskId)
          }
        }
      }

      return data
    },
    onSuccess: () => {
      invalidateTasks()
      queryClient.invalidateQueries({ queryKey: ['todo_daily_review'] })
      toast.success('Đã lưu Daily Review thành công!')
    },
    onError: (err: Error) => {
      toast.error('Lỗi khi lưu Daily Review: ' + err.message)
    },
  })

  return {
    tasks: tasksWithStatus,
    pendingTasksToday,
    todayPriorityTasks,
    ideas,
    dailyReview,
    isLoading: isLoadingTasks || isLoadingCompletions || isLoadingIdeas || isLoadingReview,
    addTask: addTaskMutation.mutateAsync,
    updateTask: (taskId: string, updates: Partial<Task>) =>
      updateTaskMutation.mutateAsync({ taskId, updates }),
    deleteTask: deleteTaskMutation.mutateAsync,
    toggleTask: (taskId: string, currentCompleted: boolean) =>
      toggleTaskMutation.mutateAsync({ taskId, isCompleted: currentCompleted }),
    updateTaskStatus: (taskId: string, status: TaskStatus, extra?: { review_note?: string }) =>
      updateStatusMutation.mutateAsync({ taskId, status, extra }),
    startTask: (taskId: string) =>
      updateStatusMutation.mutateAsync({ taskId, status: 'IN_PROGRESS' }),
    reviewTask: (taskId: string, reviewNote: string) =>
      updateStatusMutation.mutateAsync({
        taskId,
        status: 'DONE',
        extra: { review_note: reviewNote },
      }),
    toggleTodayPriority,
    addDefinitionItem: (taskId: string, title: string) =>
      addDefinitionItemMutation.mutateAsync({ taskId, title }),
    toggleDefinitionItem: (itemId: string, currentCompleted: boolean) =>
      toggleDefinitionItemMutation.mutateAsync({ itemId, isCompleted: currentCompleted }),
    deleteDefinitionItem: (itemId: string) =>
      deleteDefinitionItemMutation.mutateAsync(itemId),
    addIdea: addIdeaMutation.mutateAsync,
    updateIdea: (ideaId: string, updates: Partial<TodoIdea>) =>
      updateIdeaMutation.mutateAsync({ ideaId, updates }),
    discardIdea: discardIdeaMutation.mutateAsync,
    deleteIdea: deleteIdeaMutation.mutateAsync,
    convertIdeaToTask: (ideaId: string, options?: { priority?: 1 | 2 | 3; isTodayPriority?: boolean }) =>
      convertIdeaToTaskMutation.mutateAsync({ ideaId, ...options }),
    saveDailyReview: saveDailyReviewMutation.mutateAsync,
  }
}
