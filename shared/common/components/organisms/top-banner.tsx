"use client"

import { AuthorsChoice, LatestNews, TopNews } from "../molecules";
import { usePublicNewsQuery } from "@/features/news/model/public-news-query";
import { isImageTypeRawNews } from "@/features/news/model";
import TopNews2 from "../molecules/top-news-2";

export default function TopBanner() {
  const { data: publicNews = [] } = usePublicNewsQuery()
  const hasVisualNews = publicNews.some(isImageTypeRawNews)
  if (!hasVisualNews) return null

  return (
    <div className="w-full flex flex-col lg:flex-row gap-4 px-4 md:px-6 lg:items-stretch">
      <div className="flex flex-col gap-4 lg:max-w-[70%]">
        <TopNews2 />
        <AuthorsChoice />
      </div>
      <LatestNews />
    </div>
  )
}