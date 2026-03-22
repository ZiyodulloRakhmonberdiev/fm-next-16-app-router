"use client"

import * as React from "react"
import { getNewsListForLocale, isImageTypeRawNews, type NewsItem } from "@/features/news/model"
import { usePublicNewsQuery } from "@/features/news/model/public-news-query"
import { getCategoryNameFromApi, usePublicCategoriesQuery } from "@/features/category/model/public-categories-query"
import { useCategoryLabel } from "@/features/category/model/use-category-label"
import { Card } from "@/shared/common/components/ui/card"
import {
  formatDateISO,
  formatDateTimeLocale,
} from "@/shared/common/lib/formatter"
import type { AppLocale } from "@/shared/common/lib/formatter"
import { Link } from "@/i18n/navigation"
import { useLocale } from "next-intl"
import { NewsSectionHeader } from "@/shared/common/components/news-sections/news-section-header"
import { FeaturedNewsCard } from "@/features/news/ui/featured-news-card"

type ColumnSectionProps = {
  categorySlug?: string
  featuredPosition?: "left" | "right"
}

export default function ColumnSection({
  categorySlug = "business",
  featuredPosition = "right",
}: ColumnSectionProps) {
  const locale = useLocale() as AppLocale
  const { data: publicNews = [] } = usePublicNewsQuery()
  const { data: categories = [] } = usePublicCategoriesQuery()
  const categoryName = getCategoryNameFromApi(categories, categorySlug, locale)

  const items = React.useMemo(() => {
    const raw = [...publicNews]
      .filter(isImageTypeRawNews)
      .filter((n) => n.categorySlug === categorySlug)
      .sort(
        (a, b) =>
          new Date(b.publishedAt).getTime() -
          new Date(a.publishedAt).getTime()
      )
      .slice(0, 7)
    return getNewsListForLocale(raw, locale)
  }, [categorySlug, locale, publicNews])

  const [featured, ...rightItems] = items

  if (items.length < 1) return null

  return (
    <div className="w-full px-4 md:px-6 mt-4">
      <div className="py-4">
        <NewsSectionHeader
          title={categoryName}
          viewAllHref={`/category/${categorySlug}`}
          variant="brandAccent"
          linkWrap="ghost"
        />
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div
            className={`grid md:grid-cols-2 gap-4 ${
              featuredPosition === "left" ? "md:order-2" : ""
            }`}
          >
            {rightItems.map((item: NewsItem) => (
              <Card
                key={item.slug}
                className="flex flex-col gap-2 rounded-sm border-none p-3 shadow-none bg-foreground/5 md:bg-background"
              >
                <div className="flex flex-wrap items-center gap-x-1.5 text-xs text-muted-foreground">
                  <span className="uppercase font-medium text-brand italic">
                    {useCategoryLabel(item.categorySlug, locale, item.category)}
                  </span>
                  <span aria-hidden>/</span>
                  <time dateTime={formatDateISO(item.publishedAt)}>
                    {formatDateTimeLocale(item.publishedAt, locale)}
                  </time>
                </div>
                <h4 className="text-sm font-semibold leading-tight">
                  <Link
                    href={`/news/${item.slug}`}
                    className="hover:underline"
                  >
                    <span className="line-clamp-2 md:line-clamp-3">{item.title ?? ""}</span>
                  </Link>
                </h4>
                <p className="text-sm text-muted-foreground">
                  <span className="line-clamp-2 md:line-clamp-3">{item.description ?? ""}</span>
                </p>
              </Card>
            ))}
          </div>
          {featured && (
            <div
              className={`h-full md:col-span-1 ${
                featuredPosition === "left" ? "md:order-1" : ""
              }`}
            >
              <FeaturedNewsCard
                item={featured}
                locale={locale}
                variant="column"
              />
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
