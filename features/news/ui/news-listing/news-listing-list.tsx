"use client"

import type { NewsItem } from "@/features/news/model"
import type { AppLocale } from "@/shared/common/lib/formatter"
import { NewsListingListCard } from "./news-listing-list-card"

type NewsListingListProps = {
  items: NewsItem[]
  locale: AppLocale
  statsBySlug: Record<string, { comments: number; reactions: number }>
  emptyMessage: string
  imagesLabel: string
}

export function NewsListingList({
  items,
  locale,
  statsBySlug,
  emptyMessage,
  imagesLabel,
}: NewsListingListProps) {
  if (items.length === 0) {
    return (
      <div className="rounded-lg border bg-background p-6 text-center text-sm text-muted-foreground">
        {emptyMessage}
      </div>
    )
  }

  return (
    <>
      {items.map((item) => (
        <NewsListingListCard
          key={item.slug}
          item={item}
          locale={locale}
          stats={statsBySlug[item.slug]}
          imagesLabel={imagesLabel}
        />
      ))}
    </>
  )
}
