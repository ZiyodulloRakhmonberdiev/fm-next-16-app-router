"use client"

import * as React from "react"
import {
  StayConnected,
  TopBanner,
} from "@/shared/common/components/organisms"
import { ServerUnavailable } from "@/shared/common/components/molecules"
import { usePublicNewsQuery } from "@/features/news/model/public-news-query"
import {
  sortCategoriesByPriority,
  usePublicCategoriesQuery,
} from "@/features/category/model/public-categories-query"
import {
  BannerSection,
  BreakingSection,
  ColumnSection,
  HeaderNewsCarousel,
  SlideNewsSection,
  TextNewsSection,
} from "@/shared/common/components/news-sections"
import RowSection from "@/shared/common/components/news-sections/row-section"
import VideoNewsSection2 from "@/shared/common/components/news-sections/video-news-section-2"
import HomePageSkeleton from "./home-page-skeleton"

export default function HomeMainContent() {
  const { data: publicNews = [], isError, isLoading, isFetching } = usePublicNewsQuery()
  const {
    data: categories = [],
    isError: categoriesError,
    isLoading: categoriesLoading,
    isFetching: categoriesFetching,
  } = usePublicCategoriesQuery()

  /** Admin panelda `priority` bo‘yicha (katta = yuqoriroq); index 0 = eng ustun. */
  const categoriesByPriority = React.useMemo(
    () => sortCategoriesByPriority(categories),
    [categories]
  )

  const firstCategorySlug = categoriesByPriority[0]?.slug ?? "politics"
  const secondCategorySlug =
    categoriesByPriority[1]?.slug ?? categoriesByPriority[0]?.slug ?? "society"
  const thirdCategorySlug =
    categoriesByPriority[2]?.slug ??
    categoriesByPriority[1]?.slug ??
    categoriesByPriority[0]?.slug ??
    "uzbekistan"
  const fourthCategorySlug =
    categoriesByPriority[3]?.slug ??
    categoriesByPriority[2]?.slug ??
    categoriesByPriority[1]?.slug ??
    categoriesByPriority[0]?.slug ??
    "world"

  const fifthCategorySlug =
    categoriesByPriority[4]?.slug ??
    "rights"

  const sixthCategorySlug =
    categoriesByPriority[5]?.slug ??
    "economy"
  const seventhCategorySlug =
    categoriesByPriority[6]?.slug ??
    "health"
  const eighthCategorySlug =
    categoriesByPriority[7]?.slug ??
    "science"
  const ninthCategorySlug =
    categoriesByPriority[8]?.slug ??
    "technology"
  const tenthCategorySlug =
    categoriesByPriority[9]?.slug ??
    "sports"
    
  if ((isLoading || isFetching || categoriesLoading || categoriesFetching) && publicNews.length === 0) {
    return <HomePageSkeleton />
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
      <BannerSection categorySlug={firstCategorySlug} featuredPosition="right" />
      <SlideNewsSection categorySlug={fourthCategorySlug} />
      <BreakingSection />
      <BannerSection categorySlug={secondCategorySlug} featuredPosition="left" />
      <TextNewsSection />
      {/* <VideoNewsSection /> */}
      <VideoNewsSection2 />
      <RowSection categorySlug={thirdCategorySlug} />
      <SlideNewsSection categorySlug={fifthCategorySlug} />
      <ColumnSection categorySlug={sixthCategorySlug} />
      <RowSection categorySlug={seventhCategorySlug} />
      <BannerSection categorySlug={eighthCategorySlug} featuredPosition="right" />
      <SlideNewsSection categorySlug={ninthCategorySlug} />
      <ColumnSection categorySlug={tenthCategorySlug} />      
    </>
  )
}
