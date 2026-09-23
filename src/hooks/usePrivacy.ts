import { usePrivacyStore } from '@/stores/privacyStore'
import { formatCurrency } from '@/lib/date'

export function usePrivacy() {
  const { isMasked, toggleMask, setMasked } = usePrivacyStore()

  const maskCurrency = (amount: number, prefix: string = ''): string => {
    if (isMasked) {
      return '••••••'
    }
    return `${prefix}${formatCurrency(amount)}`
  }

  return {
    isMasked,
    toggleMask,
    setMasked,
    maskCurrency,
  }
}
