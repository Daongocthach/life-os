import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import {
  Dumbbell,
  Plus,
  Trash2,
  Calendar,
  CheckCircle2,
  Flame,
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
import { useWorkout } from '@/hooks/useWorkout'
import { useI18n } from '@/hooks/useI18n'
import { useConfirm } from '@/hooks/useConfirm'
import {
  routineSchema,
  routineExerciseSchema,
  type RoutineFormValues,
  type RoutineExerciseFormValues,
} from '@/schemas/workoutSchema'

export function WorkoutView() {
  const { t } = useI18n()
  const confirm = useConfirm()
  const {
    routines,
    currentDayOfWeek,
    todayRoutine,
    isTodayWorkoutDone,
    addRoutine,
    addExercise,
    deleteRoutine,
    checkinToday,
  } = useWorkout()

  const [selectedDay, setSelectedDay] = useState<number>(currentDayOfWeek)
  const [isAddRoutineOpen, setIsAddRoutineOpen] = useState(false)
  const [isAddExOpen, setIsAddExOpen] = useState(false)
  const [targetRoutineId, setTargetRoutineId] = useState<string | null>(null)

  // Day names: 1: T2, 2: T3, 3: T4, 4: T5, 5: T6, 6: T7, 0: CN
  const daysOfWeek = [
    { day: 1, label: 'Thứ Hai (T2)' },
    { day: 2, label: 'Thứ Ba (T3)' },
    { day: 3, label: 'Thứ Tư (T4)' },
    { day: 4, label: 'Thứ Năm (T5)' },
    { day: 5, label: 'Thứ Sáu (T6)' },
    { day: 6, label: 'Thứ Bảy (T7)' },
    { day: 0, label: 'Chủ Nhật (CN)' },
  ]

  // Form for Routine
  const {
    register: registerRoutine,
    handleSubmit: handleSubmitRoutine,
    reset: resetRoutine,
    formState: { errors: errorsRoutine },
  } = useForm<RoutineFormValues>({
    resolver: zodResolver(routineSchema),
    defaultValues: {
      day_of_week: selectedDay,
      session_name: '',
      notes: '',
    },
  })

  // Form for Exercise
  const {
    register: registerEx,
    handleSubmit: handleSubmitEx,
    reset: resetEx,
    setValue: setValueEx,
    formState: { errors: errorsEx },
  } = useForm<RoutineExerciseFormValues>({
    resolver: zodResolver(routineExerciseSchema),
    defaultValues: {
      routine_id: '',
      exercise_name: '',
      target_sets: 3,
      target_reps: 10,
      target_weight_kg: 0,
    },
  })

  const onRoutineSubmit = async (values: RoutineFormValues) => {
    await addRoutine({ ...values, day_of_week: selectedDay })
    resetRoutine()
    setIsAddRoutineOpen(false)
  }

  const onExSubmit = async (values: RoutineExerciseFormValues) => {
    await addExercise(values)
    resetEx()
    setIsAddExOpen(false)
  }

  const handleDeleteRoutine = async (id: string, name: string) => {
    const ok = await confirm({
      title: t.workout.confirmDelete,
      description: `Buổi tập "${name}" cùng toàn bộ bài tập liên kết sẽ bị xóa.`,
      variant: 'destructive',
      confirmText: t.common.delete,
      cancelText: t.common.cancel,
    })
    if (ok) {
      await deleteRoutine(id)
    }
  }

  // Filter routines for the selected day tab
  const routinesForSelectedDay = routines.filter((r) => r.day_of_week === selectedDay)

  return (
    <div className="space-y-6 pb-24">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight">
            {t.workout.title}
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
            {t.workout.subtitle}
          </p>
        </div>

        <div className="flex items-center space-x-2">
          {todayRoutine && (
            <Button
              variant={isTodayWorkoutDone ? 'secondary' : 'default'}
              size="sm"
              onClick={checkinToday}
              disabled={isTodayWorkoutDone}
              className="text-xs"
            >
              <CheckCircle2 className="h-3.5 w-3.5 mr-1" />
              {isTodayWorkoutDone ? 'Đã tập xong hôm nay' : 'Check-in tập hôm nay'}
            </Button>
          )}
          <Button
            size="sm"
            onClick={() => setIsAddRoutineOpen(true)}
            className="text-xs"
          >
            <Plus className="h-3.5 w-3.5 mr-1" />
            {t.workout.addRoutine}
          </Button>
        </div>
      </div>

      {/* Monday - Sunday Day Selector Tabs */}
      <div className="grid grid-cols-4 sm:grid-cols-7 gap-2">
        {daysOfWeek.map((d) => {
          const isCurrent = d.day === currentDayOfWeek
          const isSelected = d.day === selectedDay
          const hasRoutine = routines.some((r) => r.day_of_week === d.day)

          return (
            <button
              key={d.day}
              onClick={() => setSelectedDay(d.day)}
              className={`p-3 rounded-xl border text-center transition-all relative ${
                isSelected
                  ? 'border-primary bg-primary text-primary-foreground shadow-sm'
                  : 'border-border/70 bg-card hover:bg-muted/40 text-foreground'
              }`}
            >
              <span className="text-xs font-bold block">{d.label.split(' ')[0]}</span>
              <span className={`text-[10px] block mt-0.5 ${isSelected ? 'text-primary-foreground/80' : 'text-muted-foreground'}`}>
                {d.label.split(' ')[1]}
              </span>
              {hasRoutine && (
                <span
                  className={`absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full ${
                    isSelected ? 'bg-primary-foreground' : 'bg-emerald-500'
                  }`}
                />
              )}
              {isCurrent && (
                <span className="block mt-1 text-[9px] font-semibold uppercase tracking-wider underline">
                  Hôm nay
                </span>
              )}
            </button>
          )
        })}
      </div>

      {/* Routine details for the selected day */}
      <div className="space-y-4">
        {routinesForSelectedDay.length === 0 ? (
          <Card className="p-8 text-center border-dashed border-border/80">
            <Dumbbell className="h-10 w-10 text-muted-foreground/40 mx-auto mb-2" />
            <p className="text-sm font-semibold text-foreground">
              Chưa có lịch tập cho ngày này
            </p>
            <p className="text-xs text-muted-foreground mt-1 max-w-sm mx-auto">
              Lên lịch để xây dựng thói quen rèn luyện sức khỏe đều đặn mỗi tuần!
            </p>
            <Button
              size="sm"
              onClick={() => setIsAddRoutineOpen(true)}
              className="mt-4 text-xs"
            >
              <Plus className="h-3.5 w-3.5 mr-1" />
              Lên lịch cho ngày này
            </Button>
          </Card>
        ) : (
          routinesForSelectedDay.map((routine) => (
            <Card key={routine.id} className="border-border/80 overflow-hidden">
              <CardHeader className="bg-muted/30 border-b border-border/50 py-3 px-5 flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="text-base font-bold flex items-center gap-2">
                    <Flame className="h-4 w-4 text-primary" />
                    {routine.session_name}
                  </CardTitle>
                  {routine.notes && (
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {routine.notes}
                    </p>
                  )}
                </div>
                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setTargetRoutineId(routine.id)
                      setValueEx('routine_id', routine.id)
                      setIsAddExOpen(true)
                    }}
                    className="text-xs h-8"
                  >
                    <Plus className="h-3.5 w-3.5 mr-1" />
                    Thêm bài tập
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDeleteRoutine(routine.id, routine.session_name)}
                    className="h-8 w-8 text-muted-foreground hover:text-destructive"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </CardHeader>

              <CardContent className="p-4 space-y-2">
                {routine.exercises && routine.exercises.length > 0 ? (
                  <div className="divide-y divide-border/50">
                    {routine.exercises.map((ex, idx) => (
                      <div
                        key={ex.id || idx}
                        className="py-2.5 flex items-center justify-between text-xs"
                      >
                        <div className="flex items-center space-x-2.5">
                          <span className="w-5 h-5 rounded-md bg-primary/10 text-primary font-bold flex items-center justify-center text-[11px]">
                            {idx + 1}
                          </span>
                          <span className="font-semibold text-foreground text-sm">
                            {(ex as any).exercises?.name || ex.exercise_name || 'Bài tập'}
                          </span>
                        </div>
                        <div className="flex items-center space-x-3 text-muted-foreground">
                          <Badge variant="secondary" className="text-[11px]">
                            {ex.target_sets || 3} sets × {ex.target_reps || 10} reps
                          </Badge>
                          {ex.target_weight_kg ? (
                            <Badge variant="outline" className="text-[11px]">
                              {ex.target_weight_kg} kg
                            </Badge>
                          ) : null}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-muted-foreground py-3 text-center">
                    Chưa có danh sách bài tập. Bấm "Thêm bài tập" để tạo bài cụ thể!
                  </p>
                )}
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Add Routine Dialog */}
      <Dialog open={isAddRoutineOpen} onOpenChange={setIsAddRoutineOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t.workout.addRoutine}</DialogTitle>
            <DialogDescription>
              Tạo buổi tập mới cho ngày đang chọn
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmitRoutine(onRoutineSubmit)} className="space-y-4 mt-2">
            <div className="space-y-1">
              <label className="text-xs font-medium">{t.workout.sessionName}</label>
              <Input
                placeholder="VD: Push (Ngực, Vai, Tay sau), Leg Day..."
                {...registerRoutine('session_name')}
              />
              {errorsRoutine.session_name && (
                <p className="text-[11px] text-destructive">{errorsRoutine.session_name.message}</p>
              )}
            </div>

            <div className="space-y-1">
              <label className="text-xs font-medium">{t.workout.notes}</label>
              <Input
                placeholder="Ghi chú về buổi tập..."
                {...registerRoutine('notes')}
              />
            </div>

            <div className="flex justify-end space-x-2 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsAddRoutineOpen(false)}
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

      {/* Add Exercise Dialog */}
      <Dialog open={isAddExOpen} onOpenChange={setIsAddExOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t.workout.addExercise}</DialogTitle>
            <DialogDescription>
              Nhập chi tiết bài tập, hiệp và số lần thực hiện
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmitEx(onExSubmit)} className="space-y-4 mt-2">
            <div className="space-y-1">
              <label className="text-xs font-medium">Tên bài tập</label>
              <Input
                placeholder="VD: Bench Press, Barbell Squat, Pull-up..."
                {...registerEx('exercise_name')}
              />
              {errorsEx.exercise_name && (
                <p className="text-[11px] text-destructive">{errorsEx.exercise_name.message}</p>
              )}
            </div>

            <div className="grid grid-cols-3 gap-2">
              <div className="space-y-1">
                <label className="text-xs font-medium">{t.workout.sets}</label>
                <Input type="number" {...registerEx('target_sets')} />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-medium">{t.workout.reps}</label>
                <Input type="number" {...registerEx('target_reps')} />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-medium">{t.workout.weight}</label>
                <Input type="number" {...registerEx('target_weight_kg')} />
              </div>
            </div>

            <div className="flex justify-end space-x-2 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsAddExOpen(false)}
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
