"use client"

import Image from "next/image"
import { Link } from "@/i18n/navigation"
import { useCategoryLabel } from "@/features/category/model/use-category-label"
import type { NewsItem } from "@/features/news/model"
import { resolveNewsImageSrc } from "@/features/news/lib/resolve-news-image-src"
import { getVideoPoster } from "@/features/news/ui/news-listing/news-listing-utils"
import { Card } from "@/shared/common/components/ui/card"
import { cn } from "@/shared/common/lib/utils"
import { formatDateISO, formatDateTimeLocale } from "@/shared/common/lib/formatter"
import type { AppLocale } from "@/shared/common/lib/formatter"

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

        <div className="flex min-w-0 flex-1 flex-col justify-evenly gap-1 py-1">
          <Link
            href={`/category/${item.categorySlug}`}
            className="flex items-center gap-1  capitalize text-muted-foreground hover:underline"
          >
            <span className="block size-2 shrink-0 rounded-full bg-brand" />
            <span className="text-xs capitalize">{categoryLabel}</span>
          </Link>
          <Link href={`/news/${item.slug}`} className="line-clamp-2 text-sm font-medium hover:underline">
            {item.title}
          </Link>
          <div className="flex items-center justify-start gap-1 text-xs text-muted-foreground">
            <time dateTime={formatDateISO(item.publishedAt)} className="shrink-0">
              {formatDateTimeLocale(item.publishedAt, locale)}
            </time>
          </div>
        </div>
      </div>
    </Card>
  )
}

export default MiniNewsCard
