"use client"

import { AuthorsChoice } from "../news-sections"
import { usePublicNewsQuery } from "@/features/news/model/public-news-query"
import { usePublicNewsInitial } from "@/features/news/model/public-news-initial"
import { isImageTypeRawNews } from "@/features/news/model"
import TopNewsCarousel from "../news-sections/top-news-carousel"
import LatestNews from "@/entities/news/lists/latest-news"
import { TopBannerSkeleton } from "@/shared/common/components/home/home-hero-skeletons"

export default function TopBanner() {
  const initialNews = usePublicNewsInitial()
  const { data: qNews = [], isPending, isFetching } = usePublicNewsQuery()
  const publicNews = initialNews ?? qNews

  const isResolvingHero =
    publicNews.length === 0 && !initialNews && (isPending || isFetching)

  if (isResolvingHero) {
    return (
      <div className="w-full px-4 md:px-6" aria-busy="true">
        <TopBannerSkeleton />
      </div>
    )
  }

  const hasVisualNews = publicNews.some(isImageTypeRawNews)
  if (!hasVisualNews) return null

  return (
    <div className="w-full flex flex-col lg:flex-row gap-4 px-4 md:px-6 lg:items-stretch">
      <div className="flex flex-col gap-4 lg:max-w-[72%]">
        <TopNewsCarousel />
        <AuthorsChoice />
      </div>
      <LatestNews initialNews={publicNews} />
    </div>
  )
}
