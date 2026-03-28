import type { RawNewsItem } from "@/features/news/model"
import { getCloudinaryVideoPosterUrl } from "@/shared/infra/cloudinary"
import type { DateInput } from "@/shared/common/lib/formatter"
import { getYoutubeEmbedUrl, getYoutubeThumbnailUrl } from "@/features/news/lib/youtube"
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

/** `video-news-section-2` bilan bir xil poster tanlash */
export function getCardImageSrc(item: {
  images?: string[]
  videoUrl?: string | null
  videoSource?: string | null
}): string {
  const img = getSafeImageSrc(item.images?.[0])
  if (img) return img
  if (getYoutubeEmbedUrl(item.videoUrl ?? "")) return getYoutubeThumbnailUrl(item.videoUrl) || ""
  return getCloudinaryVideoPosterUrl(item.videoUrl) || ""
}

/** Kartochka / `<video>` uchun — mahalliy yoki to‘liq URL */
export function getPublicVideoSrc(url?: string | null): string {
  const u = url?.trim()
  if (!u) return ""
  if (u.startsWith("http://") || u.startsWith("https://")) return u
  if (u.startsWith("/")) return u
  return `/${u}`
}

/** Rasmdagidek: `17:11 / 21.03.2026` — `video-news-section-2` bilan mos */
export function formatVideoCardMetaLine(date: DateInput): string {
  const d = date instanceof Date ? date : new Date(date)
  const pad = (n: number) => String(n).padStart(2, "0")
  return `${pad(d.getHours())}:${pad(d.getMinutes())} / ${pad(d.getDate())}.${pad(d.getMonth() + 1)}.${d.getFullYear()}`
}
