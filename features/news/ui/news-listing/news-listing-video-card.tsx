"use client"

import Image from "next/image"
import { Link } from "@/i18n/navigation"
import { Eye, Play } from "lucide-react"
import type { AppLocale } from "@/shared/common/lib/formatter"
import { formatDateISO, formatDateTimeLocale } from "@/shared/common/lib/formatter"
import { Card } from "@/shared/common/components/ui/card"
import type { NewsItem } from "@/features/news/model"
import { useCategoryLabel } from "@/features/category/model/use-category-label"
import { getSafeImageSrc, getVideoPoster } from "./news-listing-utils"

type NewsListingVideoCardProps = {
  item: NewsItem
  locale: AppLocale
}

export function NewsListingVideoCard({ item, locale }: NewsListingVideoCardProps) {
  const thumbSrc = getSafeImageSrc(item.images?.[0])
  const videoPoster = !thumbSrc ? getSafeImageSrc(getVideoPoster(item.videoUrl)) : ""
  const showVideo = Boolean(item.videoUrl?.trim())
  const mediaSrc = thumbSrc || videoPoster

  return (
    <Link href={`/news/${item.slug}`} className="group block">
      <Card className="gap-0 overflow-hidden rounded-lg py-0 shadow-none transition-colors hover:bg-muted/30">
        <div className="relative aspect-video w-full overflow-hidden bg-muted">
          {mediaSrc ? (
            <Image
              src={mediaSrc}
              alt={item.title}
              fill
              className="object-cover transition-transform duration-300 group-hover:scale-105"
            />
          ) : null}
          {showVideo ? (
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="inline-flex size-12 items-center justify-center rounded-full bg-black/50">
                <Play className="h-6 w-6 text-white" />
              </span>
            </div>
          ) : null}
        </div>
        <div className="space-y-2 p-3">
          <div className="text-sm font-semibold leading-snug">
            <span className="line-clamp-2">{item.title ?? ""}</span>
          </div>
          {item.description ? (
            <div className="min-w-0">
              <p className="line-clamp-2 wrap-break-word text-xs text-muted-foreground">
                {item.description}
              </p>
            </div>
          ) : null}
          <div className="flex flex-wrap items-center gap-x-2 text-xs text-muted-foreground">
            <span className="font-medium text-brand italic uppercase">{useCategoryLabel(item.categorySlug, locale)}</span>
            <span aria-hidden className="select-none">
              |
            </span>
            <time dateTime={formatDateISO(item.publishedAt)}>
              {formatDateTimeLocale(item.publishedAt, locale)}
            </time>
            <span aria-hidden className="select-none">
              |
            </span>
            <span className="inline-flex items-center gap-1">
              <Eye className="h-3.5 w-3.5" />
              {item.views}
            </span>
          </div>
        </div>
      </Card>
    </Link>
  )
}
