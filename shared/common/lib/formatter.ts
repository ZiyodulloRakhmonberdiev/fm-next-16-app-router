export type DateInput = Date | string | number

/** next-intl locale kodlari (en, ru, uz, uzb) */
export type AppLocale = "en" | "ru" | "uz" | "uzb"

const TASHKENT_TIMEZONE = "Asia/Tashkent"

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

function getTashkentParts(date: DateInput) {
  const d = toDate(date)
  // SSR/client bir xil bo‘lishi uchun local timezone emas, explicit Tashkent ishlatamiz.
  const dateParts = new Intl.DateTimeFormat("en-US", {
    timeZone: TASHKENT_TIMEZONE,
    year: "numeric",
    month: "numeric",
    day: "numeric",
  }).formatToParts(d)

  const timeParts = new Intl.DateTimeFormat("en-US", {
    timeZone: TASHKENT_TIMEZONE,
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).formatToParts(d)

  const map = new Map(dateParts.map((p) => [p.type, p.value]))
  const mapTime = new Map(timeParts.map((p) => [p.type, p.value]))

  const year = Number(map.get("year"))
  const month = Number(map.get("month")) // 1-12
  const day = Number(map.get("day"))
  const hour = Number(mapTime.get("hour"))
  const minute = Number(mapTime.get("minute"))

  return { year, month, day, hour, minute }
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
  const localeKey = (locale in MONTH_NAMES ? locale : "uz") as AppLocale
  const monthNames = MONTH_NAMES[localeKey]
  const { year, month, day } = getTashkentParts(date)
  const monthName = monthNames[month - 1]

  return `${day}-${monthName}, ${year}`
}

/**
 * Sana + soat:daqiqa (SSR va client bir xil — Tashkent).
 * @example formatDateTimeLocale(...) → "26-iyul, 2024, 14:30"
 */
export function formatDateTimeLocale(
  date: DateInput,
  locale: AppLocale | string = "uz"
): string {
  const { year, month, day, hour, minute } = getTashkentParts(date)
  const pad = (n: number) => String(n).padStart(2, "0")

  const localeKey = (locale in MONTH_NAMES ? locale : "uz") as AppLocale
  const monthNames = MONTH_NAMES[localeKey]
  const monthName = monthNames[month - 1]

  return `${day}-${monthName}, ${year}, ${pad(hour)}:${pad(minute)}`
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
