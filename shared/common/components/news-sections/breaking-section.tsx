"use client"

import * as React from "react"
import { getNewsListForLocale, isImageTypeRawNews, type NewsItem, type RawNewsItem } from "@/features/news/model"
import { usePublicNewsQuery } from "@/features/news/model/public-news-query"
import { useCategoryLabel } from "@/features/category/model/use-category-label"
import { Card } from "@/shared/common/components/ui/card"
import { formatDateISO, formatDateTimeLocale } from "@/shared/common/lib/formatter"
import type { AppLocale } from "@/shared/common/lib/formatter"
import { Link } from "@/i18n/navigation"
import { useLocale, useTranslations } from "next-intl"
import { NewsSectionHeader } from "@/shared/common/components/news-sections/news-section-header"
import { FeaturedNewsCard } from "@/features/news/ui/featured-news-card"

function BreakingListCard({ item, locale }: { item: NewsItem; locale: AppLocale }) {
  const categoryLabel = useCategoryLabel(item.categorySlug, locale, item.category)
  return (
    <Card className="flex flex-col gap-2 rounded-sm border-none bg-foreground/5 p-3 shadow-none md:bg-background">
      <div className="flex flex-wrap items-center gap-x-1.5 text-xs text-muted-foreground">
        <span className="font-medium uppercase italic text-brand">{categoryLabel}</span>
        <span aria-hidden>/</span>
        <time dateTime={formatDateISO(item.publishedAt)}>{formatDateTimeLocale(item.publishedAt, locale)}</time>
      </div>
      <h4 className="text-sm font-semibold leading-tight">
        <Link href={`/news/${item.slug}`} className="hover:underline">
          <span className="line-clamp-2 md:line-clamp-3">{item.title ?? ""}</span>
        </Link>
      </h4>
      <p className="text-sm text-muted-foreground">
        <span className="line-clamp-2 md:line-clamp-3">{item.description ?? ""}</span>
      </p>
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
          variant="brandAccent"
          linkWrap="ghost"
        />
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div className="grid gap-4 md:grid-cols-2">
            {rightItems.map((item: NewsItem) => (
              <BreakingListCard key={item.slug} item={item} locale={locale} />
            ))}
          </div>
          {featured ? (
            <div className="h-full md:col-span-1">
              <FeaturedNewsCard item={featured} locale={locale} variant="column" />
            </div>
          ) : null}
        </div>
      </div>
    </div>
  )
}
