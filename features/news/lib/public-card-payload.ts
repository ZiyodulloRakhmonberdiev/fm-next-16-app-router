import { pickNewsForLocale, type RawNewsItem } from "../model/types"
import type { AppLocale } from "@/shared/common/lib/locale-api"

/** A locale-specific listing payload, never an entire database document.
 * Keep the RawNewsItem shape for existing cards; uz is its required fallback key.
 * This payload must not seed the shared, multilingual client feed cache.
 */
export function publicCardPayload(rows: RawNewsItem[], locale: AppLocale): RawNewsItem[] {
  return rows.flatMap((raw) => {
    const item = pickNewsForLocale(raw, locale)
    if (!item) return []
    return [{
      slug: item.slug,
      title: { uz: item.title },
      description: item.description ? { uz: item.description } : undefined,
      images: item.images.slice(0, 1),
      categorySlug: item.categorySlug,
      themeId: item.themeId,
      tagSlugs: [],
      author: item.author,
      authorId: item.authorId,
      minutes: item.minutes,
      views: item.views,
      publishedAt: item.publishedAt,
      status: item.status,
      hasText: item.hasText,
      hasImage: item.hasImage,
      hasVideo: item.hasVideo,
      hasAudio: item.hasAudio,
      isBreaking: item.isBreaking,
      isTop: item.isTop,
      authorsChoice: raw.authorsChoice,
      ad: item.ad,
      stats: item.stats,
      videoSource: item.videoSource,
      videoUrl: item.videoUrl,
      audioUrl: item.audioUrl,
      commentCount: item.commentCount,
      reactionCount: item.reactionCount,
    }]
  })
}
