import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { CheckSquare, Lightbulb, Plus, Zap } from 'lucide-react'

interface QuickCaptureModalProps {
  isOpen: boolean
  onClose: () => void
  onAddTask: (values: { title: string; priority: 1 | 2 | 3 }) => Promise<any>
  onAddIdea: (values: { title: string; note?: string | null }) => Promise<any>
}

export function QuickCaptureModal({
  isOpen,
  onClose,
  onAddTask,
  onAddIdea,
}: QuickCaptureModalProps) {
  const [tab, setTab] = useState<'task' | 'idea'>('task')
  const [title, setTitle] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim()) return

    setIsSubmitting(true)
    try {
      if (tab === 'task') {
        await onAddTask({
          title: title.trim(),
          priority: 2,
        })
      } else {
        await onAddIdea({
          title: title.trim(),
        })
      }
      setTitle('')
      onClose()
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-md p-4 sm:p-6">
        <DialogHeader className="pb-2">
          <div className="flex items-center space-x-2">
            <div className="p-1.5 rounded-lg bg-primary/10 text-primary">
              <Zap className="h-4 w-4" />
            </div>
            <DialogTitle className="text-base font-bold">Quick Capture</DialogTitle>
          </div>
          <DialogDescription className="text-xs">
            Ghi nhanh công việc cần làm hoặc ý tưởng bất chợt chỉ với một thao tác.
          </DialogDescription>
        </DialogHeader>

        {/* Tab switcher */}
        <div className="grid grid-cols-2 gap-2 p-1 bg-muted/60 rounded-xl mt-2">
          <button
            type="button"
            onClick={() => setTab('task')}
            className={`flex items-center justify-center gap-1.5 py-1.5 text-xs font-semibold rounded-lg transition-all ${
              tab === 'task'
                ? 'bg-card text-foreground shadow-xs'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <CheckSquare className="h-3.5 w-3.5" />
            + New Task
          </button>

          <button
            type="button"
            onClick={() => setTab('idea')}
            className={`flex items-center justify-center gap-1.5 py-1.5 text-xs font-semibold rounded-lg transition-all ${
              tab === 'idea'
                ? 'bg-card text-amber-500 shadow-xs'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <Lightbulb className="h-3.5 w-3.5" />
            💡 New Idea
          </button>
        </div>

        {/* Minimal Capture Form */}
        <form onSubmit={handleSubmit} className="space-y-4 pt-3">
          <div className="space-y-1">
            <label className="text-xs font-medium text-muted-foreground">
              {tab === 'task' ? 'Task title' : 'Idea'}
            </label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={
                tab === 'task'
                  ? 'VD: Soạn tài liệu API, Mua cà phê...'
                  : 'VD: Ý tưởng tính năng mới, Thử AI agent...'
              }
              className="text-xs h-10"
              autoFocus
            />
          </div>

          <div className="flex justify-end space-x-2 pt-1">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onClose}
              className="text-xs h-8"
            >
              Hủy
            </Button>
            <Button
              type="submit"
              size="sm"
              disabled={isSubmitting || !title.trim()}
              className="text-xs h-8"
            >
              <Plus className="h-3.5 w-3.5 mr-1" />
              {tab === 'task' ? 'Add' : 'Save to Parking Lot'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
