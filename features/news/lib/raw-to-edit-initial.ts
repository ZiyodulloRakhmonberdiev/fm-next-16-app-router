import type { AppLocale } from '@/shared/common/lib/locale-api'
import type { RawNewsItem, NewsStatus } from '@/features/news/model'
import type { NewsContent } from '@/features/news/model'

const LOCALES: AppLocale[] = ['uz', 'uzb', 'ru', 'en']

export type EditNewsInitialData = {
  id?: string
  translations: Record<AppLocale, { title: string; description: string }>
  slugs: Record<AppLocale, string>
  categorySlug: string
  tagSlugs: string[]
  author: string
  imageUrls: string[]
  minutes: number
  views: number
  videoUrl: string
  audioSource?: 'local' | 'external'
  audioUrl: string
  contents: Record<AppLocale, string>
  isTop: boolean
  authorsChoice: boolean
  isTrending: boolean
  isLatest: boolean
  isPopular: boolean
  isBreaking: boolean
  pushedToTelegram: boolean
  telegramMessageId?: number
  telegramMessageLink?: string
  telegramPushStatus?: 'sent' | 'failed'
  telegramPushReason?: string
  telegramLastAttemptAt?: Date
  pushedToTelegramAt?: Date
  status: NewsStatus
  publishedAt?: Date
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
    id: (raw as { _id?: string })._id,
    translations,
    slugs,
    categorySlug: raw.categorySlug ?? '',
    tagSlugs: raw.tagSlugs ?? [],
    author: raw.author ?? '',
    imageUrls: Array.isArray(raw.images) ? [...raw.images] : [],
    minutes: typeof raw.minutes === 'number' ? raw.minutes : 3,
    views: typeof raw.views === 'number' ? raw.views : 0,
    videoUrl: raw.videoUrl ?? '',
    audioSource: raw.audioSource,
    audioUrl: raw.audioUrl ?? '',
    contents,
    isTop: raw.isTop ?? false,
    authorsChoice: raw.authorsChoice ?? false,
    isTrending: raw.isTrending ?? false,
    isLatest: raw.isLatest ?? false,
    isPopular: raw.isPopular ?? false,
    isBreaking: raw.isBreaking ?? false,
    pushedToTelegram: raw.pushedToTelegram ?? false,
    telegramMessageId: raw.telegramMessageId,
    telegramMessageLink: raw.telegramMessageLink,
    telegramPushStatus: raw.telegramPushStatus,
    telegramPushReason: raw.telegramPushReason,
    telegramLastAttemptAt: raw.telegramLastAttemptAt ? new Date(raw.telegramLastAttemptAt) : undefined,
    pushedToTelegramAt: raw.pushedToTelegramAt ? new Date(raw.pushedToTelegramAt) : undefined,
    status: (raw.status ?? 'published') as NewsStatus,
    publishedAt: raw.publishedAt ? new Date(raw.publishedAt) : undefined,
  }
}
