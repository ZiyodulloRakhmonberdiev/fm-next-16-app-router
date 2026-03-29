import type { AppLocale } from "@/shared/common/lib/locale-api"
import type { NewsTitleLocale, NewsOptionalLocale } from "@/shared/common/lib/locale-types"
import { LOCALES } from "@/shared/common/lib/locale-constants"
import { getCategoryName, getTagNames } from "@/shared/common/lib/seed-helpers"
import type { NewsContent } from "./content"

export type NewsStatus = "pending" | "published" | "cancelled" | "deleted" | "archived"

export type RawNewsItem = {
  slug: string
  title: NewsTitleLocale
  description?: NewsOptionalLocale<string>
  content?: NewsOptionalLocale<NewsContent>
  categoryId?: string
  categorySlug: string
  themeId?: string
  tagIds?: string[]
  tagSlugs: string[]
  images: string[]
  authorId?: string
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
  telegramMessageId?: number
  telegramMessageLink?: string
  telegramPushStatus?: "sent" | "failed"
  telegramPushReason?: string
  telegramLastAttemptAt?: Date
  videoSource?: "youtube" | "local"
  videoUrl?: string
  audioSource?: "local" | "external"
  audioUrl?: string
  createdBy?: { userId?: string; name?: string }
  commentCount?: number
  reactionCount?: number
}

export type NewsItem = {
  slug: string
  title: string
  description?: string
  content?: NewsContent
  images: string[]
  categoryId?: string
  category: string
  categorySlug: string
  themeId?: string
  tagIds?: string[]
  tags: string[]
  publishedAt: Date
  minutes: number
  views: number
  authorId?: string
  author: string
  status?: NewsStatus
  isTop?: boolean
  type?: string
  isBreaking?: boolean
  pushedToTelegram?: boolean
  pushedToTelegramAt?: Date
  telegramMessageId?: number
  telegramMessageLink?: string
  telegramPushStatus?: "sent" | "failed"
  telegramPushReason?: string
  telegramLastAttemptAt?: Date
  videoSource?: "youtube" | "local"
  videoUrl?: string
  audioSource?: "local" | "external"
  audioUrl?: string
  createdBy?: { userId?: string; name?: string }
  commentCount?: number
  reactionCount?: number
}

export function pickNewsForLocale(
  raw: RawNewsItem,
  locale: AppLocale
): NewsItem | null {
  const localizedTitle = raw.title[locale]
  const fallbackTitle = LOCALES.map((loc) => raw.title?.[loc]).find((item) => typeof item === "string" && item.trim())
  const title = localizedTitle && localizedTitle.trim() ? localizedTitle : fallbackTitle
  if (title === undefined || title === null || title === "") return null

  const localizedDescription = raw.description?.[locale]
  const fallbackDescription = LOCALES
    .map((loc) => raw.description?.[loc])
    .find((item) => typeof item === "string" && item.trim())
  const description =
    typeof localizedDescription === "string" && localizedDescription.trim()
      ? localizedDescription
      : fallbackDescription

  const content = raw.content?.[locale]

  return {
    slug: raw.slug,
    title,
    ...(description !== undefined && description !== null && description !== ""
      ? { description }
      : {}),
    ...(content !== undefined && content !== null ? { content } : {}),
    images: raw.images,
    categoryId: raw.categoryId,
    category: getCategoryName(raw.categorySlug, locale),
    categorySlug: raw.categorySlug,
    themeId: raw.themeId,
    tagIds: raw.tagIds,
    tags: getTagNames(raw.tagSlugs, locale),
    publishedAt: raw.publishedAt,
    minutes: raw.minutes,
    views: raw.views,
    authorId: raw.authorId,
    author: raw.author,
    status: raw.status ?? "published",
    isTop: raw.isTop ?? false,
    type: raw.type,
    isBreaking: raw.isBreaking ?? false,
    pushedToTelegram: raw.pushedToTelegram,
    pushedToTelegramAt: raw.pushedToTelegramAt,
    telegramMessageId: raw.telegramMessageId,
    telegramMessageLink: raw.telegramMessageLink,
    telegramPushStatus: raw.telegramPushStatus,
    telegramPushReason: raw.telegramPushReason,
    telegramLastAttemptAt: raw.telegramLastAttemptAt,
    videoSource: raw.videoSource,
    videoUrl: raw.videoUrl,
    audioSource: raw.audioSource,
    audioUrl: raw.audioUrl,
    commentCount: raw.commentCount ?? 0,
    reactionCount: raw.reactionCount ?? 0,
  }
}

export function getNewsListForLocale(
  rawList: RawNewsItem[],
  locale: AppLocale
): NewsItem[] {
  return rawList
    .map((raw) => pickNewsForLocale(raw, locale))
    .filter((item): item is NewsItem => item !== null)
}

export function filterPublishedRawNews(rawList: RawNewsItem[]): RawNewsItem[] {
  return rawList.filter((r) => (r.status ?? "published") === "published")
}

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

/** Faqat rasmli yangiliklar — top/latest/related kabi joylarda ko'rsatish uchun. Type video va text ko'rinmasin. */
export function isImageTypeRawNews(item: RawNewsItem): boolean {
  if (item.type !== "image") return false
  const hasValidImage =
    Array.isArray(item.images) &&
    item.images.some((s) => typeof s === "string" && s.trim() !== "")
  return hasValidImage
}
