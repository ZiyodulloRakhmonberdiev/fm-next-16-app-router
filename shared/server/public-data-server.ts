import { unstable_cache } from "next/cache"
import { dbConnect } from "@/shared/common/lib/db"
import { NewsModel } from "@/features/news/model/news.model"
import { CategoryModel } from "@/features/category/model/category.model"
import { ThemeModel } from "@/features/theme/model/theme.model"
import { TagModel } from "@/features/tags/model/tag.model"
import { AdModel } from "@/features/ads/model/ads.model"
import { UserModel } from "@/features/users/model/user.model"
import { pickUserLocaleText } from "@/features/users/lib/user-locale"
import { PUBLIC_NEWS_LIST_SELECT } from "@/features/news/lib/news-list-projection"
import { selectSidebarNews } from "@/features/news/lib/sidebar-news"
import type { AppLocale } from "@/shared/common/lib/locale-api"

export async function getPublicSidebarNews(locale: AppLocale, excludeSlug?: string) {
  return selectSidebarNews(await getCachedPublicNews(), locale, excludeSlug)
}

const PUBLIC_DATA_REVALIDATE_SECONDS = 300

export const getCachedPublicNews = unstable_cache(
  async () => {
    await dbConnect()
    // Home sahifasi uchun faqat oxirgi 120 ta maqola yetarli (pagination kerak emas home da)
    const news = await NewsModel.find({ status: "published", ad: { $ne: true }, stats: { $ne: true } })
      .select(PUBLIC_NEWS_LIST_SELECT)
      .sort({ publishedAt: -1 })
      .limit(120)
      .lean()

    const authorIds = Array.from(
      new Set(news.map((n) => n.authorId).filter((id): id is string => typeof id === "string" && id.trim() !== ""))
    )
    const authorNameById = new Map<string, string>()
    if (authorIds.length > 0) {
      const users = await UserModel.find({ _id: { $in: authorIds } })
        .select({ _id: 1, full_name: 1 })
        .lean()
      for (const user of users) authorNameById.set(user._id, pickUserLocaleText(user.full_name, "uz"))
    }
    const normalizedNews = news.map((item) => ({
      ...item,
      author: item.authorId ? (authorNameById.get(item.authorId) ?? item.author) : item.author,
    }))

    return JSON.parse(JSON.stringify(normalizedNews))
  },
  ["public-news-list"],
  { revalidate: PUBLIC_DATA_REVALIDATE_SECONDS, tags: ["news"] }
)

export const getCachedPublicAdNews = unstable_cache(
  async () => {
    await dbConnect()
    const news = await NewsModel.find({ status: "published", ad: true })
      .select(PUBLIC_NEWS_LIST_SELECT)
      .sort({ publishedAt: -1 })
      .limit(40)
      .lean()

    const authorIds = Array.from(
      new Set(news.map((n) => n.authorId).filter((id): id is string => typeof id === "string" && id.trim() !== ""))
    )
    const authorNameById = new Map<string, string>()
    if (authorIds.length > 0) {
      const users = await UserModel.find({ _id: { $in: authorIds } })
        .select({ _id: 1, full_name: 1 })
        .lean()
      for (const user of users) authorNameById.set(user._id, pickUserLocaleText(user.full_name, "uz"))
    }
    const normalizedNews = news.map((item) => ({
      ...item,
      author: item.authorId ? (authorNameById.get(item.authorId) ?? item.author) : item.author,
    }))

    return JSON.parse(JSON.stringify(normalizedNews))
  },
  ["public-ad-news-list"],
  { revalidate: PUBLIC_DATA_REVALIDATE_SECONDS, tags: ["news"] }
)

