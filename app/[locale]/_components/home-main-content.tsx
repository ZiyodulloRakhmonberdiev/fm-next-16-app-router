"use client"

import * as React from "react"
import {
  StayConnected,
  TopBanner,
} from "@/shared/common/components/organisms"
import {  ServerLoading, ServerUnavailable } from "@/shared/common/components/molecules"
import { usePublicNewsQuery } from "@/features/news/model/public-news-query"
import {
  sortCategoriesByPriority,
  usePublicCategoriesQuery,
} from "@/features/category/model/public-categories-query"
import { BannerSection, ColumnSection, HeaderNewsCarousel, SlideNewsSection, TextNewsSection, VideoNewsSection } from "@/shared/common/components/news-sections"
import RowSection from "@/shared/common/components/news-sections/row-section"

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
      <BannerSection categorySlug={firstCategorySlug} featuredPosition="right" />
      <SlideNewsSection categorySlug={firstCategorySlug} />
      {/* <ColumnSection categorySlug={firstCategorySlug} featuredPosition="left" /> */}
      <BannerSection categorySlug={secondCategorySlug} featuredPosition="left" />
      <TextNewsSection />
      <VideoNewsSection />
      <RowSection categorySlug={thirdCategorySlug} />
      <StayConnected />
    </>
  )
}
