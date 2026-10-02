import { useState } from 'react'
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
import {
  Lightbulb,
  Plus,
  ArrowRight,
  Trash2,
  XCircle,
  Edit2,
} from 'lucide-react'
import type { TodoIdea } from '@/types'
import { formatDate } from '@/lib/date'

interface ParkingLotSectionProps {
  ideas: TodoIdea[]
  onAddIdea: (values: { title: string; note?: string | null }) => Promise<any>
  onUpdateIdea: (ideaId: string, updates: Partial<TodoIdea>) => Promise<any>
  onDiscardIdea: (ideaId: string) => Promise<any>
  onDeleteIdea: (ideaId: string) => Promise<any>
  onConvertIdeaToTask: (ideaId: string, options?: { priority?: 1 | 2 | 3; isTodayPriority?: boolean }) => Promise<any>
}

export function ParkingLotSection({
  ideas,
  onAddIdea,
  onUpdateIdea,
  onDiscardIdea,
  onDeleteIdea,
  onConvertIdeaToTask,
}: ParkingLotSectionProps) {
  const [isAdding, setIsAdding] = useState(false)
  const [newTitle, setNewTitle] = useState('')
  const [newNote, setNewNote] = useState('')
  const [editingIdea, setEditingIdea] = useState<TodoIdea | null>(null)
  const [filter, setFilter] = useState<'active' | 'all'>('active')

  const activeIdeas = ideas.filter((i) => i.status === 'IDEA')
  const displayedIdeas = filter === 'active' ? activeIdeas : ideas

  const handleCreateIdea = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newTitle.trim()) return
    await onAddIdea({
      title: newTitle.trim(),
      note: newNote.trim() || null,
    })
    setNewTitle('')
    setNewNote('')
    setIsAdding(false)
  }

  const handleSaveEdit = async () => {
    if (!editingIdea) return
    await onUpdateIdea(editingIdea.id, {
      title: editingIdea.title.trim(),
      note: editingIdea.note?.trim() || null,
    })
    setEditingIdea(null)
  }

  return (
    <>
      <Card className="border-border/80 bg-card shadow-sm">
        <CardHeader className="py-3 px-4 sm:px-5 border-b border-border/50 flex flex-row items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="p-1.5 rounded-lg bg-amber-500/10 text-amber-500">
              <Lightbulb className="h-4 w-4" />
            </div>
            <div>
              <CardTitle className="text-sm sm:text-base font-bold tracking-tight flex items-center gap-2">
                💡 PARKING LOT
              </CardTitle>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Button
              variant={filter === 'active' ? 'secondary' : 'ghost'}
              size="sm"
              onClick={() => setFilter(filter === 'active' ? 'all' : 'active')}
              className="h-7 text-[11px] px-2 rounded-lg"
            >
              {filter === 'active' ? `Active (${activeIdeas.length})` : `Tất cả (${ideas.length})`}
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsAdding(!isAdding)}
              className="h-7 text-xs px-2.5 rounded-lg border-dashed hover:border-solid hover:bg-amber-500/10 hover:text-amber-600 transition-colors"
            >
              <Plus className="h-3 w-3 mr-1" />
              Capture idea
            </Button>
          </div>
        </CardHeader>

        <CardContent className="p-3 sm:p-4 space-y-3">
          {/* Quick capture form inline */}
          {isAdding && (
            <form
              onSubmit={handleCreateIdea}
              className="p-3 rounded-xl border border-amber-500/30 bg-amber-500/[0.03] space-y-2 animate-in fade-in-50"
            >
              <Input
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                placeholder="Ý tưởng mới nảy ra (VD: Làm pet cho shop, Thử AI voice)..."
                className="text-xs h-9 bg-background/80"
                autoFocus
              />
              <Input
                value={newNote}
                onChange={(e) => setNewNote(e.target.value)}
                placeholder="Ghi chú chi tiết (nếu có)..."
                className="text-xs h-8 bg-background/80"
              />
              <div className="flex justify-end gap-2 pt-1">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsAdding(false)}
                  className="h-7 text-xs px-2.5"
                >
                  Hủy
                </Button>
                <Button
                  type="submit"
                  size="sm"
                  className="h-7 text-xs px-3 bg-amber-600 hover:bg-amber-700 text-white"
                >
                  <Plus className="h-3 w-3 mr-1" /> Lưu ý tưởng
                </Button>
              </div>
            </form>
          )}

          {/* Ideas list */}
          {displayedIdeas.length === 0 ? (
            <div className="py-6 text-center text-xs text-muted-foreground">
              <p>Chưa có ý tưởng nào trong Parking Lot.</p>
              <p className="text-[11px] text-muted-foreground/80 mt-0.5">
                Khi đang làm việc mà nảy ra ý tưởng mới, lưu vào đây để không bị phân tâm!
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {displayedIdeas.map((idea) => {
                const isConverted = idea.status === 'CONVERTED'
                const isDiscarded = idea.status === 'DISCARDED'

                return (
                  <div
                    key={idea.id}
                    className={`group p-2.5 sm:p-3 rounded-xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 ${
                      isConverted
                        ? 'bg-muted/20 border-border/40 opacity-70'
                        : isDiscarded
                        ? 'bg-muted/10 border-border/30 opacity-50 line-through'
                        : 'bg-card border-border/70 hover:border-amber-500/40 hover:shadow-xs'
                    }`}
                  >
                    <div className="flex items-start space-x-2.5 flex-1 min-w-0">
                      <span className="text-amber-500 mt-0.5 font-bold flex-shrink-0">•</span>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center space-x-2 flex-wrap">
                          <p
                            className={`text-xs font-medium text-foreground ${
                              isDiscarded ? 'line-through text-muted-foreground' : ''
                            }`}
                          >
                            {idea.title}
                          </p>
                          {isConverted && (
                            <Badge
                              variant="outline"
                              className="text-[9px] px-1.5 py-0 h-4 border-emerald-500/30 text-emerald-600 dark:text-emerald-400 font-mono"
                            >
                              CONVERTED
                            </Badge>
                          )}
                          {isDiscarded && (
                            <Badge
                              variant="outline"
                              className="text-[9px] px-1.5 py-0 h-4 text-muted-foreground font-mono"
                            >
                              DISCARDED
                            </Badge>
                          )}
                        </div>

                        {idea.note && (
                          <p className="text-[11px] text-muted-foreground mt-0.5 truncate">
                            {idea.note}
                          </p>
                        )}
                        <span className="text-[10px] text-muted-foreground/60 mt-0.5 block">
                          {formatDate(idea.created_at, 'dd/MM/yyyy HH:mm')}
                        </span>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center justify-end space-x-1 flex-shrink-0">
                      {!isConverted && !isDiscarded && (
                        <>
                          <Button
                            variant="default"
                            size="sm"
                            onClick={() => onConvertIdeaToTask(idea.id)}
                            className="h-7 text-[11px] px-2.5 rounded-lg bg-primary hover:bg-primary/90"
                            title="Convert to Task"
                          >
                            <ArrowRight className="h-3 w-3 mr-1" />
                            Convert to task
                          </Button>

                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => onDiscardIdea(idea.id)}
                            className="h-7 w-7 text-muted-foreground hover:text-amber-600 rounded-lg"
                            title="Discard"
                          >
                            <XCircle className="h-3.5 w-3.5" />
                          </Button>
                        </>
                      )}

                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setEditingIdea(idea)}
                        className="h-7 w-7 text-muted-foreground hover:text-foreground rounded-lg"
                        title="Edit"
                      >
                        <Edit2 className="h-3 w-3" />
                      </Button>

                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => onDeleteIdea(idea.id)}
                        className="h-7 w-7 text-muted-foreground hover:text-destructive rounded-lg opacity-60 group-hover:opacity-100"
                        title="Delete"
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Edit Idea Dialog */}
      <Dialog open={!!editingIdea} onOpenChange={(open) => !open && setEditingIdea(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Lightbulb className="h-4 w-4 text-amber-500" />
              Chỉnh sửa ý tưởng
            </DialogTitle>
            <DialogDescription>Cập nhật tiêu đề hoặc ghi chú của ý tưởng</DialogDescription>
          </DialogHeader>

          {editingIdea && (
            <div className="space-y-3 mt-2">
              <div className="space-y-1">
                <label className="text-xs font-medium">Tiêu đề</label>
                <Input
                  value={editingIdea.title}
                  onChange={(e) => setEditingIdea({ ...editingIdea, title: e.target.value })}
                  className="text-xs"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-medium">Ghi chú</label>
                <Input
                  value={editingIdea.note || ''}
                  onChange={(e) => setEditingIdea({ ...editingIdea, note: e.target.value })}
                  className="text-xs"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setEditingIdea(null)}
                  className="text-xs"
                >
                  Hủy
                </Button>
                <Button size="sm" onClick={handleSaveEdit} className="text-xs">
                  Lưu
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  )
}
