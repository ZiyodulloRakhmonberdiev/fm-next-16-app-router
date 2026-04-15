"use client"

import * as React from "react"
import { getNewsListForLocale, isImageTypeRawNews, type NewsItem, type RawNewsItem } from "@/features/news/model"
import { usePublicNewsQuery } from "@/features/news/model/public-news-query"
import { getCategoryNameFromApi, usePublicCategoriesQuery } from "@/features/category/model/public-categories-query"
import { useLocale } from "next-intl"
import type { AppLocale } from "@/shared/common/lib/formatter"
import { NewsSectionHeader } from "@/shared/common/components/news-sections/news-section-header"

import type { PublicCategory } from "@/features/category/model/public-categories-query"
import SimpleNewsCard from "@/entities/news/cards/simple-news-card"

type BannerSectionProps = {
  categorySlug?: string
  featuredPosition?: "left" | "right"
  initialNews?: RawNewsItem[]
  initialCategories?: PublicCategory[]
}

export default function BannerSection({
  categorySlug = "business",
  initialNews,
  initialCategories,
}: BannerSectionProps) {
  const locale = useLocale() as AppLocale
  const { data: qNews = [] } = usePublicNewsQuery()
  const { data: qCats = [] } = usePublicCategoriesQuery()
  
  const publicNews = initialNews ?? qNews
  const categories = initialCategories ?? qCats
  
  const categoryName = getCategoryNameFromApi(categories, categorySlug, locale)
  const rawSorted = React.useMemo(
    () =>
      [...publicNews]
        .filter(isImageTypeRawNews)
        .filter((n) => n.categorySlug === categorySlug)
        .sort(
          (a, b) =>
            new Date(b.publishedAt).getTime() -
            new Date(a.publishedAt).getTime()
        ),
    [categorySlug, publicNews]
  )
  const sorted = getNewsListForLocale(rawSorted, locale)
  const [featured, ...rest] = sorted
  const leftItems = rest.slice(0, 4)
  const rightItems = rest.slice(4, 8)

  if (sorted.length < 1) return null

  return (
    <div className="rounded-md px-4 md:px-6 py-6">
      <section className="w-full space-y-4 pb-4 rounded-md border">
        <NewsSectionHeader
          title={categoryName}
          viewAllHref={`/category/${categorySlug}`}
          variant="brandThin"
          linkWrap="link"
        />

        <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3 md:gap-4 px-4 md:px-6">
          <div className="hidden md:flex md:flex-col gap-2">
            {leftItems.map((item: NewsItem) => (
              <SimpleNewsCard
                key={item.slug}
                item={item}
                locale={locale}
                variant="row"
                description={false}
                categoryName={false}
              />
            ))}
          </div>

          <div className="hidden lg:block">
            {featured ? (
              <SimpleNewsCard item={featured} locale={locale} variant="featured" categoryName={false} />
            ) : null}
          </div>

          <div className="hidden md:flex md:flex-col gap-2">
            {rightItems.map((item: NewsItem) => (
              <SimpleNewsCard
                key={item.slug}
                item={item}
                locale={locale}
                variant="row"
                description={false}
                categoryName={false}
              />
            ))}
          </div>

          <div className="grid grid-cols-1 gap-2 md:hidden">
            {featured ? (
              <SimpleNewsCard item={featured} locale={locale} variant="featured" />
            ) : null}
            {([ ...leftItems, ...rightItems].filter(Boolean) as NewsItem[])
              .slice(0, 12)
              .map((item) => (
                <SimpleNewsCard
                  key={item.slug}
                  item={item}
                  locale={locale}
                  variant="row"
                  description={false}
                  categoryName={false}
                />
              ))}
          </div>
        </div>
      </section>
    </div>
  )
}
