import { useState, useEffect } from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Sparkles,
  CheckCircle2,
  X,
  Play,
  CheckSquare,
  Clock,
  ArrowLeft,
} from 'lucide-react'
import type { Task } from '@/types'
import { formatTimeAgo } from '@/lib/date'

interface FocusModeOverlayProps {
  task: Task
  onClose: () => void
  onToggleDefinitionItem: (itemId: string, currentCompleted: boolean) => Promise<any>
  onCompleteTask: (taskId: string) => Promise<any>
  onStartTask: (taskId: string) => Promise<any>
}

export function FocusModeOverlay({
  task,
  onClose,
  onToggleDefinitionItem,
  onCompleteTask,
  onStartTask,
}: FocusModeOverlayProps) {
  const [secondsElapsed, setSecondsElapsed] = useState(0)

  // Timer while focusing
  useEffect(() => {
    const timer = setInterval(() => {
      setSecondsElapsed((prev) => prev + 1)
    }, 1000)
    return () => clearInterval(timer)
  }, [])

  const formatSeconds = (sec: number) => {
    const m = Math.floor(sec / 60)
    const s = sec % 60
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
  }

  const dodItems = task.definition_items || []
  const dodTotal = dodItems.length
  const dodCompletedCount = dodItems.filter((i) => i.is_completed).length

  return (
    <div className="fixed inset-0 z-50 bg-background/95 backdrop-blur-md flex flex-col items-center justify-center p-4 sm:p-6 animate-in fade-in-50 duration-200">
      <div className="max-w-xl w-full space-y-6">
        {/* Top bar */}
        <div className="flex items-center justify-between">
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="text-xs text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4 mr-1.5" />
            Exit Focus
          </Button>

          {/* Focus Timer */}
          <div className="flex items-center space-x-2 text-xs font-mono px-3 py-1 rounded-full bg-primary/10 text-primary border border-primary/20">
            <Clock className="h-3.5 w-3.5 animate-pulse" />
            <span>Focus time: {formatSeconds(secondsElapsed)}</span>
          </div>
        </div>

        {/* Focusing Card */}
        <Card className="border-border/80 bg-card shadow-xl rounded-2xl overflow-hidden">
          <CardHeader className="p-6 pb-4 border-b border-border/50 bg-muted/20">
            <div className="flex items-center space-x-2 mb-2">
              <Badge
                variant="outline"
                className="bg-primary/10 text-primary border-primary/20 text-[11px] font-bold tracking-wider uppercase px-2.5 py-0.5"
              >
                <Sparkles className="h-3 w-3 mr-1" />
                FOCUSING
              </Badge>
              {task.started_at && (
                <span className="text-xs text-muted-foreground font-mono">
                  Started {formatTimeAgo(task.started_at)}
                </span>
              )}
            </div>

            <CardTitle className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
              {task.title}
            </CardTitle>

            {task.description && (
              <p className="text-sm text-muted-foreground mt-2 leading-relaxed">
                {task.description}
              </p>
            )}

            {task.success_criteria && (
              <div className="mt-4 p-3 rounded-xl bg-background/80 border border-primary/20">
                <span className="text-[10px] font-bold uppercase tracking-wider text-primary block mb-0.5">
                  What does &quot;done&quot; look like?
                </span>
                <p className="text-xs sm:text-sm font-medium italic text-foreground">
                  «{task.success_criteria}»
                </p>
              </div>
            )}
          </CardHeader>

          <CardContent className="p-6 space-y-6">
            {/* Definition of Done */}
            {dodTotal > 0 && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                    <CheckSquare className="h-4 w-4 text-primary" />
                    Definition of Done
                  </h4>
                  <Badge variant="outline" className="text-xs font-mono">
                    {dodCompletedCount} / {dodTotal}
                  </Badge>
                </div>

                <div className="space-y-2">
                  {dodItems.map((item) => (
                    <div
                      key={item.id}
                      onClick={() => onToggleDefinitionItem(item.id, item.is_completed)}
                      className={`flex items-center space-x-3 p-3 rounded-xl border cursor-pointer transition-all ${
                        item.is_completed
                          ? 'bg-muted/30 border-border/40 text-muted-foreground line-through'
                          : 'bg-card border-border/80 hover:bg-muted/40 font-medium'
                      }`}
                    >
                      <Checkbox checked={item.is_completed} className="h-4 w-4" />
                      <span className="text-xs sm:text-sm">{item.title}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Action buttons */}
            <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
              {task.status === 'TODO' && (
                <Button
                  variant="outline"
                  size="lg"
                  onClick={() => onStartTask(task.id)}
                  className="w-full sm:flex-1 h-11 text-sm font-medium"
                >
                  <Play className="h-4 w-4 mr-2 fill-current" />
                  Bắt đầu làm (Start)
                </Button>
              )}

              <Button
                variant="default"
                size="lg"
                onClick={async () => {
                  await onCompleteTask(task.id)
                  onClose()
                }}
                className="w-full sm:flex-1 h-11 text-sm font-semibold bg-emerald-600 hover:bg-emerald-700 text-white shadow-md active:scale-95 transition-all"
              >
                <CheckCircle2 className="h-4 w-4 mr-2" />
                Complete Task
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
