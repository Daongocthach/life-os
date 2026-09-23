import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { useDialogStore } from '@/stores/dialogStore'
import { useI18nStore } from '@/stores/i18nStore'

export function GlobalConfirmDialog() {
  const { isOpen, options, handleConfirm, handleCancel } = useDialogStore()
  const { t } = useI18nStore()

  return (
    <AlertDialog open={isOpen} onOpenChange={(open) => !open && handleCancel()}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{options.title}</AlertDialogTitle>
          {options.description && (
            <AlertDialogDescription>{options.description}</AlertDialogDescription>
          )}
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={handleCancel}>
            {options.cancelText || t.common.cancel}
          </AlertDialogCancel>
          <AlertDialogAction
            className={options.variant === 'destructive' ? 'bg-destructive hover:bg-destructive/90 text-destructive-foreground' : ''}
            onClick={handleConfirm}
          >
            {options.confirmText || t.common.confirm}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
