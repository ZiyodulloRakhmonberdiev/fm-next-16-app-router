"use client"

import Image from "next/image"
import { Link } from "@/i18n/navigation"
import type { NewsItem } from "@/features/news/model"
import { resolveNewsImageSrc } from "@/features/news/lib/resolve-news-image-src"
import { Card } from "@/shared/common/components/ui/card"
import { cn } from "@/shared/common/lib/utils"
import {
  formatDateISO,
  formatDateTimeLocale,
} from "@/shared/common/lib/formatter"
import type { AppLocale } from "@/shared/common/lib/formatter"

export type FeaturedNewsCardVariant = "banner" | "column"

export type FeaturedNewsCardProps = {
  item: NewsItem
  locale: AppLocale
  /** banner = BannerSection featured; column = ColumnSection katta karta */
  variant?: FeaturedNewsCardVariant
  className?: string
}

export function FeaturedNewsCard({
  item,
  locale,
  variant = "banner",
  className,
}: FeaturedNewsCardProps) {
  const img = resolveNewsImageSrc(item.images?.[0])

  if (variant === "column") {
    return (
      <Card
        className={cn(
          "overflow-hidden rounded-sm border-none p-0 shadow-none transition-shadow hover:shadow-none",
          className
        )}
      >
        <Link href={`/news/${item.slug}`} className="block">
          <div className="relative aspect-video w-full">
            {img ? (
              <Image
                src={img}
                alt={item.title}
                fill
                className="object-cover"
              />
            ) : null}
          </div>
        </Link>
        <div className="flex flex-col gap-2 p-4">
          <div className="flex flex-wrap items-center gap-x-1.5 text-xs text-muted-foreground">
            <span className="font-medium uppercase italic text-brand">
              {item.category}
            </span>
            <span aria-hidden>/</span>
            <time dateTime={formatDateISO(item.publishedAt)}>
              {formatDateTimeLocale(item.publishedAt, locale)}
            </time>
          </div>
          <h3 className="text-lg font-semibold leading-tight">
            <Link href={`/news/${item.slug}`} className="hover:underline">
              <span className="line-clamp-3">{item.title}</span>
            </Link>
          </h3>
          <p className="text-sm text-muted-foreground">
            <span className="line-clamp-3">{item.description ?? ""}</span>
          </p>
        </div>
      </Card>
    )
  }

  /* banner */
  return (
    <Link href={`/news/${item.slug}`} className={cn("block", className)}>
      <Card className="overflow-hidden rounded-sm border-border bg-background p-0 shadow-none transition-shadow hover:shadow-none">
        <div className="relative aspect-video max-h-64 w-full">
          {img ? (
            <Image
              src={img}
              alt={item.title}
              fill
              className="object-cover"
            />
          ) : null}
        </div>
        <div className="flex flex-col gap-2 p-3">
          <span className="text-xs font-medium uppercase italic text-brand">
            {item.category}
          </span>
          <h3 className="line-clamp-3 text-base font-semibold leading-tight hover:underline">
            {item.title}
          </h3>
          {/* <span className="line-clamp-2 text-base font-normal leading-tight text-muted-foreground">
            {item.description}
          </span> */}
          <time
            dateTime={formatDateISO(item.publishedAt)}
            className="text-xs text-muted-foreground"
          >
            {formatDateTimeLocale(item.publishedAt, locale)}
          </time>
        </div>
      </Card>
    </Link>
  )
}

export default FeaturedNewsCard
