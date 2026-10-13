import { isImageTypeRawNews, isVideoRawNews, type RawNewsItem } from "../model/types"

export type HomeSection = "banner" | "row" | "slide" | "header" | "top" | "authors" | "breaking" | "video" | "stats" | "ads"

/** Match the existing card filters before limiting; unrelated stories never cross into a section. */
export function selectHomeNews(rows: RawNewsItem[], section: HomeSection, categorySlug?: string) {
  const selected = [...rows].sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime())
    .filter((item) => {
      if (categorySlug && item.categorySlug !== categorySlug) return false
      if (section === "top" && !item.isTop) return false
      if (section === "authors" && !item.authorsChoice) return false
      if (section === "video") return isVideoRawNews(item) && Boolean(item.videoUrl)
      if (section === "stats" || section === "ads") {
        const image = item.images?.some((src) => Boolean(src.trim()))
        const video = Boolean(item.videoUrl?.trim())
        return (section === "stats" ? item.stats === true : item.ad === true) &&
          Boolean(image || video || (section === "stats" && item.audioUrl?.trim()))
      }
      return isImageTypeRawNews(item) && (section !== "breaking" || item.isBreaking === true) &&
        (section !== "header" || item.images.length > 0)
    })
  // The slide carousel previously rendered every story in its category; preserve that behavior.
  const limits = { banner: 9, row: 28, slide: 120, header: 10, top: 10, authors: 6, breaking: 7, video: 8, stats: 8, ads: 24 }
  return selected.slice(0, limits[section])
}
