"use client"

import * as React from "react"
import { useLocale } from "next-intl"
import type { AppLocale } from "@/shared/common/lib/formatter"
import { NewsSectionHeader } from "@/shared/common/components/news-sections/news-section-header"
import { usePublicNewsQuery } from "@/features/news/model/public-news-query"
import { getNewsListForLocale, isImageTypeRawNews, type NewsItem } from "@/features/news/model"
import { getCategoryNameFromApi, usePublicCategoriesQuery, type PublicCategory } from "@/features/category/model/public-categories-query"
import type { RawNewsItem } from "@/features/news/model"
import SimpleNewsCard from "@/entities/news/cards/simple-news-card"

type RowSectionProps = {
  categorySlug: string
  initialNews?: RawNewsItem[]
  initialCategories?: PublicCategory[]
}

export default function RowSection({
  categorySlug,
  initialNews,
  initialCategories,
}: RowSectionProps) {
  const locale = useLocale() as AppLocale
  const { data: qNews = [] } = usePublicNewsQuery()
  const { data: qCats = [] } = usePublicCategoriesQuery()
  
  const publicNews = initialNews ?? qNews
  const categories = initialCategories ?? qCats

  const categoryName = getCategoryNameFromApi(categories, categorySlug, locale)

  const items = React.useMemo(() => {
    const raw = [...publicNews]
      .filter(isImageTypeRawNews)
      .filter((n) => n.categorySlug === categorySlug)
      .sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime())
      .slice(0, 28)
    return getNewsListForLocale(raw, locale)
  }, [publicNews, locale, categorySlug])

  if (items.length < 2) return null

  return (
    <section className="w-full px-4 pt-4 md:px-6">
      <div className="rounded-lg border bg-background">
        <NewsSectionHeader
          title={categoryName}
          viewAllHref={`/category/${categorySlug}`}
          variant="inline"
          linkWrap="link"
          showBrandLine
        />

        <div className="grid grid-cols-1 gap-x-8 gap-y-4 p-4 md:grid-cols-2">
          {items.map((item: NewsItem) => (
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
  )
}
