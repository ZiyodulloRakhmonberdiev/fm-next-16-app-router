"use client"

import * as React from "react"
import { getNewsListForLocale, isImageTypeRawNews, type NewsItem, type RawNewsItem } from "@/features/news/model"
import { usePublicNewsQuery } from "@/features/news/model/public-news-query"
import { useCategoryLabel } from "@/features/category/model/use-category-label"
import { Card } from "@/shared/common/components/ui/card"
import type { AppLocale } from "@/shared/common/lib/formatter"
import { useLocale, useTranslations } from "next-intl"
import { NewsSectionHeader } from "@/shared/common/components/news-sections/news-section-header"
import { FeaturedNewsCard } from "@/features/news/ui/featured-news-card"
import { NewsCardContent } from "@/shared/common/components/news-sections/news-card-content"

function BreakingListCard({ item, locale }: { item: NewsItem; locale: AppLocale }) {
  const categoryLabel = useCategoryLabel(item.categorySlug, locale, item.category)
  return (
    <Card className="flex flex-col gap-2 rounded-sm border-none p-3 shadow-none bg-card">
      <NewsCardContent
        item={item}
        locale={locale}
        categoryLabel={categoryLabel}
        titleClassName="text-sm"
        categoryClassName="font-mono"
        titleLineClampClassName="line-clamp-2 md:line-clamp-3"
        descriptionLineClampClassName="line-clamp-2 md:line-clamp-3"
        variant="inline"
        dateVariant="dateTimeSlash"
      />
    </Card>
  )
}

function isBreakingRawNews(n: RawNewsItem) {
  return n.isBreaking === true
}

export default function BreakingSection() {
  const locale = useLocale() as AppLocale
  const t = useTranslations("common")
  const { data: publicNews = [] } = usePublicNewsQuery()

  const items = React.useMemo(() => {
    const raw = [...publicNews]
      .filter(isImageTypeRawNews)
      .filter(isBreakingRawNews)
      .sort(
        (a, b) =>
          new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
      )
      .slice(0, 7)
    return getNewsListForLocale(raw, locale)
  }, [locale, publicNews])

  const [featured, ...rightItems] = items

  if (items.length < 1) return null

  return (
    <div className="mt-4 w-full px-4 md:px-6">
      <div className="py-4">
        <NewsSectionHeader
          title={t("filter_breaking")}
          viewAllHref="/news/breaking"
          variant="brand"
          linkWrap="link"
        />
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div className="grid gap-4 md:grid-cols-2">
            {rightItems.map((item: NewsItem) => (
              <BreakingListCard key={item.slug} item={item} locale={locale} />
            ))}
          </div>
          {featured ? (
            <div className="h-full hidden md:flex md:col-span-1">
              <FeaturedNewsCard item={featured} locale={locale} variant="column" />
            </div>
          ) : null}
        </div>
      </div>
    </div>
  )
}
