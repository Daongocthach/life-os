import { useState, useMemo } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from '@/stores/authStore'
import { toast } from 'sonner'
import type { FinanceTransaction, FinanceCategory, FinanceGoal } from '@/types'
import type { TransactionFormValues, GoalFormValues } from '@/schemas/financeSchema'
import { isToday, isThisWeek, isThisMonth } from '@/lib/date'
import { format, parseISO } from 'date-fns'

export type TimeFilter = 'month' | 'week' | 'day' | 'all' | 'custom_month'
export type TypeFilter = 'all' | 'expense' | 'income'

export function useFinance() {
  const queryClient = useQueryClient()
  const user = useAuthStore((state) => state.user)

  // Filter States - Default to current month as requested
  const [timeFilter, setTimeFilter] = useState<TimeFilter>('month')
  const [selectedMonth, setSelectedMonth] = useState<string>(format(new Date(), 'yyyy-MM'))
  const [searchQuery, setSearchQuery] = useState<string>('')
  const [typeFilter, setTypeFilter] = useState<TypeFilter>('all')
  const [categoryFilter, setCategoryFilter] = useState<string>('all')

  // 1. Fetch transactions
  const { data: transactions = [], isLoading: isLoadingTransactions } = useQuery<FinanceTransaction[]>({
    queryKey: ['finance_transactions', user?.id],
    queryFn: async () => {
      let query = supabase
        .from('finance_transactions')
        .select('*, category:finance_categories(*)')
        .order('occurred_on', { ascending: false })

      if (user?.id) {
        query = query.eq('user_id', user.id)
      }

      const { data, error } = await query
      if (error) throw error
      return (data || []) as FinanceTransaction[]
    },
    enabled: true,
  })

  // 2. Fetch categories
  const { data: categories = [] } = useQuery<FinanceCategory[]>({
    queryKey: ['finance_categories', user?.id],
    queryFn: async () => {
      let query = supabase.from('finance_categories').select('*').eq('is_active', true)
      if (user?.id) {
        query = query.eq('user_id', user.id)
      }
      const { data, error } = await query
      if (error) throw error
      return (data || []) as FinanceCategory[]
    },
    enabled: true,
  })

  // 3. Fetch goals
  const { data: goals = [], isLoading: isLoadingGoals } = useQuery<FinanceGoal[]>({
    queryKey: ['finance_goals', user?.id],
    queryFn: async () => {
      let query = supabase.from('finance_goals').select('*').order('created_at', { ascending: false })
      if (user?.id) {
        query = query.eq('user_id', user.id)
      }
      const { data, error } = await query
      if (error) throw error
      return (data || []) as FinanceGoal[]
    },
    enabled: true,
  })

  // Mutations
  const addTransactionMutation = useMutation({
    mutationFn: async (values: TransactionFormValues) => {
      const { data, error } = await supabase.from('finance_transactions').insert([
        {
          user_id: user?.id || '94f8ff1b-439c-43b1-b9f0-5a970754da31',
          description: values.description,
          amount: values.type === 'expense' ? -Math.abs(values.amount) : Math.abs(values.amount),
          category_id: values.category_id || null,
          occurred_on: values.occurred_on,
          note: values.note || null,
        },
      ]).select().single()

      if (error) throw error
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['finance_transactions'] })
      toast.success('Giao dịch đã được lưu')
    },
    onError: (err: Error) => {
      toast.error('Lỗi khi thêm giao dịch: ' + err.message)
    },
  })

  const deleteTransactionMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('finance_transactions').delete().eq('id', id)
      if (error) throw error
      return id
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['finance_transactions'] })
      toast.success('Đã xóa giao dịch')
    },
    onError: (err: Error) => {
      toast.error('Lỗi khi xóa giao dịch: ' + err.message)
    },
  })

  const addGoalMutation = useMutation({
    mutationFn: async (values: GoalFormValues) => {
      const { data, error } = await supabase.from('finance_goals').insert([
        {
          user_id: user?.id || '94f8ff1b-439c-43b1-b9f0-5a970754da31',
          name: values.name,
          target_amount: values.target_amount,
          current_amount: values.current_amount || 0,
          target_date: values.target_date || null,
          note: values.note || null,
        },
      ]).select().single()

      if (error) throw error
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['finance_goals'] })
      toast.success('Đã tạo mục tiêu tài chính mới')
    },
    onError: (err: Error) => {
      toast.error('Lỗi khi thêm mục tiêu: ' + err.message)
    },
  })

  // Filtered Transactions
  const filteredTransactions = useMemo(() => {
    return transactions.filter((tx) => {
      const txDate = parseISO(tx.occurred_on)

      // 1. Time Filter
      if (timeFilter === 'day') {
        if (!isToday(txDate)) return false
      } else if (timeFilter === 'week') {
        if (!isThisWeek(txDate, { weekStartsOn: 1 })) return false
      } else if (timeFilter === 'month') {
        // Default: current month
        if (!isThisMonth(txDate)) return false
      } else if (timeFilter === 'custom_month') {
        const txMonthStr = format(txDate, 'yyyy-MM')
        if (txMonthStr !== selectedMonth) return false
      }
      // 'all': no date restriction

      // 2. Type Filter
      if (typeFilter === 'expense' && tx.amount >= 0) return false
      if (typeFilter === 'income' && tx.amount <= 0) return false

      // 3. Category Filter
      if (categoryFilter !== 'all' && tx.category_id !== categoryFilter) return false

      // 4. Search Query (description, note, category name, amount)
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim()
        const desc = (tx.description || '').toLowerCase()
        const note = (tx.note || '').toLowerCase()
        const cat = (tx.category?.name || '').toLowerCase()
        const amt = Math.abs(tx.amount).toString()
        if (!desc.includes(q) && !note.includes(q) && !cat.includes(q) && !amt.includes(q)) {
          return false
        }
      }

      return true
    })
  }, [transactions, timeFilter, selectedMonth, typeFilter, categoryFilter, searchQuery])

  // Filtered Period Stats
  const periodIncome = useMemo(() => {
    return filteredTransactions
      .filter((t) => t.amount > 0)
      .reduce((sum, t) => sum + Number(t.amount), 0)
  }, [filteredTransactions])

  const periodExpense = useMemo(() => {
    return filteredTransactions
      .filter((t) => t.amount < 0)
      .reduce((sum, t) => sum + Math.abs(Number(t.amount)), 0)
  }, [filteredTransactions])

  const periodBalance = periodIncome - periodExpense

  const periodLabel = useMemo(() => {
    if (timeFilter === 'day') return 'Hôm nay'
    if (timeFilter === 'week') return 'Tuần này'
    if (timeFilter === 'month') return `Tháng ${format(new Date(), 'MM/yyyy')}`
    if (timeFilter === 'custom_month') {
      try {
        return `Tháng ${format(parseISO(selectedMonth + '-01'), 'MM/yyyy')}`
      } catch {
        return selectedMonth
      }
    }
    return 'Tất cả thời gian'
  }, [timeFilter, selectedMonth])

  const resetFilters = () => {
    setTimeFilter('month')
    setSelectedMonth(format(new Date(), 'yyyy-MM'))
    setSearchQuery('')
    setTypeFilter('all')
    setCategoryFilter('all')
  }

  const isFiltered =
    timeFilter !== 'month' ||
    searchQuery.trim() !== '' ||
    typeFilter !== 'all' ||
    categoryFilter !== 'all'

  // Overall Historical Stats (for Dashboard compatibility)
  const totalIncome = transactions
    .filter((t) => t.amount > 0)
    .reduce((sum, t) => sum + Number(t.amount), 0)

  const totalExpense = transactions
    .filter((t) => t.amount < 0)
    .reduce((sum, t) => sum + Math.abs(Number(t.amount)), 0)

  const balance = totalIncome - totalExpense

  const spendingToday = transactions
    .filter((t) => t.amount < 0 && isToday(new Date(t.occurred_on)))
    .reduce((sum, t) => sum + Math.abs(Number(t.amount)), 0)

  const spendingThisWeek = transactions
    .filter((t) => t.amount < 0 && isThisWeek(new Date(t.occurred_on), { weekStartsOn: 1 }))
    .reduce((sum, t) => sum + Math.abs(Number(t.amount)), 0)

  const spendingThisMonth = transactions
    .filter((t) => t.amount < 0 && isThisMonth(new Date(t.occurred_on)))
    .reduce((sum, t) => sum + Math.abs(Number(t.amount)), 0)

  return {
    transactions,
    filteredTransactions,
    categories,
    goals,
    isLoading: isLoadingTransactions || isLoadingGoals,
    // Filter controls & state
    timeFilter,
    setTimeFilter,
    selectedMonth,
    setSelectedMonth,
    searchQuery,
    setSearchQuery,
    typeFilter,
    setTypeFilter,
    categoryFilter,
    setCategoryFilter,
    resetFilters,
    isFiltered,
    // Period-filtered stats (for Finance page)
    periodIncome,
    periodExpense,
    periodBalance,
    periodLabel,
    // All-time stats (for Dashboard)
    totalIncome,
    totalExpense,
    balance,
    spendingToday,
    spendingThisWeek,
    spendingThisMonth,
    addTransaction: addTransactionMutation.mutateAsync,
    isAddingTransaction: addTransactionMutation.isPending,
    deleteTransaction: deleteTransactionMutation.mutateAsync,
    isDeletingTransaction: deleteTransactionMutation.isPending,
    addGoal: addGoalMutation.mutateAsync,
  }
}
