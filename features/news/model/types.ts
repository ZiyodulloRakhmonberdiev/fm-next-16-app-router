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
  /** Telegramga yuborilganmi */
  pushedToTelegram?: boolean
  /** Telegramga yuborilgan sana */
  pushedToTelegramAt?: Date
  videoSource?: "youtube" | "local"
  videoUrl?: string
}

/** Frontend/API da ko'rsatiladigan yangilik — bitta til uchun (description/content ixtiyoriy) */
export type NewsItem = {
  slug: string
  title: string
  /** Tanlangan tilda bo'lmasa ko'rsatilmaydi */
  description?: string
  /** Tanlangan tilda bo'lmasa ko'rsatilmaydi */
  content?: NewsContent
  images: string[]
  category: string
  categorySlug: string
  tags: string[]
  publishedAt: Date
  minutes: number
  views: number
  author: string
  /** Dashboard/filter uchun */
  status?: NewsStatus
  isTop?: boolean
  type?: string
  pushedToTelegram?: boolean
  pushedToTelegramAt?: Date
  videoSource?: "youtube" | "local"
  videoUrl?: string
}

/**
 * Bitta raw yangilikni berilgan locale uchun NewsItem qilib qaytaradi.
 * Title tanlangan tilda bo'lmasa null qaytaradi (yangilik ko'rsatilmaydi).
 * Description va content faqat shu til uchun mavjud bo'lsa qo'shiladi, fallback yo'q.
 */
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
