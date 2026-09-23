import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import {
  Utensils,
  Plus,
  Trash2,
  Flame,
  Calendar,
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
import { useMeals } from '@/hooks/useMeals'
import { useI18n } from '@/hooks/useI18n'
import { useConfirm } from '@/hooks/useConfirm'
import { mealSchema, type MealFormValues } from '@/schemas/mealSchema'
import { format, addDays, startOfWeek } from 'date-fns'

export function MealsView() {
  const { t } = useI18n()
  const confirm = useConfirm()
  const { dailyMeals, addMeal, deleteDailyMeal } = useMeals()

  // Generate 7 days of the current week (Monday to Sunday)
  const today = new Date()
  const weekStart = startOfWeek(today, { weekStartsOn: 1 })
  const weekDays = Array.from({ length: 7 }).map((_, i) => {
    const d = addDays(weekStart, i)
    return {
      dateStr: format(d, 'yyyy-MM-dd'),
      dayName: ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'][i],
      formattedDate: format(d, 'dd/MM'),
      isToday: format(d, 'yyyy-MM-dd') === format(today, 'yyyy-MM-dd'),
    }
  })

  const [selectedDate, setSelectedDate] = useState<string>(format(today, 'yyyy-MM-dd'))
  const [isAddMealOpen, setIsAddMealOpen] = useState(false)

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm<MealFormValues>({
    resolver: zodResolver(mealSchema),
    defaultValues: {
      meal_date: selectedDate,
      name: '',
      meal_type: 'lunch',
      calories_kcal: 500,
      protein_g: 30,
      carbs_g: 50,
      fat_g: 15,
      notes: '',
    },
  })

  const onMealSubmit = async (values: MealFormValues) => {
    await addMeal({ ...values, meal_date: selectedDate })
    reset()
    setIsAddMealOpen(false)
  }

  const handleDelete = async (id: string, name: string) => {
    const ok = await confirm({
      title: t.meals.confirmDelete,
      description: `Món ăn "${name}" sẽ bị xóa khỏi thực đơn ngày này.`,
      variant: 'destructive',
      confirmText: t.common.delete,
      cancelText: t.common.cancel,
    })
    if (ok) {
      await deleteDailyMeal(id)
    }
  }

  // Filter meals for the selected date
  const selectedDayMeals = dailyMeals.filter((m) => m.meal_date === selectedDate)

  const mealTypes = [
    { type: 'breakfast', label: t.meals.breakfast },
    { type: 'lunch', label: t.meals.lunch },
    { type: 'dinner', label: t.meals.dinner },
    { type: 'snack', label: t.meals.snack },
  ]

  return (
    <div className="space-y-6 pb-24">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight">{t.meals.title}</h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
            {t.meals.subtitle}
          </p>
        </div>

        <Button
          size="sm"
          onClick={() => {
            setValue('meal_date', selectedDate)
            setIsAddMealOpen(true)
          }}
          className="text-xs"
        >
          <Plus className="h-3.5 w-3.5 mr-1" />
          {t.meals.addMeal}
        </Button>
      </div>

      {/* Weekday Selector Tabs (T2 -> CN) */}
      <div className="grid grid-cols-4 sm:grid-cols-7 gap-2">
        {weekDays.map((wd) => {
          const isSelected = wd.dateStr === selectedDate
          const count = dailyMeals.filter((m) => m.meal_date === wd.dateStr).length

          return (
            <button
              key={wd.dateStr}
              onClick={() => setSelectedDate(wd.dateStr)}
              className={`p-3 rounded-xl border text-center transition-all relative ${
                isSelected
                  ? 'border-primary bg-primary text-primary-foreground shadow-sm'
                  : 'border-border/70 bg-card hover:bg-muted/40 text-foreground'
              }`}
            >
              <span className="text-xs font-bold block">{wd.dayName}</span>
              <span className={`text-[10px] block mt-0.5 ${isSelected ? 'text-primary-foreground/80' : 'text-muted-foreground'}`}>
                {wd.formattedDate}
              </span>
              {count > 0 && (
                <span
                  className={`absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full ${
                    isSelected ? 'bg-primary-foreground' : 'bg-emerald-500'
                  }`}
                />
              )}
              {wd.isToday && (
                <span className="block mt-1 text-[9px] font-semibold uppercase tracking-wider underline">
                  Hôm nay
                </span>
              )}
            </button>
          )
        })}
      </div>

      {/* Meals grouped by meal_type */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {mealTypes.map((mt) => {
          const mealsOfType = selectedDayMeals.filter((m) => m.meal_type === mt.type)
          return (
            <Card key={mt.type} className="border-border/80">
              <CardHeader className="py-3 px-4 border-b border-border/50 flex flex-row items-center justify-between">
                <CardTitle className="text-sm font-semibold flex items-center gap-1.5">
                  <Utensils className="h-3.5 w-3.5 text-primary" />
                  {mt.label}
                </CardTitle>
                <Badge variant="outline" className="text-[10px] h-5">
                  {mealsOfType.length} món
                </Badge>
              </CardHeader>

              <CardContent className="p-4 space-y-2">
                {mealsOfType.length === 0 ? (
                  <p className="text-xs text-muted-foreground py-3 text-center">
                    Chưa lên món cho bữa này
                  </p>
                ) : (
                  mealsOfType.map((dm) => (
                    <div
                      key={dm.id}
                      className="p-3 rounded-xl border border-border/50 bg-muted/20 flex items-center justify-between"
                    >
                      <div>
                        <span className="text-xs font-bold text-foreground block">
                          {dm.meal?.name || dm.note || 'Món ăn'}
                        </span>
                        <div className="flex items-center space-x-2 text-[10px] text-muted-foreground mt-0.5">
                          <span className="flex items-center text-amber-500 font-medium">
                            <Flame className="h-3 w-3 mr-0.5" />
                            {dm.meal?.calories_kcal || 0} kcal
                          </span>
                          <span>• P: {dm.meal?.protein_g || 0}g</span>
                          <span>• C: {dm.meal?.carbs_g || 0}g</span>
                          <span>• F: {dm.meal?.fat_g || 0}g</span>
                        </div>
                      </div>

                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(dm.id, dm.meal?.name || 'Món ăn')}
                        className="h-7 w-7 text-muted-foreground hover:text-destructive"
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Add Meal Dialog */}
      <Dialog open={isAddMealOpen} onOpenChange={setIsAddMealOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t.meals.addMeal}</DialogTitle>
            <DialogDescription>
              Thêm món vào thực đơn ngày {selectedDate}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit(onMealSubmit)} className="space-y-4 mt-2">
            <div className="space-y-1">
              <label className="text-xs font-medium">{t.meals.mealName}</label>
              <Input
                placeholder="VD: Ức gà áp chảo, Cơm gạo lứt, Salad cá ngừ..."
                {...register('name')}
              />
              {errors.name && (
                <p className="text-[11px] text-destructive">{errors.name.message}</p>
              )}
            </div>

            <div className="space-y-1">
              <label className="text-xs font-medium">Bữa ăn</label>
              <select
                {...register('meal_type')}
                className="w-full h-10 rounded-xl border border-input bg-background/80 px-3 text-xs"
              >
                <option value="breakfast">{t.meals.breakfast}</option>
                <option value="lunch">{t.meals.lunch}</option>
                <option value="dinner">{t.meals.dinner}</option>
                <option value="snack">{t.meals.snack}</option>
              </select>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <div className="space-y-1">
                <label className="text-[11px] font-medium">{t.meals.calories}</label>
                <Input type="number" {...register('calories_kcal')} />
              </div>
              <div className="space-y-1">
                <label className="text-[11px] font-medium">{t.meals.protein}</label>
                <Input type="number" {...register('protein_g')} />
              </div>
              <div className="space-y-1">
                <label className="text-[11px] font-medium">{t.meals.carbs}</label>
                <Input type="number" {...register('carbs_g')} />
              </div>
              <div className="space-y-1">
                <label className="text-[11px] font-medium">{t.meals.fat}</label>
                <Input type="number" {...register('fat_g')} />
              </div>
            </div>

            <div className="flex justify-end space-x-2 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsAddMealOpen(false)}
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
