import type { AppLocale } from "./locale-api"

/**
 * Barcha tillarda majburiy (category, tags, site config, links va boshqalar).
 */
export type LocaleMap<T = string> = Record<AppLocale, T>

/**
 * News title — faqat uz majburiy, qolgan tillar ixtiyoriy.
 */
export type NewsTitleLocale = {
  uz: string
  uzb?: string
  ru?: string
  en?: string
}

/**
 * News description / content — barcha ixtiyoriy, fallback uz.
 */
export type NewsOptionalLocale<T = string> = {
  uz?: T
  uzb?: T
  ru?: T
  en?: T
}

/** Berilgan locale uchun qiymat oladi, bo'lmasa fallback (default uz). */
export function getLocaleValue<T>(
  map: NewsOptionalLocale<T> | LocaleMap<T> | NewsTitleLocale,
  locale: AppLocale,
  fallbackLocale: AppLocale = "uz"
): T | undefined {
  const v = map[locale] as T | undefined
  if (v !== undefined && v !== null) return v
  return map[fallbackLocale] as T | undefined
}

/** News title dan locale bo'yicha matn (uz majburiy). */
export function getTitleForLocale(
  title: NewsTitleLocale,
  locale: AppLocale
): string {
  return title[locale] ?? title.uz
}
