import type { AppLocale } from '@/shared/common/lib/locale-api'
import type { RawNewsItem, NewsStatus } from '@/features/news/model'
import type { NewsContent } from '@/features/news/model'

const LOCALES: AppLocale[] = ['uz', 'uzb', 'ru', 'en']

/** Edit formasi uchun boshlang'ich ma'lumot (serverdan yig'iladi) */
export type EditNewsInitialData = {
  translations: Record<AppLocale, { title: string; description: string }>
  slugs: Record<AppLocale, string>
  categorySlug: string
  tagSlugs: string[]
  author: string
  imageUrls: string[]
  minutes: number
  videoUrl: string
  contents: Record<AppLocale, string>
  isTop: boolean
  authorsChoice: boolean
  pushedToTelegram: boolean
  status: NewsStatus
}

function contentToStr(value: NewsContent | undefined): string {
  if (value === undefined || value === null) return ''
  if (typeof value === 'string') return value
  return JSON.stringify(value)
}

export function rawNewsToEditInitialData(raw: RawNewsItem): EditNewsInitialData {
  const translations: Record<AppLocale, { title: string; description: string }> = {} as Record<
    AppLocale,
    { title: string; description: string }
  >
  const slugs: Record<AppLocale, string> = {} as Record<AppLocale, string>
  const contents: Record<AppLocale, string> = {} as Record<AppLocale, string>

  for (const loc of LOCALES) {
    const title = (raw.title as Record<string, string | undefined>)?.[loc] ?? ''
    const desc = (raw.description as Record<string, string | undefined> | undefined)?.[loc] ?? ''
    translations[loc] = { title, description: desc }
    slugs[loc] = raw.slug
    const content = (raw.content as Record<string, NewsContent> | undefined)?.[loc]
    contents[loc] = contentToStr(content)
  }

  return {
    translations,
    slugs,
    categorySlug: raw.categorySlug ?? '',
    tagSlugs: raw.tagSlugs ?? [],
    author: raw.author ?? '',
    imageUrls: Array.isArray(raw.images) ? [...raw.images] : [],
    minutes: typeof raw.minutes === 'number' ? raw.minutes : 3,
    videoUrl: raw.videoUrl ?? '',
    contents,
    isTop: raw.isTop ?? false,
    authorsChoice: raw.authorsChoice ?? false,
    pushedToTelegram: raw.pushedToTelegram ?? false,
    status: (raw.status ?? 'published') as NewsStatus,
  }
}
