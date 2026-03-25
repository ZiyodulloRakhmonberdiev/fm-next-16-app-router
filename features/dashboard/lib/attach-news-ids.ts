import type { NewsItem, RawNewsItem } from '@/features/news/model'

export type DashboardNewsListItem = NewsItem & { newsId: string }

/** Slug bo'yicha Mongo `_id` ni biriktiradi (server yoki client — client boundary yo'q). */
export function attachNewsIdsToItems(
  items: NewsItem[],
  allRaw: RawNewsItem[]
): DashboardNewsListItem[] {
  const idBySlug = new Map<string, string>()
  for (const r of allRaw) {
    const id = (r as RawNewsItem & { _id?: string })._id
    if (r.slug && id != null && String(id) !== '') {
      idBySlug.set(r.slug, String(id))
    }
  }
  const out: DashboardNewsListItem[] = []
  for (const item of items) {
    const newsId = idBySlug.get(item.slug)
    if (newsId) out.push({ ...item, newsId })
  }
  return out
}
