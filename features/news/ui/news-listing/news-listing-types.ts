import type { RawNewsItem } from "@/features/news/model"

export type NewsListingVariant = "latest" | "trending"

export type FilterType =
  | "latest"
  | "popular"
  | "top"
  | "authors_choice"
  | "breaking"
  | "video"

export type LayoutType = "list" | "videoGrid"

export type NewsListResponse = {
  data: Array<
    Omit<RawNewsItem, "publishedAt" | "createdAt" | "updatedAt"> & {
      publishedAt: string | Date
      createdAt?: string | Date
      updatedAt?: string | Date
    }
  >
  meta?: { page: number; limit: number; totalPages: number; total?: number }
}

export function sortByForFilter(filter: FilterType) {
  return filter === "popular" ? "views" : "publishedAt"
}

export function flagsForFilter(filter: FilterType) {
  return {
    top: filter === "top",
    authorsChoice: filter === "authors_choice",
    breaking: filter === "breaking",
    video: filter === "video",
  }
}
