import { create } from 'zustand'

interface PrivacyState {
  isMasked: boolean
  toggleMask: () => void
  setMasked: (masked: boolean) => void
}

export const usePrivacyStore = create<PrivacyState>((set) => ({
  isMasked: true, // Mặc định là che lại số tiền
  toggleMask: () => set((state) => ({ isMasked: !state.isMasked })),
  setMasked: (isMasked) => set({ isMasked }),
}))
