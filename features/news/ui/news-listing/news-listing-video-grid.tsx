"use client"

import * as React from "react"
import type { NewsItem } from "@/features/news/model"
import type { AppLocale } from "@/shared/common/lib/formatter"
import { usePublicCategoriesQuery } from "@/features/category/model/public-categories-query"
import { getCategoryLabelForNewsItem } from "@/features/category/model/use-category-label"
import { VideoNewsModal } from "@/shared/common/components/molecules"
import { NewsListingVideoCard } from "./news-listing-video-card"

type NewsListingVideoGridProps = {
  items: NewsItem[]
  locale: AppLocale
  emptyMessage: string
}

export function NewsListingVideoGrid({ items, locale, emptyMessage }: NewsListingVideoGridProps) {
  const { data: categories = [], isPending: categoriesPending } = usePublicCategoriesQuery()
  const [selected, setSelected] = React.useState<NewsItem | null>(null)
  const [isOpen, setIsOpen] = React.useState(false)

  if (items.length === 0) {
    return (
      <div className="col-span-full rounded-lg border bg-background p-6 text-center text-sm text-muted-foreground">
        {emptyMessage}
      </div>
    )
  }

  return (
    <>
      <ul className="grid list-none grid-cols-1 gap-3 p-0 sm:grid-cols-2 sm:gap-4 md:grid-cols-2">
        {items.map((item) => (
          <NewsListingVideoCard
            key={item.slug}
            item={item}
            categoryLabel={getCategoryLabelForNewsItem(categories, categoriesPending, item, locale)}
            onOpenVideo={(i) => {
              setSelected(i)
              setIsOpen(true)
            }}
          />
        ))}
      </ul>

      <VideoNewsModal
        item={selected}
        open={isOpen}
        onOpenChange={(open) => {
          setIsOpen(open)
          if (!open) setSelected(null)
        }}
      />
    </>
  )
}
