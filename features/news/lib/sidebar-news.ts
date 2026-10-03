import { getNewsListForLocale, isImageTypeRawNews, type NewsItem, type RawNewsItem } from "../model/types"
import type { AppLocale } from "@/shared/common/lib/locale-api"

/** Only fields rendered by the ten sidebar cards cross the server/client boundary. */
export function selectSidebarNews(news: RawNewsItem[], locale: AppLocale, excludeSlug?: string): NewsItem[] {
  const selected = [...news]
    .filter(isImageTypeRawNews)
    .filter((item) => !excludeSlug || item.slug !== excludeSlug)
    .sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime())
    .slice(0, 10)

  return getNewsListForLocale(selected, locale).map((item) => ({
    slug: item.slug,
    title: item.title,
    images: item.images.slice(0, 1),
    category: item.category,
    categorySlug: item.categorySlug,
    publishedAt: item.publishedAt,
    videoUrl: item.videoUrl,
    tags: [],
    author: "",
    minutes: item.minutes,
    views: item.views,
  }))
}
