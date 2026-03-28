import { unstable_cache } from "next/cache"
import { dbConnect } from "@/shared/common/lib/db"
import { NewsModel } from "@/features/news/model/news.model"
import { CategoryModel } from "@/features/category/model/category.model"
import { TagModel } from "@/features/tags/model/tag.model"
import { AdModel } from "@/features/ads/model/ads.model"

/**
 * Bu funksiyalar faqat SERVER COMPONENTLAR ichida chaqiriladi.
 * Next.js 'unstable_cache' orqali ISR (Incremental Static Regeneration) ni ta'minlaydi.
 */

export const getCachedPublicNews = unstable_cache(
  async () => {
    await dbConnect()
    // Home sahifasi uchun faqat oxirgi 120 ta maqola yetarli (pagination kerak emas home da)
    const news = await NewsModel.find({ status: "published" })
      .sort({ publishedAt: -1 })
      .limit(120)
      .lean()
    
    // Mongoose hujjatlarini plain JSON qilib qaytaramiz (Date ob'ektlarini string qilib)
    return JSON.parse(JSON.stringify(news))
  },
  ["public-news-list"],
  { revalidate: 60, tags: ["news"] }
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
  { revalidate: 300, tags: ["categories"] }
)

export const getCachedPublicTags = unstable_cache(
  async () => {
    await dbConnect()
    const tags = await TagModel.find().lean()
    return JSON.parse(JSON.stringify(tags))
  },
  ["public-tags-list"],
  { revalidate: 600, tags: ["tags"] }
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
  { revalidate: 120, tags: ["ads"] }
)

/**
 * SEO 'generateMetadata' uchun bitta kategoriyani slug orqali olamiz.
 */
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

/**
 * Sitemap uchun barcha e'lon qilingan yangiliklar va kategoriyalarni olamiz.
 */
export async function getSitemapData() {
  await dbConnect()
  const news = await NewsModel.find({ status: "published" })
    .select("slug updatedAt")
    .sort({ publishedAt: -1 })
    .lean()
  
  const categories = await CategoryModel.find()
    .select("slug updatedAt")
    .lean()
    
  return {
    news: JSON.parse(JSON.stringify(news)),
    categories: JSON.parse(JSON.stringify(categories)),
  }
}

