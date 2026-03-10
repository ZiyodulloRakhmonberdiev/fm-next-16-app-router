import type { AppLocale } from "@/shared/common/lib/locale-api"
import type { NewsTitleLocale, NewsOptionalLocale } from "@/shared/common/lib/locale-types"
import { getCategoryName, getTagNames } from "@/shared/common/lib/seed-helpers"
import type { NewsContent } from "./content"

/** Yangilik holati */
export type NewsStatus = "pending" | "published" | "cancelled" | "deleted" | "archived"

/** Seed/DB dagi yangilik — title/description/content JSON (title.uz majburiy), categorySlug, tagSlugs */
export type RawNewsItem = {
  slug: string
  title: NewsTitleLocale
  description?: NewsOptionalLocale<string>
  content?: NewsOptionalLocale<NewsContent>
  categorySlug: string
  tagSlugs: string[]
  images: string[]
  author: string
  minutes: number
  views: number
  publishedAt: Date
  createdAt?: Date
  updatedAt?: Date
  status?: NewsStatus
  type?: string
  authorsChoice?: boolean
  isTrending?: boolean
  isLatest?: boolean
  isPopular?: boolean
  isTop?: boolean
  isBreaking?: boolean
  pushedToTelegram?: boolean
  pushedToTelegramAt?: Date
  videoSource?: "youtube" | "local"
  videoUrl?: string
}

export type NewsItem = {
  slug: string
  title: string
  description?: string
  content?: NewsContent
  images: string[]
  category: string
  categorySlug: string
  tags: string[]
  publishedAt: Date
  minutes: number
  views: number
  author: string
  status?: NewsStatus
  isTop?: boolean
  type?: string
  isBreaking?: boolean
  pushedToTelegram?: boolean
  pushedToTelegramAt?: Date
  videoSource?: "youtube" | "local"
  videoUrl?: string
}

export function pickNewsForLocale(
  raw: RawNewsItem,
  locale: AppLocale
): NewsItem | null {
  const title = raw.title[locale]
  if (title === undefined || title === null || title === "") return null

  const description = raw.description?.[locale]
  const content = raw.content?.[locale]

  return {
    slug: raw.slug,
    title,
    ...(description !== undefined && description !== null && description !== ""
      ? { description }
      : {}),
    ...(content !== undefined && content !== null ? { content } : {}),
    images: raw.images,
    category: getCategoryName(raw.categorySlug, locale),
    categorySlug: raw.categorySlug,
    tags: getTagNames(raw.tagSlugs, locale),
    publishedAt: raw.publishedAt,
    minutes: raw.minutes,
    views: raw.views,
    author: raw.author,
    status: raw.status ?? "published",
    isTop: raw.isTop ?? false,
    type: raw.type,
    isBreaking: raw.isBreaking ?? false,
    pushedToTelegram: raw.pushedToTelegram,
    pushedToTelegramAt: raw.pushedToTelegramAt,
    videoSource: raw.videoSource,
    videoUrl: raw.videoUrl,
  }
}

/** Raw ro'yxatni berilgan locale uchun NewsItem[] qilib qaytaradi (title bo'lmagan yangiliklar chiqariladi) */
export function getNewsListForLocale(
  rawList: RawNewsItem[],
  locale: AppLocale
): NewsItem[] {
  return rawList
    .map((raw) => pickNewsForLocale(raw, locale))
    .filter((item): item is NewsItem => item !== null)
}

/** Client (ommaviy) saytda ko'rsatish uchun — faqat statusi "published" bo'lgan yangiliklar */
export function filterPublishedRawNews(rawList: RawNewsItem[]): RawNewsItem[] {
  return rawList.filter((r) => (r.status ?? "published") === "published")
}

/** Client saytda ro'yxatlar uchun — faqat published yangiliklar, berilgan locale da */
export function getPublishedNewsListForLocale(
  rawList: RawNewsItem[],
  locale: AppLocale
): NewsItem[] {
  return getNewsListForLocale(filterPublishedRawNews(rawList), locale)
}

/** Faqat matnli yangiliklar (image/video yo'q va type=text). */
export function isTextOnlyRawNews(item: RawNewsItem): boolean {
  const hasVideo = Boolean(item.videoSource && item.videoUrl)
  const hasImages = Array.isArray(item.images) && item.images.length > 0
  return item.type === "text" && !hasVideo && !hasImages
}

/** Rasmli/video cardlarda ko'rsatish mumkin bo'lgan yangiliklar. */
export function isVisualRawNews(item: RawNewsItem): boolean {
  return !isTextOnlyRawNews(item)
}
