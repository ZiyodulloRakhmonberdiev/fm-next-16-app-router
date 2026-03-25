import { NewsModel } from "@/features/news/model/news.model"
import {
  getTitleForLocale,
  type NewsTitleLocale,
} from "@/shared/common/lib/locale-types"

export async function mapSlugsToNewsTitles(
  slugs: string[]
): Promise<Map<string, string>> {
  const unique = [...new Set(slugs.filter(Boolean))]
  if (!unique.length) return new Map()
  const docs = await NewsModel.find(
    { slug: { $in: unique } },
    { slug: 1, title: 1 }
  ).lean()
  const map = new Map<string, string>()
  for (const doc of docs) {
    const slug = String((doc as { slug?: string }).slug ?? "")
    const titleDoc = (doc as { title?: NewsTitleLocale }).title
    const title = titleDoc ? getTitleForLocale(titleDoc, "uz") : ""
    map.set(slug, title)
  }
  return map
}

export async function findSlugsMatchingTitleQuery(q: string): Promise<string[]> {
  const trimmed = q.trim()
  if (!trimmed) return []
  const docs = await NewsModel.find({
    $or: [
      { "title.uz": { $regex: trimmed, $options: "i" } },
      { "title.uzb": { $regex: trimmed, $options: "i" } },
      { "title.ru": { $regex: trimmed, $options: "i" } },
      { "title.en": { $regex: trimmed, $options: "i" } },
    ],
  })
    .select("slug")
    .lean()
  return docs
    .map((d) => String((d as { slug?: string }).slug ?? ""))
    .filter(Boolean)
}
