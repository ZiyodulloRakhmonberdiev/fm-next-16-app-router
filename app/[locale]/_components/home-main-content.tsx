import * as React from "react"
import {
  StayConnected,
  TopBanner,
} from "@/shared/common/components/organisms"
import { ServerUnavailable } from "@/shared/common/components/molecules"
import {
  sortCategoriesByPriority,
} from "@/features/category/lib/category-utils"
import {
  AdsShowcaseSection,
  BannerSection,
  BreakingSection,
  ColumnSection,
  HeaderNewsCarousel,
  SlideNewsSection,
  TextNewsSection,
} from "@/shared/common/components/news-sections"
import RowSection from "@/shared/common/components/news-sections/row-section"
import VideoNewsSection2 from "@/shared/common/components/news-sections/video-news-section-2"
import { AdSlot } from "@/features/ads/ui/ad-slot"
import { getCachedPublicNews, getCachedPublicCategories } from "@/shared/common/lib/public-data-server"

export default async function HomeMainContent() {
  const publicNews = await getCachedPublicNews()
  const categories = await getCachedPublicCategories()

  if (!publicNews || !categories) {
    return <ServerUnavailable />
  }

  /** Admin panelda `priority` bo‘yicha (katta = yuqoriroq); index 0 = eng ustun. */
  const categoriesByPriority = sortCategoriesByPriority(categories)

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
    
  if (publicNews.length === 0) {
    return null
  }

  return (
    <>
      <HeaderNewsCarousel initialNews={publicNews} />
      <TopBanner />
      <BannerSection 
        categorySlug={firstCategorySlug} 
        featuredPosition="right" 
        initialNews={publicNews} 
        initialCategories={categories}
      />
      <SlideNewsSection 
        categorySlug={fourthCategorySlug} 
        initialNews={publicNews} 
        initialCategories={categories}
      />
      <BreakingSection 
        initialNews={publicNews} 
        initialCategories={categories}
      />
      <BannerSection 
        categorySlug={secondCategorySlug} 
        featuredPosition="left" 
        initialNews={publicNews} 
        initialCategories={categories}
      />
      <TextNewsSection 
        initialNews={publicNews} 
        initialCategories={categories}
      />
      <VideoNewsSection2 
        initialNews={publicNews} 
        initialCategories={categories}
      />
      <AdSlot placement="home_bottom_full" />
      <RowSection 
        categorySlug={thirdCategorySlug} 
        initialNews={publicNews} 
        initialCategories={categories}
      />
      <SlideNewsSection 
        categorySlug={fifthCategorySlug} 
        initialNews={publicNews} 
        initialCategories={categories}
      />
      <ColumnSection 
        categorySlug={sixthCategorySlug} 
        initialNews={publicNews} 
        initialCategories={categories}
      />
      <RowSection 
        categorySlug={seventhCategorySlug} 
        initialNews={publicNews} 
        initialCategories={categories}
      />
      <BannerSection 
        categorySlug={eighthCategorySlug} 
        featuredPosition="right" 
        initialNews={publicNews} 
        initialCategories={categories}
      />
      <SlideNewsSection 
        categorySlug={ninthCategorySlug} 
        initialNews={publicNews} 
        initialCategories={categories}
      />
      <ColumnSection 
        categorySlug={tenthCategorySlug} 
        initialNews={publicNews} 
        initialCategories={categories}
      />
    </>
  )
}
