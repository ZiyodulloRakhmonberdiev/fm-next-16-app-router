"use client"

import * as React from "react"
import { getNewsListForLocale, isImageTypeRawNews, type NewsItem } from "@/features/news/model"
import { usePublicNewsQuery } from "@/features/news/model/public-news-query"
import { LoadMoreButton } from "@/shared/common/components/molecules"
import type { AppLocale } from "@/shared/common/lib/formatter"
import { useLocale, useTranslations } from "next-intl"
import { cn } from "@/shared/common/lib/utils"
import { NewsListingListCard } from "@/features/news/ui/news-listing/news-listing-list-card"

type RelatedNewsProps =
  | { categorySlug: string; excludeSlug: string; latestLimit?: never; sidebar?: boolean }
  | { categorySlug?: never; excludeSlug?: never; latestLimit: number; sidebar?: boolean }

export default function RelatedNews(props: RelatedNewsProps) {
  const { categorySlug, excludeSlug, latestLimit, sidebar = false } = props
  const locale = useLocale() as AppLocale
  const t = useTranslations("common")
  const { data: publicNews = [] } = usePublicNewsQuery()

  const isLatestMode = latestLimit != null && latestLimit > 0
  const sectionTitle = isLatestMode ? t("latest_news") : t("related_news")

  const [visibleCount, setVisibleCount] = React.useState(
    isLatestMode && latestLimit ? latestLimit : 4
  )

  const items = React.useMemo(() => {
    const raw = [...publicNews]
      .filter(isImageTypeRawNews)
      .filter((n) => {
        if (isLatestMode) return true
        if (n.slug === excludeSlug) return false
        if (categorySlug && n.categorySlug !== categorySlug) return false
        return true
      })
      .sort(
        (a, b) =>
          new Date(b.publishedAt).getTime() -
          new Date(a.publishedAt).getTime()
      )
    return getNewsListForLocale(raw, locale)
  }, [categorySlug, excludeSlug, locale, publicNews, isLatestMode])

  const visibleItems = items.slice(0, visibleCount)

  if (visibleItems.length === 0) return null

  return (
    <section
      className={cn(
        sidebar ? "mt-0 border-0 pt-0" : "mt-10 border-t border-border pt-8"
      )}
    >
      <h2
        className={cn(
          "font-semibold",
          sidebar ? "mb-4 text-lg md:text-xl" : "mb-6 text-xl md:text-2xl"
        )}
      >
        {sectionTitle}
      </h2>
      <div className="grid grid-cols-1 gap-4">
        {visibleItems.map((item: NewsItem) => (
          <NewsListingListCard
            key={item.slug}
            item={item}
            locale={locale}
            stats={{
              comments: item.commentCount ?? 0,
              reactions: item.reactionCount ?? 0,
            }}
            imagesLabel={t("images")}
          />
        ))}
      </div>
      {visibleCount < items.length && (
        <div className="mt-4 flex justify-start">
          <LoadMoreButton
            label={t("load_more")}
            onClick={() => setVisibleCount((prev) => prev + 4)}
          />
        </div>
      )}
    </section>
  )
}
