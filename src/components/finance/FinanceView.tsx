import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import {
  Plus,
  Trash2,
  TrendingUp,
  TrendingDown,
  Wallet,
  Calendar,
  Tag,
  Target,
  Eye,
  EyeOff,
  Search,
  X,
  RotateCcw,
  Filter,
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
import { useFinance, type TimeFilter, type TypeFilter } from '@/hooks/useFinance'
import { useI18n } from '@/hooks/useI18n'
import { useConfirm } from '@/hooks/useConfirm'
import { usePrivacy } from '@/hooks/usePrivacy'
import { transactionSchema, goalSchema, type TransactionFormValues, type GoalFormValues } from '@/schemas/financeSchema'
import { formatDate } from '@/lib/date'
import { format } from 'date-fns'

export function FinanceView() {
  const { t } = useI18n()
  const confirm = useConfirm()
  const { isMasked, toggleMask, maskCurrency } = usePrivacy()
  const {
    transactions,
    filteredTransactions,
    categories,
    goals,
    periodIncome,
    periodExpense,
    periodBalance,
    periodLabel,
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
    addTransaction,
    isAddingTransaction,
    deleteTransaction,
    addGoal,
  } = useFinance()

  const [isAddTxOpen, setIsAddTxOpen] = useState(false)
  const [isAddGoalOpen, setIsAddGoalOpen] = useState(false)

  // React Hook Form for Transaction
  const {
    register: registerTx,
    handleSubmit: handleSubmitTx,
    reset: resetTx,
    setValue: setValueTx,
    watch: watchTx,
    formState: { errors: errorsTx },
  } = useForm<TransactionFormValues>({
    resolver: zodResolver(transactionSchema),
    defaultValues: {
      type: 'expense',
      amount: undefined,
      description: '',
      occurred_on: format(new Date(), 'yyyy-MM-dd'),
      category_id: null,
      note: '',
    },
  })

  const currentType = watchTx('type')

  // React Hook Form for Goal
  const {
    register: registerGoal,
    handleSubmit: handleSubmitGoal,
    reset: resetGoal,
    formState: { errors: errorsGoal },
  } = useForm<GoalFormValues>({
    resolver: zodResolver(goalSchema),
    defaultValues: {
      name: '',
      target_amount: undefined,
      current_amount: 0,
    },
  })

  const onTxSubmit = async (values: TransactionFormValues) => {
    await addTransaction(values)
    resetTx()
    setIsAddTxOpen(false)
  }

  const onGoalSubmit = async (values: GoalFormValues) => {
    await addGoal(values)
    resetGoal()
    setIsAddGoalOpen(false)
  }

  const handleDelete = async (id: string, desc: string) => {
    const ok = await confirm({
      title: t.finance.confirmDelete,
      description: `Giao dịch: "${desc}" sẽ bị xóa vĩnh viễn khỏi hệ thống.`,
      variant: 'destructive',
      confirmText: t.common.delete,
      cancelText: t.common.cancel,
    })
    if (ok) {
      await deleteTransaction(id)
    }
  }

  return (
    <div className="space-y-6 pb-24">
      {/* Top summary row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight">{t.finance.title}</h1>
            {/* Eye Privacy Toggle */}
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleMask}
              className="h-8 w-8 text-muted-foreground hover:text-foreground"
              title={isMasked ? 'Bấm để hiển thị số tiền' : 'Bấm để che số tiền'}
            >
              {isMasked ? <EyeOff className="h-4 w-4 text-muted-foreground" /> : <Eye className="h-4 w-4 text-primary" />}
            </Button>
          </div>
          <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
            Quản lý dòng tiền, theo dõi thu chi và mục tiêu tài chính
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsAddGoalOpen(true)}
            className="text-xs"
          >
            <Target className="h-3.5 w-3.5 mr-1" />
            {t.finance.addGoal}
          </Button>
          <Button
            size="sm"
            onClick={() => setIsAddTxOpen(true)}
            className="text-xs"
          >
            <Plus className="h-3.5 w-3.5 mr-1" />
            {t.finance.addTransaction}
          </Button>
        </div>
      </div>

      {/* Stats Cards (Reflects Filtered Period, default: Current Month) */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <Card className="p-4 border-border/80">
          <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
            <span>{t.finance.totalIncome} ({periodLabel})</span>
            <TrendingUp className="h-4 w-4 text-emerald-500" />
          </div>
          <div className="text-lg font-bold text-emerald-600 dark:text-emerald-400">
            {maskCurrency(periodIncome)}
          </div>
        </Card>

        <Card className="p-4 border-border/80">
          <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
            <span>{t.finance.totalExpense} ({periodLabel})</span>
            <TrendingDown className="h-4 w-4 text-rose-500" />
          </div>
          <div className="text-lg font-bold text-rose-600 dark:text-rose-400">
            {maskCurrency(periodExpense)}
          </div>
        </Card>

        <Card className="p-4 border-border/80">
          <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
            <span>{t.finance.netSavings} ({periodLabel})</span>
            <Wallet className="h-4 w-4 text-primary" />
          </div>
          <div className="text-lg font-bold">
            {maskCurrency(periodBalance)}
          </div>
        </Card>
      </div>

      {/* Search & Filter Toolbar */}
      <Card className="p-3.5 border-border/80 bg-card/60 space-y-3">
        {/* Row 1: Search Input & Month Picker */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
          {/* Search box */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
            <Input
              placeholder="Tìm kiếm giao dịch (tên, số tiền, ghi chú...)"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8 pr-8 text-xs h-9 bg-background/80"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-2.5 text-muted-foreground hover:text-foreground"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>

          {/* Month Picker for Custom Month */}
          <div className="flex items-center space-x-2 shrink-0">
            <span className="text-xs text-muted-foreground font-medium shrink-0">Chọn tháng:</span>
            <input
              type="month"
              value={selectedMonth}
              onChange={(e) => {
                if (e.target.value) {
                  setSelectedMonth(e.target.value)
                  setTimeFilter('custom_month')
                }
              }}
              className="h-9 px-2 text-xs rounded-xl border border-input bg-background/90 text-foreground font-medium focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary"
            />
          </div>
        </div>

        {/* Row 2: Time Filter Pills & Category & Type Filter */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-border/40 text-xs">
          {/* Time Filter Pills: Ngày, Tuần, Tháng (mặc định), Tất cả */}
          <div className="flex items-center space-x-1 flex-wrap gap-y-1">
            <span className="text-muted-foreground font-medium mr-1 flex items-center gap-1">
              <Calendar className="h-3.5 w-3.5 text-primary" />
              Lọc theo:
            </span>
            {[
              { id: 'month', label: 'Tháng này' },
              { id: 'week', label: 'Tuần này' },
              { id: 'day', label: 'Hôm nay' },
              { id: 'all', label: 'Tất cả' },
            ].map((p) => {
              const isActive = timeFilter === p.id
              return (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => setTimeFilter(p.id as TimeFilter)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
                    isActive
                      ? 'bg-primary text-primary-foreground shadow-xs'
                      : 'bg-muted/70 hover:bg-muted text-muted-foreground hover:text-foreground'
                  }`}
                >
                  {p.label}
                </button>
              )
            })}
          </div>

          {/* Type & Category dropdowns & Reset button */}
          <div className="flex items-center space-x-2 flex-wrap gap-y-1">
            {/* Type selector */}
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value as TypeFilter)}
              className="h-8 rounded-lg border border-input bg-background/90 px-2 text-xs font-medium text-foreground focus-visible:outline-none"
            >
              <option value="all">Tất cả loại thu chi</option>
              <option value="expense">Khoản Chi (-)</option>
              <option value="income">Khoản Thu (+)</option>
            </select>

            {/* Category selector */}
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="h-8 rounded-lg border border-input bg-background/90 px-2 text-xs font-medium text-foreground focus-visible:outline-none max-w-[150px] truncate"
            >
              <option value="all">Tất cả danh mục</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>

            {/* Reset Button if filter is active */}
            {isFiltered && (
              <Button
                variant="ghost"
                size="sm"
                onClick={resetFilters}
                className="h-8 px-2 text-xs text-muted-foreground hover:text-foreground"
                title="Đặt lại về mặc định (Tháng này)"
              >
                <RotateCcw className="h-3 w-3 mr-1" />
                Đặt lại
              </Button>
            )}
          </div>
        </div>
      </Card>

      {/* Transaction History */}
      <Card className="border-border/80">
        <CardHeader className="flex flex-row items-center justify-between pb-3">
          <CardTitle className="text-sm font-semibold flex items-center justify-between w-full">
            <span className="flex items-center gap-2">
              <Wallet className="h-4 w-4 text-primary" />
              {t.finance.history} ({filteredTransactions.length})
            </span>
            <Badge variant="outline" className="text-[11px] font-normal">
              {periodLabel}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          {filteredTransactions.length === 0 ? (
            <div className="py-10 text-center space-y-2">
              <Filter className="h-8 w-8 text-muted-foreground/40 mx-auto" />
              <p className="text-xs font-medium text-foreground">
                {isFiltered
                  ? 'Không tìm thấy giao dịch nào phù hợp với bộ lọc hoặc từ khóa tìm kiếm.'
                  : 'Chưa có giao dịch nào trong tháng này.'}
              </p>
              {isFiltered ? (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={resetFilters}
                  className="text-xs h-7 mt-1"
                >
                  <RotateCcw className="h-3 w-3 mr-1" />
                  Đặt lại bộ lọc
                </Button>
              ) : (
                <Button
                  size="sm"
                  onClick={() => setIsAddTxOpen(true)}
                  className="text-xs h-7 mt-1"
                >
                  <Plus className="h-3 w-3 mr-1" />
                  Thêm giao dịch ngay
                </Button>
              )}
            </div>
          ) : (
            <div className="divide-y divide-border/60">
              {filteredTransactions.map((tx) => {
                const isExpense = tx.amount < 0
                return (
                  <div
                    key={tx.id}
                    className="py-3 flex items-center justify-between group hover:bg-muted/30 px-2 rounded-xl transition-colors"
                  >
                    <div className="flex items-start space-x-3">
                      <div
                        className={`p-2 rounded-xl mt-0.5 ${
                          isExpense ? 'bg-rose-500/10 text-rose-500' : 'bg-emerald-500/10 text-emerald-500'
                        }`}
                      >
                        {isExpense ? (
                          <TrendingDown className="h-4 w-4" />
                        ) : (
                          <TrendingUp className="h-4 w-4" />
                        )}
                      </div>
                      <div>
                        <p className="text-xs sm:text-sm font-semibold text-foreground">
                          {tx.description}
                        </p>
                        <div className="flex items-center space-x-2 text-[11px] text-muted-foreground mt-0.5">
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {formatDate(tx.occurred_on)}
                          </span>
                          {tx.category?.name && (
                            <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-4">
                              <Tag className="h-2.5 w-2.5 mr-0.5" />
                              {tx.category.name}
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center space-x-3">
                      <span
                        className={`text-xs sm:text-sm font-bold ${
                          isExpense ? 'text-rose-600 dark:text-rose-400' : 'text-emerald-600 dark:text-emerald-400'
                        }`}
                      >
                        {isMasked ? '••••••' : `${isExpense ? '-' : '+'}${maskCurrency(Math.abs(tx.amount))}`}
                      </span>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(tx.id, tx.description)}
                        className="h-8 w-8 text-muted-foreground hover:text-destructive opacity-70 group-hover:opacity-100"
                        title="Xóa giao dịch"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add Transaction Dialog */}
      <Dialog open={isAddTxOpen} onOpenChange={setIsAddTxOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t.finance.addTransaction}</DialogTitle>
            <DialogDescription>
              Nhập chi tiết thu hoặc chi để ghi nhận vào sổ thu chi
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmitTx(onTxSubmit)} className="space-y-4 mt-2">
            {/* Type selector */}
            <div className="grid grid-cols-2 gap-2">
              <Button
                type="button"
                variant={currentType === 'expense' ? 'destructive' : 'outline'}
                onClick={() => setValueTx('type', 'expense')}
                className="w-full text-xs h-9"
              >
                {t.finance.expense}
              </Button>
              <Button
                type="button"
                variant={currentType === 'income' ? 'success' : 'outline'}
                onClick={() => setValueTx('type', 'income')}
                className="w-full text-xs h-9"
              >
                {t.finance.income}
              </Button>
            </div>

            {/* Amount */}
            <div className="space-y-1">
              <label className="text-xs font-medium text-foreground">{t.finance.amount} (VND)</label>
              <Input
                type="number"
                placeholder="VD: 50000"
                {...registerTx('amount')}
              />
              {errorsTx.amount && (
                <p className="text-[11px] text-destructive">{errorsTx.amount.message}</p>
              )}
            </div>

            {/* Description */}
            <div className="space-y-1">
              <label className="text-xs font-medium text-foreground">Mô tả giao dịch</label>
              <Input
                placeholder="VD: Ăn trưa, Đổ xăng, Lương..."
                {...registerTx('description')}
              />
              {errorsTx.description && (
                <p className="text-[11px] text-destructive">{errorsTx.description.message}</p>
              )}
            </div>

            {/* Category */}
            <div className="space-y-1">
              <label className="text-xs font-medium text-foreground">{t.finance.category}</label>
              <select
                {...registerTx('category_id')}
                className="w-full h-10 rounded-xl border border-input bg-background/80 px-3 text-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <option value="">-- Chọn danh mục --</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} ({c.type})
                  </option>
                ))}
              </select>
            </div>

            {/* Date */}
            <div className="space-y-1">
              <label className="text-xs font-medium text-foreground">{t.finance.date}</label>
              <Input type="date" {...registerTx('occurred_on')} />
              {errorsTx.occurred_on && (
                <p className="text-[11px] text-destructive">{errorsTx.occurred_on.message}</p>
              )}
            </div>

            <div className="flex justify-end space-x-2 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsAddTxOpen(false)}
                className="text-xs"
              >
                {t.common.cancel}
              </Button>
              <Button type="submit" disabled={isAddingTransaction} className="text-xs">
                {isAddingTransaction ? t.common.loading : t.common.save}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Add Goal Dialog */}
      <Dialog open={isAddGoalOpen} onOpenChange={setIsAddGoalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t.finance.addGoal}</DialogTitle>
            <DialogDescription>
              Tạo mục tiêu tiết kiệm hoặc tích lũy dài hạn
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmitGoal(onGoalSubmit)} className="space-y-4 mt-2">
            <div className="space-y-1">
              <label className="text-xs font-medium">Tên mục tiêu</label>
              <Input placeholder="VD: Mua Macbook, Quỹ khẩn cấp..." {...registerGoal('name')} />
              {errorsGoal.name && (
                <p className="text-[11px] text-destructive">{errorsGoal.name.message}</p>
              )}
            </div>

            <div className="space-y-1">
              <label className="text-xs font-medium">Số tiền mục tiêu (VND)</label>
              <Input type="number" placeholder="VD: 30000000" {...registerGoal('target_amount')} />
              {errorsGoal.target_amount && (
                <p className="text-[11px] text-destructive">{errorsGoal.target_amount.message}</p>
              )}
            </div>

            <div className="space-y-1">
              <label className="text-xs font-medium">Số tiền đã có sẵn (VND)</label>
              <Input type="number" placeholder="VD: 5000000" {...registerGoal('current_amount')} />
            </div>

            <div className="flex justify-end space-x-2 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsAddGoalOpen(false)}
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
