import type { RawNewsItem } from "@/features/news/model"
import { getCloudinaryVideoPosterUrl } from "@/shared/common/lib/cloudinary"
import { getYoutubeEmbedUrl, getYoutubeThumbnailUrl } from "@/shared/common/lib/youtube"
import type { NewsListResponse } from "./news-listing-types"

export function toDate(value?: string | Date): Date | undefined {
  if (!value) return undefined
  const d = value instanceof Date ? value : new Date(value)
  return Number.isNaN(d.getTime()) ? undefined : d
}

export function normalizeRaw(item: NewsListResponse["data"][number]): RawNewsItem {
  return {
    ...(item as Record<string, unknown>),
    publishedAt: toDate(item.publishedAt) ?? new Date(0),
    createdAt: toDate(item.createdAt),
    updatedAt: toDate(item.updatedAt),
  } as RawNewsItem
}

export function getSafeImageSrc(raw?: string) {
  if (!raw?.trim()) return ""
  const candidate =
    raw.startsWith("http://") || raw.startsWith("https://") || raw.startsWith("/")
      ? raw
      : `/uploads/images/${raw}`
  try {
    new URL(candidate, "http://localhost")
    return candidate
  } catch {
    return ""
  }
}

export function getVideoPoster(url?: string) {
  const u = url?.trim()
  if (!u) return ""
  if (getYoutubeEmbedUrl(u)) return getYoutubeThumbnailUrl(u)
  return getCloudinaryVideoPosterUrl(u)
}
