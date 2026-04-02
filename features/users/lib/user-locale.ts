import type { AppLocale } from '@/shared/common/lib/locale-api'
import type { LocaleMap } from '@/shared/common/lib/locale-types'

export type LocaleText = string | LocaleMap | null | undefined

function asNonEmptyString(value: unknown): string | null {
  if (typeof value !== 'string') return null
  const trimmed = value.trim()
  return trimmed ? trimmed : null
}

export function pickUserLocaleText(
  value: LocaleText,
  locale: AppLocale = 'uz',
  fallbackLocale: AppLocale = 'uz'
): string {
  if (typeof value === 'string') return value.trim()
  if (!value || typeof value !== 'object') return ''

  const candidate = asNonEmptyString(value[locale])
  if (candidate) return candidate

  const fallback = asNonEmptyString(value[fallbackLocale])
  if (fallback) return fallback

  const order: AppLocale[] = ['uz', 'uzb', 'ru', 'en']
  for (const loc of order) {
    const next = asNonEmptyString(value[loc])
    if (next) return next
  }
  return ''
}
