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
  authorImage?: string | null
  minutes: number
  views: number
  publishedAt: Date
  createdAt?: Date
  updatedAt?: Date
  status?: NewsStatus
  type?: string
  hasText?: boolean
  hasImage?: boolean
  hasVideo?: boolean
  hasAudio?: boolean
  authorsChoice?: boolean
  isTrending?: boolean
  isLatest?: boolean
  isPopular?: boolean
  isTop?: boolean
  isBreaking?: boolean
  ad?: boolean
  stats?: boolean
  pushedToTelegram?: boolean
  pushedToTelegramAt?: Date
  telegramMessageId?: number
  telegramMessageLink?: string
  telegramPushStatus?: "sent" | "failed"
  telegramPushReason?: string
  telegramLastAttemptAt?: Date
  videoSource?: "youtube" | "local"
  videoUrl?: string
  videoCaption?: string
  audioSource?: "local" | "external"
  audioUrl?: string
  audioCaption?: string
  imageCaption?: string
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
  authorImage?: string | null
  status?: NewsStatus
  isTop?: boolean
  type?: string
  hasText?: boolean
  hasImage?: boolean
  hasVideo?: boolean
  hasAudio?: boolean
  isBreaking?: boolean
  ad?: boolean
  stats?: boolean
  pushedToTelegram?: boolean
  pushedToTelegramAt?: Date
  telegramMessageId?: number
  telegramMessageLink?: string
  telegramPushStatus?: "sent" | "failed"
  telegramPushReason?: string
  telegramLastAttemptAt?: Date
  videoSource?: "youtube" | "local"
  videoUrl?: string
  videoCaption?: string
  audioSource?: "local" | "external"
  audioUrl?: string
  audioCaption?: string
  imageCaption?: string
  createdBy?: { userId?: string; name?: string }
  commentCount?: number
  reactionCount?: number
}

function isNewsContentValue(value: unknown): value is NewsContent {
  return typeof value === "string" || Array.isArray(value)
}

function resolveLocalizedContent(
  content: RawNewsItem["content"] | NewsContent | undefined,
  locale: AppLocale
): NewsContent | undefined {
  // Backward compatibility: old documents may store content as plain string/array
  if (isNewsContentValue(content)) return content
  if (!content || typeof content !== "object") return undefined

  const localized = (content as Record<string, unknown>)[locale]
  if (isNewsContentValue(localized)) return localized

  for (const loc of LOCALES) {
    const next = (content as Record<string, unknown>)[loc]
    if (isNewsContentValue(next)) return next
  }
  return undefined
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

  const content = resolveLocalizedContent(raw.content, locale)

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
    authorImage: raw.authorImage,
    status: raw.status ?? "published",
    isTop: raw.isTop ?? false,
    type: raw.type,
    hasText: raw.hasText ?? Boolean(raw.title?.uz?.trim()),
    hasImage:
      raw.hasImage ??
      (Array.isArray(raw.images) &&
        raw.images.some((s) => typeof s === "string" && s.trim() !== "")),
    hasVideo:
      raw.hasVideo ??
      (typeof raw.videoUrl === "string" && raw.videoUrl.trim() !== ""),
    hasAudio:
      raw.hasAudio ??
      (typeof raw.audioUrl === "string" && raw.audioUrl.trim() !== ""),
    isBreaking: raw.isBreaking ?? false,
    ad: raw.ad ?? false,
    stats: raw.stats ?? false,
    pushedToTelegram: raw.pushedToTelegram,
    pushedToTelegramAt: raw.pushedToTelegramAt,
    telegramMessageId: raw.telegramMessageId,
    telegramMessageLink: raw.telegramMessageLink,
    telegramPushStatus: raw.telegramPushStatus,
    telegramPushReason: raw.telegramPushReason,
    telegramLastAttemptAt: raw.telegramLastAttemptAt,
    videoSource: raw.videoSource,
    videoUrl: raw.videoUrl,
    videoCaption: raw.videoCaption,
    audioSource: raw.audioSource,
    audioUrl: raw.audioUrl,
    audioCaption: raw.audioCaption,
    imageCaption: raw.imageCaption,
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
  const hasVideo = item.hasVideo ?? Boolean(item.videoUrl && item.videoUrl.trim())
  const hasAudio = item.hasAudio ?? Boolean(item.audioUrl && item.audioUrl.trim())
  const hasImages =
    item.hasImage ??
    (Array.isArray(item.images) && item.images.some((s) => typeof s === "string" && s.trim() !== ""))
  return !hasVideo && !hasAudio && !hasImages
}

/** Rasmli/video cardlarda ko'rsatish mumkin bo'lgan yangiliklar. */
export function isVisualRawNews(item: RawNewsItem): boolean {
  return !isTextOnlyRawNews(item)
}

/** Faqat rasmli yangiliklar — top/latest/related kabi joylarda ko'rsatish uchun. Type video va text ko'rinmasin. */
export function isImageTypeRawNews(item: RawNewsItem): boolean {
  if (typeof item.hasImage === "boolean") return item.hasImage
  return (
    Array.isArray(item.images) &&
    item.images.some((s) => typeof s === "string" && s.trim() !== "")
  )
}

export function isVideoRawNews(item: RawNewsItem): boolean {
  if (typeof item.hasVideo === "boolean") return item.hasVideo
  return typeof item.videoUrl === "string" && item.videoUrl.trim() !== ""
}

export function isAudioRawNews(item: RawNewsItem): boolean {
  if (typeof item.hasAudio === "boolean") return item.hasAudio
  return typeof item.audioUrl === "string" && item.audioUrl.trim() !== ""
}
