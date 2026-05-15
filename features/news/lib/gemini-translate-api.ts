'use client'

import type { AppLocale } from '@/shared/common/lib/locale-api'

export type GeminiTranslateField = 'title' | 'description' | 'content'

export const TRANSLATION_LOCALES: AppLocale[] = ['uz', 'uzb', 'ru', 'en']

export type GeminiTranslateResult = Partial<Record<AppLocale, string>>

/** Manba til: avvalo aktiv tab, keyin uz → uzb → ru → en. */
export function pickTranslationSource(
  values: Partial<Record<AppLocale, string>>,
  preferredLocale?: AppLocale
): { locale: AppLocale; text: string } | null {
  const order: AppLocale[] = preferredLocale
    ? [preferredLocale, ...TRANSLATION_LOCALES.filter((l) => l !== preferredLocale)]
    : [...TRANSLATION_LOCALES]

  for (const loc of order) {
    const text = values[loc]?.trim() ?? ''
    if (text) return { locale: loc, text }
  }
  return null
}

/** Manba tildan boshqa, hali bo‘sh qolgan tillar. */
export function getEmptyTargetLocales(
  values: Partial<Record<AppLocale, string>>,
  sourceLocale: AppLocale
): AppLocale[] {
  return TRANSLATION_LOCALES.filter((loc) => {
    if (loc === sourceLocale) return false
    return !(values[loc]?.trim())
  })
}

/** Faqat bo‘sh maydonlarga yangi qiymotlarni qo‘yadi. */
export function applyEmptyLocaleUpdates<T extends Record<AppLocale, string>>(
  current: T,
  updates: Partial<Record<AppLocale, string>>
): T {
  const next = { ...current }
  for (const loc of TRANSLATION_LOCALES) {
    const val = updates[loc]?.trim()
    if (val && !(current[loc]?.trim())) {
      next[loc] = val
    }
  }
  return next
}

export async function requestGeminiTranslation(params: {
  sourceLocale: AppLocale
  sourceText: string
  fieldType: GeminiTranslateField
  targetLocales: AppLocale[]
}): Promise<GeminiTranslateResult> {
  if (params.targetLocales.length === 0) {
    return {}
  }

  const res = await fetch('/api/admin/translate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      sourceLocale: params.sourceLocale,
      sourceText: params.sourceText,
      fieldType: params.fieldType,
      targetLocales: params.targetLocales,
    }),
  })

  const data = (await res.json()) as {
    translations?: GeminiTranslateResult
    error?: string
    code?: string
  }

  if (!res.ok) {
    throw new Error(data.error ?? 'Tarjima amalga oshmadi')
  }

  if (!data.translations || typeof data.translations !== 'object') {
    throw new Error('Tarjima javobi noto‘g‘ri')
  }

  return data.translations
}
