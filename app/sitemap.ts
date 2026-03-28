import { MetadataRoute } from "next"
import { getSitemapData } from "@/shared/server/public-data-server"

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const { news, categories } = await getSitemapData()
  const baseUrl = "https://ferganamedia.uz"
  const locales = ["uz", "uzb", "ru", "en"]

  const lastModified = new Date()

  const staticEntries: MetadataRoute.Sitemap = locales.flatMap((locale) => [
    {
      url: `${baseUrl}/${locale}`,
      lastModified,
      changeFrequency: "hourly" as const,
      priority: 1,
    },
    {
      url: `${baseUrl}/${locale}/news/latest`,
      lastModified,
      changeFrequency: "always" as const,
      priority: 0.8,
    },
    {
      url: `${baseUrl}/${locale}/news/trending`,
      lastModified,
      changeFrequency: "hourly" as const,
      priority: 0.7,
    },
  ])

  const categoryEntries: MetadataRoute.Sitemap = locales.flatMap((locale) => 
    categories.map((cat: any) => ({
      url: `${baseUrl}/${locale}/category/${cat.slug}`,
      lastModified: cat.updatedAt ? new Date(cat.updatedAt) : lastModified,
      changeFrequency: "daily" as const,
      priority: 0.6,
    }))
  )

  const newsEntries: MetadataRoute.Sitemap = locales.flatMap((locale) => 
    news.map((item: any) => ({
      url: `${baseUrl}/${locale}/news/${item.slug}`,
      lastModified: item.updatedAt ? new Date(item.updatedAt) : lastModified,
      changeFrequency: "monthly" as const,
      priority: 0.5,
    }))
  )

  return [...staticEntries, ...categoryEntries, ...newsEntries]
}
