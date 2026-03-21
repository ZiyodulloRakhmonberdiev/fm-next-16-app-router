"use client"

import type { NewsItem } from "@/features/news/model"
import type { AppLocale } from "@/shared/common/lib/formatter"
import { NewsListingVideoCard } from "./news-listing-video-card"

type NewsListingVideoGridProps = {
  items: NewsItem[]
  locale: AppLocale
  emptyMessage: string
}

export function NewsListingVideoGrid({ items, locale, emptyMessage }: NewsListingVideoGridProps) {
  if (items.length === 0) {
    return (
      <div className="col-span-full rounded-lg border bg-background p-6 text-center text-sm text-muted-foreground">
        {emptyMessage}
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {items.map((item) => (
        <NewsListingVideoCard key={item.slug} item={item} locale={locale} />
      ))}
    </div>
  )
}
