"use client"

import {
  StayConnected,
  TopBanner,
} from "@/shared/common/components/organisms"
import {  ServerLoading, ServerUnavailable } from "@/shared/common/components/molecules"
import { usePublicNewsQuery } from "@/features/news/model/public-news-query"
import { isImageTypeRawNews, type RawNewsItem } from "@/features/news/model"
import { usePublicCategoriesQuery } from "@/features/category/model/public-categories-query"
import {AllNews, BannerSection, ColumnSection, HeaderNewsCarousel, SlideNewsSection, TextNewsSection, VideoNewsSection} from "@/shared/common/components/news-sections"
import RowSection from "@/shared/common/components/news-sections/row-section"

function isVideoNewsItem(item: RawNewsItem): boolean {
  const hasVideo = !!(item.videoSource && item.videoUrl)
  const hasImages = !!(item.images && item.images.length > 0)
  return item.type === "video" || (hasVideo && hasImages)
}

export default function HomeMainContent() {
  const { data: publicNews = [], isError, isLoading, isFetching } = usePublicNewsQuery()
  const {
    data: categories = [],
    isError: categoriesError,
    isLoading: categoriesLoading,
    isFetching: categoriesFetching,
  } = usePublicCategoriesQuery()
  const firstCategorySlug = categories[0]?.slug ?? "sports"
  const secondCategorySlug = categories[1]?.slug ?? categories[0]?.slug ?? "business"
  const visualNews = publicNews.filter(isImageTypeRawNews)
  const topNewsCount = visualNews.filter((item) => (item as { isTop?: boolean }).isTop).length
  const latestNewsCount = visualNews.length
  const authorsChoiceCount = visualNews.filter((item) => (item as { authorsChoice?: boolean }).authorsChoice).length
  const videoNewsCount = publicNews.filter(isVideoNewsItem).length
  const firstCategoryVisualCount = visualNews.filter((item) => item.categorySlug === firstCategorySlug).length
  const secondCategoryVisualCount = visualNews.filter((item) => item.categorySlug === secondCategorySlug).length
  const shouldShowYangiliklar =
    topNewsCount < 1 ||
    latestNewsCount < 1 ||
    authorsChoiceCount < 3 ||
    videoNewsCount < 7 ||
    firstCategoryVisualCount < 6 ||
    secondCategoryVisualCount < 6

  if ((isLoading || isFetching || categoriesLoading || categoriesFetching) && publicNews.length === 0) {
    return <ServerLoading />
  }
  if ((isError || categoriesError) && publicNews.length === 0) {
    return <ServerUnavailable />
  }
  if (publicNews.length === 0) {
    return null
  }

  return (
    <>
      <HeaderNewsCarousel />
      <TopBanner />
      {/* <SlideNewsSection categorySlug={firstCategorySlug} /> */}
      <BannerSection categorySlug={secondCategorySlug} featuredPosition="left" />
      <VideoNewsSection />
      {/* {shouldShowYangiliklar && <AllNews />} */}
      <TextNewsSection />
      <StayConnected />
      <BannerSection categorySlug={firstCategorySlug} featuredPosition="right" />
      {/* <SlideNewsSection categorySlug={secondCategorySlug} /> */}
      <ColumnSection categorySlug={secondCategorySlug} featuredPosition="left" />
      <RowSection categorySlug={secondCategorySlug} />
    </>
  )
}
