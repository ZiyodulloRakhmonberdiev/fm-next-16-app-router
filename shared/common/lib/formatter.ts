export type DateInput = Date | string | number

/** next-intl locale kodlari (en, ru, uz, uzb) */
export type AppLocale = "en" | "ru" | "uz" | "uzb"

const MONTH_NAMES: Record<AppLocale, string[]> = {
  en: [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December",
  ],
  ru: [
    "январь", "февраль", "март", "апрель", "май", "июнь",
    "июль", "август", "сентябрь", "октябрь", "ноябрь", "декабрь",
  ],
  uz: [
    "yanvar", "fevral", "mart", "aprel", "may", "iyun",
    "iyul", "avgust", "sentabr", "oktabr", "noyabr", "dekabr",
  ],
  uzb: [
    "январ", "феврал", "март", "апрел", "май", "июн",
    "июл", "август", "сентябр", "октябр", "ноябр", "декабр",
  ],
}

function toDate(value: DateInput): Date {
  return value instanceof Date ? value : new Date(value)
}

/**
 * Sana ni tanlangan locale bo‘yicha formatlaydi (SSR va client bir xil — hydration xatosiz).
 * @param date - sana
 * @param locale - next-intl locale: en | ru | uz | uzb
 */
export function formatDate(
  date: DateInput,
  locale: AppLocale | string = "uz"
): string {
  const d = toDate(date)
  const day = d.getDate()
  const month = d.getMonth()
  const year = d.getFullYear()

  const localeKey = (locale in MONTH_NAMES ? locale : "uz") as AppLocale
  const monthNames = MONTH_NAMES[localeKey]
  const monthName = monthNames[month]

  return `${day}-${monthName}, ${year}`
}

/**
 * Sana + soat:daqiqa (SSR va client bir xil — UTC).
 * @example formatDateTimeLocale(...) → "26-iyul, 2024, 14:30"
 */
export function formatDateTimeLocale(
  date: DateInput,
  locale: AppLocale | string = "uz"
): string {
  const d = toDate(date)
  const day = d.getUTCDate()
  const month = d.getUTCMonth()
  const year = d.getUTCFullYear()
  const h = d.getUTCHours()
  const m = d.getUTCMinutes()
  const pad = (n: number) => String(n).padStart(2, "0")

  const localeKey = (locale in MONTH_NAMES ? locale : "uz") as AppLocale
  const monthNames = MONTH_NAMES[localeKey]
  const monthName = monthNames[month]

  return `${day}-${monthName}, ${year}, ${pad(h)}:${pad(m)}`
}

/**
 * Intl orqali formatlash (faqat client yoki locale serverda ham qo‘llab-quvvatlangan bo‘lsa).
 */
export function formatDateIntl(
  date: DateInput,
  locale: string = "uz-UZ",
  options?: Intl.DateTimeFormatOptions
): string {
  return toDate(date).toLocaleDateString(locale, {
    day: "numeric",
    month: "long",
    year: "numeric",
    ...options,
  })
}

export function formatDateTime(
  date: DateInput,
  locale: string = "uz-UZ",
  options?: Intl.DateTimeFormatOptions
): string {
  return toDate(date).toLocaleDateString(locale, {
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    ...options,
  })
}

/**
 * Qisqa sana (kun.oy.yil).
 * @example formatDateShort("2024-03-15") → "15.03.2024"
 */
export function formatDateShort(
  date: DateInput,
  locale: string = "uz-UZ"
): string {
  return toDate(date).toLocaleDateString(locale, {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  })
}

/**
 * ISO string qaytaradi (datetime attribute uchun).
 */
export function formatDateISO(date: DateInput): string {
  return toDate(date).toISOString()
}
