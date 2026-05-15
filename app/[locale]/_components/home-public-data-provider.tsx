"use client"

import type { ReactNode } from "react"
import { PublicCategoriesInitialProvider } from "@/features/category/model/public-categories-initial"
import type { PublicCategory } from "@/features/category/model/public-categories-query"
import { PublicNewsInitialProvider } from "@/features/news/model/public-news-initial"
import type { RawNewsItem } from "@/features/news/model"

type HomePublicDataProviderProps = {
  news: RawNewsItem[]
  categories: PublicCategory[]
  children: ReactNode
}

export default function HomePublicDataProvider({
  news,
  categories,
  children,
}: HomePublicDataProviderProps) {
  return (
    <PublicNewsInitialProvider value={news}>
      <PublicCategoriesInitialProvider value={categories}>
        {children}
      </PublicCategoriesInitialProvider>
    </PublicNewsInitialProvider>
  )
}
