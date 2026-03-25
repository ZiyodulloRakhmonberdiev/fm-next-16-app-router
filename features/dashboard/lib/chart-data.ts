import type { RawNewsItem } from '@/features/news/model'
import type { AppLocale } from '@/shared/common/lib/locale-api'

export type DashboardMonthlyPoint = {
  label: string
  views: number
  published: number
}

export type DashboardCategorySlice = {
  key: string
  name: string
  value: number
  fill: string
}

type CategoryRow = {
  slug: string
  name?: Partial<Record<AppLocale, string>>
}

function monthKey(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
}

function last12MonthKeys(): string[] {
  const keys: string[] = []
  const now = new Date()
  for (let i = 11; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
    keys.push(monthKey(d))
  }
  return keys
}

const MONTH_LABELS: Record<AppLocale, string[]> = {
  uz: ['Yan', 'Fev', 'Mar', 'Apr', 'May', 'Iyun', 'Iyul', 'Avg', 'Sen', 'Okt', 'Noy', 'Dek'],
  uzb: ['Yan', 'Fev', 'Mar', 'Apr', 'May', 'Iyun', 'Iyul', 'Avg', 'Sen', 'Okt', 'Noy', 'Dek'],
  ru: ['Янв', 'Фев', 'Мар', 'Апр', 'Май', 'Июн', 'Июл', 'Авг', 'Сен', 'Окт', 'Ноя', 'Дек'],
  en: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
}

function labelForMonthKey(monthKey: string, locale: AppLocale): string {
  const [y, m] = monthKey.split('-')
  const idx = Number.parseInt(m, 10) - 1
  const months = MONTH_LABELS[locale] ?? MONTH_LABELS.uz
  const name = months[idx] ?? m
  return `${name} ${y.slice(2)}`
}

/** Oxirgi 12 oy: chop etilgan yangiliklar soni va shu oylarda chop etilgan maqolalarning jami ko‘rishlari. */
export function buildDashboardMonthlySeries(
  news: RawNewsItem[],
  locale: AppLocale
): DashboardMonthlyPoint[] {
  const keys = last12MonthKeys()
  const views: Record<string, number> = Object.fromEntries(keys.map((k) => [k, 0]))
  const published: Record<string, number> = Object.fromEntries(keys.map((k) => [k, 0]))
  const keySet = new Set(keys)

  for (const item of news) {
    const d = new Date(item.publishedAt)
    if (Number.isNaN(d.getTime())) continue
    const k = monthKey(d)
    if (!keySet.has(k)) continue
    views[k] += item.views ?? 0
    if ((item.status ?? 'published') === 'published') {
      published[k] += 1
    }
  }

  return keys.map((k) => ({
    label: labelForMonthKey(k, locale),
    views: views[k] ?? 0,
    published: published[k] ?? 0,
  }))
}

const PIE_FILLS = [
  'var(--chart-1)',
  'var(--chart-2)',
  'var(--chart-3)',
  'var(--chart-4)',
  'var(--chart-5)',
] as const

function categoryLabel(categories: CategoryRow[], slug: string, locale: AppLocale): string {
  const row = categories.find((c) => c.slug === slug)
  if (!row) return slug
  return row.name?.[locale] ?? row.name?.uz ?? slug
}

/** Nashr etilgan yangiliklar bo‘yicha kategoriyalar ulushi (yuqori 6 + qolganlari «Boshqa»). */
export function buildDashboardCategoryPie(
  news: RawNewsItem[],
  categories: CategoryRow[],
  locale: AppLocale
): DashboardCategorySlice[] {
  const counts = new Map<string, number>()
  for (const item of news) {
    if ((item.status ?? 'published') !== 'published') continue
    const slug = item.categorySlug?.trim() || '—'
    counts.set(slug, (counts.get(slug) ?? 0) + 1)
  }

  const sorted = [...counts.entries()].sort((a, b) => b[1] - a[1])
  const maxSlices = 6
  const top = sorted.slice(0, maxSlices)
  const rest = sorted.slice(maxSlices)
  const restSum = rest.reduce((acc, [, n]) => acc + n, 0)

  const combined: [string, number][] =
    restSum > 0 ? [...top, ['__other__', restSum]] : top

  const otherLabel: Record<AppLocale, string> = {
    uz: 'Boshqa',
    uzb: 'Boshqa',
    ru: 'Прочее',
    en: 'Other',
  }

  return combined.map(([slug, value], i) => ({
    key: `cat-${i}`,
    name: slug === '__other__' ? otherLabel[locale] : categoryLabel(categories, slug, locale),
    value,
    fill: PIE_FILLS[i % PIE_FILLS.length]!,
  }))
}
