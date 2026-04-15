"use client"

import * as React from "react"
import { getNewsListForLocale, isImageTypeRawNews, type NewsItem, type RawNewsItem } from "@/features/news/model"
import { usePublicNewsQuery } from "@/features/news/model/public-news-query"
import type { AppLocale } from "@/shared/common/lib/formatter"
import { useLocale, useTranslations } from "next-intl"
import { NewsSectionHeader } from "@/shared/common/components/news-sections/news-section-header"
import type { PublicCategory } from "@/features/category/model/public-categories-query"
import TextNewsCard from "@/entities/news/cards/text-news-card"
import SimpleNewsCard from "@/entities/news/cards/simple-news-card"

type BreakingSectionProps = {
  initialNews?: RawNewsItem[]
  initialCategories?: PublicCategory[]
}

function BreakingListCard({ item, locale }: { item: NewsItem; locale: AppLocale }) {
  return <TextNewsCard item={item} locale={locale} variant="breaking" />
}

function isBreakingRawNews(n: RawNewsItem) {
  return n.isBreaking === true
}

export default function BreakingSection({
  initialNews,
  initialCategories,
}: BreakingSectionProps) {
  const locale = useLocale() as AppLocale
  const t = useTranslations("common")
  const { data: qNews = [] } = usePublicNewsQuery()
  const publicNews = initialNews ?? qNews

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
              <SimpleNewsCard item={featured} locale={locale} variant="featured" />
            </div>
          ) : null}
        </div>
      </div>
    </div>
  )
}
