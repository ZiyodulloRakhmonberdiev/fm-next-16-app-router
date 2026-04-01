"use client"

import Image from "next/image"
import { Link } from "@/i18n/navigation"
import { useCategoryLabel } from "@/features/category/model/use-category-label"
import type { NewsItem } from "@/features/news/model"
import { resolveNewsImageSrc } from "@/features/news/lib/resolve-news-image-src"
import { getVideoPoster } from "@/features/news/ui/news-listing/news-listing-utils"
import { Card } from "@/shared/common/components/ui/card"
import { cn } from "@/shared/common/lib/utils"
import type { AppLocale } from "@/shared/common/lib/formatter"
import { NewsCardContent } from "@/shared/common/components/news-sections/news-card-content"

export type MiniNewsCardVariant =
  | "banner-side"
  | "banner-mobile"
  | "latest"
  | "row"
  | "authors-choice"

export type MiniNewsCardProps = {
  item: NewsItem
  locale: AppLocale
  variant: MiniNewsCardVariant
  className?: string
}

export function MiniNewsCard({
  item,
  locale,
  variant: _variant,
  className,
}: MiniNewsCardProps) {
  const categoryLabel = useCategoryLabel(item.categorySlug, locale, item.category)

  const fromImage = resolveNewsImageSrc(item.images?.[0])
  const thumbSrc = fromImage || getVideoPoster(item.videoUrl) || ""

  return (
    <Card
      className={cn(
        "group gap-0 border-transparent bg-transparent py-0 shadow-none hover:border-border hover:shadow-none",
        className
      )}
    >
      <div className="flex items-stretch gap-3">
        <Link href={`/news/${item.slug}`} className="relative h-24 w-32 shrink-0 overflow-hidden rounded-md bg-muted transition-transform duration-300">
          {thumbSrc ? (
            <Image
              src={thumbSrc}
              alt={item.title}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-300"
            />
          ) : null}
        </Link>

        <div className="flex flex-col justify-between gap-0.5 py-1">
          <NewsCardContent
            item={item}
            locale={locale}
            categoryLabel={categoryLabel}
            variant="stacked"
            dateVariant="dateTimeSlash"
            descriptionClassName="hidden"
            titleClassName="line-clamp-2"
            showMediaIndicators
          />
        </div>
      </div>
    </Card>
  )
}

export default MiniNewsCard
