import { dbConnect } from "@/shared/common/lib/db"
import { NewsModel } from "@/features/news/model/news.model"
import { selectSidebarNews } from "@/features/news/lib/sidebar-news"
import type { RawNewsItem } from "@/features/news/model/types"
import type { AppLocale } from "@/shared/common/lib/locale-api"

/** Render a fallback only when the article itself regenerates. Deliberately not
 * dependent on the shared `news` cache: publishing must not invalidate every article.
 * The visible sidebar refreshes independently from the public sidebar endpoint.
 */
export async function getArticleSidebarSnapshot(locale: AppLocale, excludeSlug: string) {
  await dbConnect()
  const rows = await NewsModel.find({ status: "published", ad: { $ne: true }, stats: { $ne: true } })
    .select("slug title images hasImage categorySlug publishedAt videoUrl minutes views")
    .sort({ publishedAt: -1 }).limit(120).lean()
  return selectSidebarNews(JSON.parse(JSON.stringify(rows)) as RawNewsItem[], locale, excludeSlug)
}
