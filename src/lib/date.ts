import { format, parseISO, isToday, isThisWeek, isThisMonth } from 'date-fns'
import { vi as viLocale } from 'date-fns/locale/vi'
import { enUS } from 'date-fns/locale/en-US'
import { useI18nStore } from '@/stores/i18nStore'

export function formatDate(
  date: string | Date | null | undefined,
  formatStr: string = 'dd/MM/yyyy'
): string {
  if (!date) return ''
  try {
    const d = typeof date === 'string' ? parseISO(date) : date
    const lang = useI18nStore.getState().language
    const locale = lang === 'vi' ? viLocale : enUS
    return format(d, formatStr, { locale })
  } catch {
    return String(date)
  }
}

export function formatCurrency(amount: number): string {
  const lang = useI18nStore.getState().language
  return new Intl.NumberFormat(lang === 'vi' ? 'vi-VN' : 'en-US', {
    style: 'currency',
    currency: 'VND',
    maximumFractionDigits: 0,
  }).format(amount)
}

export { isToday, isThisWeek, isThisMonth }
