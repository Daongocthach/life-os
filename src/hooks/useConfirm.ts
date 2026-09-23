import { useDialogStore, type ConfirmOptions } from '@/stores/dialogStore'

export function useConfirm() {
  const openConfirm = useDialogStore((state) => state.openConfirm)

  return (options: ConfirmOptions) => {
    return openConfirm(options)
  }
}
