import { unstable_cache } from "next/cache"
import { dbConnect } from "@/shared/common/lib/db"
import { NewsModel } from "@/features/news/model/news.model"
import { UserModel } from "@/features/users/model/user.model"
import { NewsCommentModel } from "@/features/news/model/comment.model"
import { NewsReactionModel } from "@/features/news/model/reaction.model"
import { PUBLIC_NEWS_LIST_SELECT } from "@/features/news/lib/news-list-projection"
import { pickUserLocaleText } from "@/features/users/lib/user-locale"
import { getNewsListForLocale, type RawNewsItem } from "@/features/news/model/types"
import type { AppLocale } from "@/shared/common/lib/locale-api"
import type { SortOrder } from "mongoose"

type PublicNewsListOptions = {
  locale: AppLocale
  pageSize: number
  pageCount?: number
  sortBy?: "views" | "publishedAt"
  categorySlugs?: string[]
  themeIds?: string[]
  audio?: boolean
  video?: boolean
  breaking?: boolean
}

// Public only: no cookies/session, no HTTP call back into our own deployment.
// Throw on DB errors so ISR retains the last successful page instead of caching an empty feed.
const getCachedList = unstable_cache(async (options: PublicNewsListOptions) => {
  await dbConnect()
  const filter: Record<string, unknown> = {
    status: "published", ad: { $ne: true }, stats: { $ne: true },
  }
  if (options.categorySlugs?.length) filter.categorySlug = { $in: options.categorySlugs }
  if (options.themeIds?.length) filter.themeId = { $in: options.themeIds }
  if (options.breaking) filter.isBreaking = true
  if (options.video) filter.$or = [{ hasVideo: true }, { videoUrl: { $exists: true, $nin: [null, ""] } }]
  if (options.audio) filter.$or = [{ hasAudio: true }, { audioUrl: { $exists: true, $nin: [null, ""] } }]
  const sort: Record<string, SortOrder> = options.sortBy === "views" ? { views: -1, publishedAt: -1 } : { publishedAt: -1 }
  const [rows, total] = await Promise.all([
    NewsModel.find(filter).select(PUBLIC_NEWS_LIST_SELECT).sort(sort)
      .limit(options.pageSize * (options.pageCount ?? 1)).lean(),
    NewsModel.countDocuments(filter),
  ])
  const authorIds = [...new Set(rows.map((row) => row.authorId).filter(Boolean))]
  const slugs = rows.map((row) => row.slug)
  const [authors, comments, reactions] = await Promise.all([
    authorIds.length ? UserModel.find({ _id: { $in: authorIds } }).select({ _id: 1, full_name: 1 }).lean() : [],
    slugs.length ? NewsCommentModel.aggregate<{ _id: string; count: number }>([
      { $match: { newsSlug: { $in: slugs }, status: { $in: ["confirmed", "approved"] } } },
      { $group: { _id: "$newsSlug", count: { $sum: 1 } } },
    ]) : [],
    slugs.length ? NewsReactionModel.aggregate<{ _id: string; count: number }>([
      { $match: { newsSlug: { $in: slugs } } },
      { $group: { _id: "$newsSlug", count: { $sum: 1 } } },
    ]) : [],
  ])
  const authorNames = new Map(authors.map((author) => [author._id, pickUserLocaleText(author.full_name, options.locale)]))
  const commentCounts = new Map(comments.map((row) => [row._id, row.count]))
  const reactionCounts = new Map(reactions.map((row) => [row._id, row.count]))
  return {
    rows: JSON.parse(JSON.stringify(rows.map((row) => ({
      ...row,
      author: authorNames.get(row.authorId) ?? row.author,
      commentCount: commentCounts.get(row.slug) ?? 0,
      reactionCount: reactionCounts.get(row.slug) ?? 0,
    })))) as RawNewsItem[],
    total,
  }
}, ["public-news-page-v1"], { revalidate: 60, tags: ["news"] })

export async function getPublicNewsPage(options: PublicNewsListOptions) {
  const { rows, total } = await getCachedList(options)
  const totalPages = Math.max(1, Math.ceil(total / options.pageSize))
  return {
    items: getNewsListForLocale(rows.map((row) => ({ ...row, publishedAt: new Date(row.publishedAt) })), options.locale),
    page: Math.min(options.pageCount ?? 1, totalPages),
    totalPages,
  }
}
