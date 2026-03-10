import type { AppLocale } from './locale-api'

export const LOCALES: AppLocale[] = ['uz', 'uzb', 'ru', 'en']

export const LOCALE_LABELS: Record<AppLocale, string> = {
  uz: "O'zbek (lotin)",
  uzb: "O'zbek (kirill)",
  ru: 'Ruscha',
  en: 'English',
}
