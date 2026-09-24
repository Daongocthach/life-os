import {
  Wallet,
  TrendingDown,
  Target,
  CheckCircle2,
  Circle,
  Dumbbell,
  BookOpen,
  Utensils,
  ArrowRight,
  Eye,
  EyeOff,
} from 'lucide-react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { LifeOSLogo } from '@/components/common/LifeOSLogo'
import { useDashboard } from '@/hooks/useDashboard'
import { useI18n } from '@/hooks/useI18n'
import { usePrivacy } from '@/hooks/usePrivacy'
import type { NavTab } from '@/components/common/BottomNav'

interface DashboardViewProps {
  onNavigate: (tab: NavTab) => void
}

export function DashboardView({ onNavigate }: DashboardViewProps) {
  const { t } = useI18n()
  const { finance, tasks, workout, meals, english } = useDashboard()
  const { isMasked, toggleMask, maskCurrency } = usePrivacy()

  return (
    <div className="space-y-6 pb-20">
      {/* Greeting Banner */}
      <div className="rounded-2xl bg-gradient-to-r from-primary/10 via-primary/5 to-transparent p-5 border border-primary/20">
        <div className="flex items-center space-x-3.5">
          <LifeOSLogo size={42} />
          <div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight">
              {t.dashboard.summaryToday}
            </h1>
            <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
              {t.dashboard.greeting}
            </p>
          </div>
        </div>
      </div>

      {/* 1. Finance Overview Widgets */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <h2 className="text-base font-semibold flex items-center gap-2">
              <Wallet className="h-4 w-4 text-primary" />
              {t.common.finance}
            </h2>
            {/* Inline Eye Toggle */}
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleMask}
              className="h-7 w-7 text-muted-foreground hover:text-foreground"
              title={isMasked ? 'Bấm để hiển thị số tiền' : 'Bấm để che số tiền'}
            >
              {isMasked ? <EyeOff className="h-3.5 w-3.5 text-muted-foreground" /> : <Eye className="h-3.5 w-3.5 text-primary" />}
            </Button>
          </div>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => onNavigate('finance')}
            className="text-xs text-muted-foreground hover:text-foreground h-8"
          >
            Chi tiết <ArrowRight className="h-3.5 w-3.5 ml-1" />
          </Button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {/* Spent Today */}
          <Card className="p-4 bg-card/60 backdrop-blur-sm border-border/80">
            <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
              <span>{t.dashboard.spendingToday}</span>
              <TrendingDown className="h-3.5 w-3.5 text-rose-500" />
            </div>
            <div className="text-base sm:text-lg font-bold text-rose-600 dark:text-rose-400">
              {maskCurrency(finance.spendingToday)}
            </div>
          </Card>

          {/* Spent Week */}
          <Card className="p-4 bg-card/60 backdrop-blur-sm border-border/80">
            <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
              <span>{t.dashboard.spendingWeek}</span>
              <TrendingDown className="h-3.5 w-3.5 text-rose-500" />
            </div>
            <div className="text-base sm:text-lg font-bold text-rose-600 dark:text-rose-400">
              {maskCurrency(finance.spendingThisWeek)}
            </div>
          </Card>

          {/* Spent Month */}
          <Card className="p-4 bg-card/60 backdrop-blur-sm border-border/80">
            <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
              <span>{t.dashboard.spendingMonth}</span>
              <TrendingDown className="h-3.5 w-3.5 text-rose-500" />
            </div>
            <div className="text-base sm:text-lg font-bold text-rose-600 dark:text-rose-400">
              {maskCurrency(finance.spendingThisMonth)}
            </div>
          </Card>

          {/* Balance */}
          <Card className="p-4 bg-card/60 backdrop-blur-sm border-border/80">
            <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
              <span>{t.dashboard.remainingBalance}</span>
              <Wallet className="h-3.5 w-3.5 text-emerald-500" />
            </div>
            <div className="text-base sm:text-lg font-bold text-emerald-600 dark:text-emerald-400">
              {maskCurrency(finance.balance)}
            </div>
          </Card>
        </div>

        {/* Current Goals Progress */}
        {finance.goals.length > 0 && (
          <Card className="p-4 border-border/80">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                <Target className="h-3.5 w-3.5 text-primary" />
                {t.dashboard.currentGoals}
              </span>
              <span className="text-xs text-muted-foreground">
                {finance.goals.length} mục tiêu
              </span>
            </div>
            <div className="space-y-3">
              {finance.goals.slice(0, 2).map((goal) => {
                const percent = Math.min(
                  Math.round((goal.current_amount / (goal.target_amount || 1)) * 100),
                  100
                )
                return (
                  <div key={goal.id} className="space-y-1">
                    <div className="flex justify-between text-xs font-medium">
                      <span>{goal.name}</span>
                      <span className="text-muted-foreground">
                        {maskCurrency(goal.current_amount)} / {maskCurrency(goal.target_amount)} ({percent}%)
                      </span>
                    </div>
                    <Progress value={percent} className="h-2" />
                  </div>
                )
              })}
            </div>
          </Card>
        )}
      </div>

      {/* 2. Tasks & Action Items */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Tasks Today */}
        <Card className="border-border/80">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-primary" />
              {t.dashboard.tasksToday}
            </CardTitle>
            <Badge variant="outline" className="text-xs">
              {tasks.pendingToday.length} việc
            </Badge>
          </CardHeader>
          <CardContent className="space-y-2 pt-1">
            {tasks.pendingToday.length === 0 ? (
              <p className="text-xs text-muted-foreground py-4 text-center">
                {t.dashboard.noTasksToday}
              </p>
            ) : (
              tasks.pendingToday.slice(0, 4).map((task) => (
                <div
                  key={task.id}
                  onClick={() => tasks.toggleTask(task.id, !!task.is_completed)}
                  className="flex items-center justify-between p-2.5 rounded-xl border border-border/40 hover:bg-muted/50 cursor-pointer transition-colors"
                >
                  <div className="flex items-center space-x-2.5">
                    <Circle className="h-4 w-4 text-muted-foreground hover:text-primary transition-colors" />
                    <span className="text-xs font-medium">{task.title}</span>
                  </div>
                  <Badge variant={task.priority === 1 ? 'destructive' : 'secondary'} className="text-[10px] h-5">
                    {task.priority === 1 ? 'Gấp' : 'Thường'}
                  </Badge>
                </div>
              ))
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onNavigate('tasks')}
              className="w-full text-xs text-muted-foreground mt-1"
            >
              Mở danh sách task <ArrowRight className="h-3 w-3 ml-1" />
            </Button>
          </CardContent>
        </Card>

        {/* Daily Actions: Gym & English */}
        <div className="space-y-4">
          {/* Gym Today */}
          <Card className="border-border/80">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <Dumbbell className="h-4 w-4 text-primary" />
                {t.dashboard.gymSession}
              </CardTitle>
              {workout.isDone ? (
                <Badge variant="success" className="text-[10px]">
                  {t.dashboard.gymDone}
                </Badge>
              ) : (
                <Badge variant="warning" className="text-[10px]">
                  {t.dashboard.gymPending}
                </Badge>
              )}
            </CardHeader>
            <CardContent className="space-y-3 pt-1">
              <p className="text-xs text-foreground font-medium">
                {workout.todayRoutine?.session_name || 'Hôm nay: Nghỉ ngơi hoặc chưa lên lịch'}
              </p>
              {!workout.isDone && workout.todayRoutine && (
                <Button
                  size="sm"
                  onClick={workout.checkinToday}
                  className="w-full text-xs h-8"
                >
                  Đánh dấu đã tập xong
                </Button>
              )}
            </CardContent>
          </Card>

          {/* English Lesson Today */}
          <Card className="border-border/80">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <BookOpen className="h-4 w-4 text-primary" />
                {t.dashboard.englishLesson}
              </CardTitle>
              {english.isDone ? (
                <Badge variant="success" className="text-[10px]">
                  {t.dashboard.englishDone} ({english.todaySession?.listening_score}/20)
                </Badge>
              ) : (
                <Badge variant="warning" className="text-[10px]">
                  {t.dashboard.englishPending}
                </Badge>
              )}
            </CardHeader>
            <CardContent className="space-y-3 pt-1">
              <p className="text-xs text-foreground font-medium truncate">
                {english.currentLesson?.title || 'Bài luyện nghe hôm nay'}
              </p>
              <Button
                variant={english.isDone ? 'outline' : 'default'}
                size="sm"
                onClick={() => onNavigate('english')}
                className="w-full text-xs h-8"
              >
                {english.isDone ? 'Xem lại bài học' : 'Luyện nghe 7 lần ngay'}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* 3. Today's Menu */}
      <Card className="border-border/80">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <Utensils className="h-4 w-4 text-primary" />
            {t.dashboard.menuToday}
          </CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onNavigate('meals')}
            className="text-xs text-muted-foreground h-7"
          >
            Quản lý thực đơn <ArrowRight className="h-3 w-3 ml-1" />
          </Button>
        </CardHeader>
        <CardContent className="pt-1">
          {meals.todayMeals.length === 0 ? (
            <p className="text-xs text-muted-foreground py-3 text-center">
              {t.dashboard.noMenuToday}
            </p>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {meals.todayMeals.map((dm) => (
                <div
                  key={dm.id}
                  className="p-3 rounded-xl border border-border/50 bg-muted/30"
                >
                  <span className="text-[10px] font-semibold uppercase text-muted-foreground block">
                    {dm.meal_type}
                  </span>
                  <span className="text-xs font-semibold text-foreground mt-0.5 block truncate">
                    {dm.meal?.name || dm.note || 'Món ăn'}
                  </span>
                  <span className="text-[11px] text-muted-foreground block mt-1">
                    {dm.meal?.calories_kcal || 0} kcal
                  </span>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
