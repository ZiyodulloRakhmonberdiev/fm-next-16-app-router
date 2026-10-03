import { cache } from "react"
import { dbConnect } from "@/shared/common/lib/db"
import { NewsModel } from "@/features/news/model/news.model"

// Share one DB read between generateMetadata and the page during this render.
// The page's ISR cache and existing revalidatePath calls handle freshness.
export const getPublishedNewsBySlug = cache(async (slug: string) => {
  await dbConnect()
  return NewsModel.findOne({ slug, status: "published" }).lean()
})