export const getCachedPublicStatsNews = unstable_cache(
  async () => {
    await dbConnect()
    const news = await NewsModel.find({ status: "published", stats: true })
      .select(PUBLIC_NEWS_LIST_SELECT)
      .sort({ publishedAt: -1 })
      .limit(60)
      .lean()

    const authorIds = Array.from(
      new Set(news.map((n) => n.authorId).filter((id): id is string => typeof id === "string" && id.trim() !== ""))
    )
    const authorNameById = new Map<string, string>()
    if (authorIds.length > 0) {
      const users = await UserModel.find({ _id: { $in: authorIds } })
        .select({ _id: 1, full_name: 1 })
        .lean()
      for (const user of users) authorNameById.set(user._id, pickUserLocaleText(user.full_name, "uz"))
    }
    const normalizedNews = news.map((item) => ({
      ...item,
      author: item.authorId ? (authorNameById.get(item.authorId) ?? item.author) : item.author,
    }))

    return JSON.parse(JSON.stringify(normalizedNews))
  },
  ["public-stats-news-list"],
  { revalidate: PUBLIC_DATA_REVALIDATE_SECONDS, tags: ["news"] }
)

export const getCachedPublicCategories = unstable_cache(
  async () => {
    await dbConnect()
    const categories = await CategoryModel.find()
      .sort({ priority: -1, createdAt: -1 })
      .lean()
    return JSON.parse(JSON.stringify(categories))
  },
  ["public-categories-list"],
  { revalidate: PUBLIC_DATA_REVALIDATE_SECONDS, tags: ["categories"] }
)

export const getCachedPublicThemes = unstable_cache(
  async () => {
    await dbConnect()
    const themes = await ThemeModel.find({ status: "active" })
      .sort({ createdAt: -1 })
      .lean()
    return JSON.parse(JSON.stringify(themes))
  },
  ["public-themes-list"],
  { revalidate: PUBLIC_DATA_REVALIDATE_SECONDS, tags: ["themes"] }
)

export const getCachedPublicTags = unstable_cache(
  async () => {
    await dbConnect()
    const tags = await TagModel.find().lean()
    return JSON.parse(JSON.stringify(tags))
  },
  ["public-tags-list"],
  { revalidate: PUBLIC_DATA_REVALIDATE_SECONDS, tags: ["tags"] }
)

export const getCachedPublicAds = unstable_cache(
  async (placement?: string) => {
    await dbConnect()
    const filter: any = { status: { $ne: "deleted" } }
    if (placement) {
      filter.$or = [{ placements: placement }, { placement }]
    }
    const ads = await AdModel.find(filter)
      .sort({ priority: -1, createdAt: -1 })
      .lean()
    return JSON.parse(JSON.stringify(ads))
  },
  ["public-ads-list"],
  { revalidate: PUBLIC_DATA_REVALIDATE_SECONDS, tags: ["ads"] }
)

export const getCachedCategoryBySlug = unstable_cache(
  async (slug: string) => {
    await dbConnect()
    const category = await CategoryModel.findOne({ slug }).lean()
    if (!category) return null
    return JSON.parse(JSON.stringify(category))
  },
  ["category-by-slug"],
  { revalidate: 3600, tags: ["categories"] }
)

export const getCachedThemeBySlug = unstable_cache(
  async (slug: string) => {
    await dbConnect()
    const theme = await ThemeModel.findOne({ slug, status: "active" }).lean()
    if (!theme) return null
    return JSON.parse(JSON.stringify(theme))
  },
  ["theme-by-slug"],
  { revalidate: 3600, tags: ["themes"] }
)

export async function getSitemapData() {
  await dbConnect()
  const news = await NewsModel.find({ status: "published", ad: { $ne: true }, stats: { $ne: true } })
    .select("slug updatedAt")
    .sort({ publishedAt: -1 })
    .lean()

  const categories = await CategoryModel.find()
    .select("slug updatedAt")
    .lean()
  const themes = await ThemeModel.find({ status: "active" })
    .select("slug updatedAt")
    .lean()

  return {
    news: JSON.parse(JSON.stringify(news)),
    categories: JSON.parse(JSON.stringify(categories)),
    themes: JSON.parse(JSON.stringify(themes)),
  }
}
