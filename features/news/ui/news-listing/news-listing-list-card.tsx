"use client"

import type { ReactNode } from "react"
import Image from "next/image"
import { Link } from "@/i18n/navigation"
import { Clock, Eye, Heart, MessageSquare, Play } from "lucide-react"
import type { AppLocale } from "@/shared/common/lib/formatter"
import { formatDateISO, formatDateTimeLocale } from "@/shared/common/lib/formatter"
import { Card } from "@/shared/common/components/ui/card"
import type { NewsItem } from "@/features/news/model"
import { useCategoryLabel } from "@/features/category/model/use-category-label"
import { getSafeImageSrc, getVideoPoster } from "./news-listing-utils"

type NewsListingListCardProps = {
  item: NewsItem
  locale: AppLocale
  stats?: { comments: number; reactions: number }
  imagesLabel: string
  imageOverlay?: ReactNode
}

export function NewsListingListCard({ item, locale, stats, imagesLabel, imageOverlay }: NewsListingListCardProps) {
  const categoryLabel = useCategoryLabel(item.categorySlug, locale, item.category)
  const thumbSrc = getSafeImageSrc(item.images?.[0])
  const videoPoster = !thumbSrc ? getSafeImageSrc(getVideoPoster(item.videoUrl)) : ""
  const showVideo = !thumbSrc && Boolean(item.videoUrl?.trim())
  const mediaSrc = thumbSrc || videoPoster

  return (
    <Card className="gap-0 overflow-hidden border-none rounded-lg group p-0 py-0 shadow-none transition-colors bg-foreground/5 hover:bg-background/30">
      <div className="flex flex-col gap-3 p-0 sm:flex-row">
        <div className="relative h-44 w-full overflow-hidden rounded-md bg-muted sm:h-48 sm:basis-1/3">
          <Link href={`/news/${item.slug}`} className="absolute inset-0 z-0 block">
            {mediaSrc ? (
              <Image
                src={mediaSrc}
                alt={item.title}
                fill
                className="object-cover transition-transform duration-300 group-hover:scale-105"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center px-1 text-center text-[10px] text-muted-foreground">
                {imagesLabel}
              </div>
            )}
          </Link>
          {showVideo ? (
            <span className="pointer-events-none absolute bottom-2 left-2 z-10 inline-flex size-8 items-center justify-center rounded-full bg-brand text-foreground shadow-md ring-1 ring-black/5">
              <Play className="size-4 fill-current text-white" />
            </span>
          ) : null}
          {imageOverlay ? (
            <div className="absolute right-2 top-2 z-2">{imageOverlay}</div>
          ) : null}
        </div>

        <div className="min-w-0 flex flex-1 flex-col justify-start space-y-2 p-2 sm:basis-2/3 md:p-4">
          <div className="flex flex-wrap items-center text-[11px] text-muted-foreground gap-2 justify-between border-b border-border pb-2">
            <Link href={`/category/${item.categorySlug}`} className=" hover:underline capitalize inline-flex items-center gap-1">
              <span className="block w-2 h-2 bg-brand rounded-full"></span>
              {categoryLabel}
            </Link>
            <div className="inline-flex items-center gap-1">
              <time dateTime={formatDateISO(item.publishedAt)} className="inline-flex items-center gap-1">
                {formatDateTimeLocale(item.publishedAt, locale)}
              </time>
            </div>
          </div>

          <Link href={`/news/${item.slug}`} className="text-sm font-semibold leading-snug hover:underline">
            <span className="line-clamp-2">{item.title ?? ""}</span>
          </Link>

          {item.description ? (
            <div className="min-w-0">
              <p className="line-clamp-3 wrap-break-word text-sm text-muted-foreground">
                {item.description}
              </p>
            </div>
          ) : null}

          <div className="flex items-center justify-start gap-2 text-xs text-muted-foreground pt-2 border-t border-border mt-auto">

            <div className="inline-flex items-center gap-3 pl-1">
              <span className="inline-flex items-center gap-1">
                <Clock className="h-3.5 w-3.5" />
                {item.minutes}
              </span>
              <span aria-hidden className="select-none text-xs text-border">|</span>
              <span className="inline-flex items-center gap-1">
                <Eye className="h-3.5 w-3.5" />
                {item.views}
              </span>
              <span aria-hidden className="select-none text-xs text-border">
                |
              </span>
              <span className="inline-flex items-center gap-1">
                <MessageSquare className="h-3.5 w-3.5" />
                {stats?.comments ?? 0}
              </span>
              <span aria-hidden className="select-none text-xs text-border">
                |
              </span>
              <span className="inline-flex items-center gap-1">
                <Heart className="h-3.5 w-3.5" />
                {stats?.reactions ?? 0}
              </span>

            </div>
          </div>
        </div>
      </div>
    </Card>
  )
}
