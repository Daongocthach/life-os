import { create } from 'zustand'

export interface ConfirmOptions {
  title: string
  description?: string
  confirmText?: string
  cancelText?: string
  variant?: 'default' | 'destructive'
  onConfirm?: () => void
  onCancel?: () => void
}

interface DialogState {
  isOpen: boolean
  options: ConfirmOptions
  resolvePromise: ((value: boolean) => void) | null
  openConfirm: (options: ConfirmOptions) => Promise<boolean>
  handleConfirm: () => void
  handleCancel: () => void
}

export const useDialogStore = create<DialogState>((set, get) => ({
  isOpen: false,
  options: {
    title: '',
    description: '',
  },
  resolvePromise: null,

  openConfirm: (options: ConfirmOptions) => {
    return new Promise<boolean>((resolve) => {
      set({
        isOpen: true,
        options,
        resolvePromise: resolve,
      })
    })
  },

  handleConfirm: () => {
    const { resolvePromise, options } = get()
    if (options.onConfirm) options.onConfirm()
    if (resolvePromise) resolvePromise(true)
    set({ isOpen: false, resolvePromise: null })
  },

  handleCancel: () => {
    const { resolvePromise, options } = get()
    if (options.onCancel) options.onCancel()
    if (resolvePromise) resolvePromise(false)
    set({ isOpen: false, resolvePromise: null })
  },
}))
