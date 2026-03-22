"use client"

import Image from "next/image"
import { Link } from "@/i18n/navigation"
import type { NewsItem } from "@/features/news/model"
import { resolveNewsImageSrc } from "@/features/news/lib/resolve-news-image-src"
import { Card } from "@/shared/common/components/ui/card"
import { cn } from "@/shared/common/lib/utils"
import {
  formatDate,
  formatDateISO,
  formatDateTimeLocale,
} from "@/shared/common/lib/formatter"
import type { AppLocale } from "@/shared/common/lib/formatter"
import { Calendar } from "lucide-react"

export type MiniNewsCardVariant =
  | "banner-side"
  | "banner-mobile"
  | "latest"
  | "row"

export type MiniNewsCardProps = {
  item: NewsItem
  locale: AppLocale
  variant: MiniNewsCardVariant
  className?: string
}

export function MiniNewsCard({
  item,
  locale,
  variant,
  className,
}: MiniNewsCardProps) {
  const thumbSrc = resolveNewsImageSrc(item.images?.[0])

  if (variant === "banner-side") {
    return (
      <Link
        href={`/news/${item.slug}`}
        className={cn("block", className)}
      >
        <Card className="overflow-hidden rounded-sm border-none bg-background p-0 shadow-none transition-shadow hover:shadow-none">
          <div className="flex gap-2">
            <div className="relative block h-20 w-20 shrink-0 overflow-hidden rounded-xs md:h-22 md:w-32">
              {thumbSrc ? (
                <Image
                  src={thumbSrc}
                  alt={item.title}
                  fill
                  className="object-cover"
                />
              ) : null}
            </div>
            <div className="flex min-w-0 flex-1 flex-col justify-between gap-1 py-2 pr-4">
              <div className="flex items-center justify-start gap-2">
                <span className="text-xs font-medium uppercase italic text-brand">
                  {item.category}
                </span>
              </div>
              <h4 className="text-sm font-medium leading-tight">
                <span className="line-clamp-2 hover:underline">{item.title}</span>
              </h4>
              <time
                dateTime={formatDate(item.publishedAt)}
                className="text-xs text-muted-foreground flex items-center gap-1"
              >
                {/* <Calendar className="w-4 h-4" />   */}
                <span>{formatDateTimeLocale(item.publishedAt, locale)}</span>
              </time>
              {/* <h4 className="text-sm text-muted-foreground leading-tight">
                <span className="line-clamp-2 hover:underline">{item.description}</span>
              </h4> */}

            </div>
          </div>
        </Card>
      </Link>
    )
  }

  if (variant === "banner-mobile") {
    return (
      <Link
        href={`/news/${item.slug}`}
        className={cn("block", className)}
      >
        <Card className="overflow-hidden rounded-sm border border-border bg-background p-0 shadow-none transition-shadow hover:shadow-md">
          <div className="flex gap-3">
            <div className="relative block h-20 w-20 shrink-0 overflow-hidden rounded-xs">
              {thumbSrc ? (
                <Image
                  src={thumbSrc}
                  alt={item.title}
                  fill
                  className="object-cover"
                />
              ) : null}
            </div>
            <div className="flex min-w-0 flex-1 flex-col justify-center gap-1 py-3 pr-4">
              <time
                dateTime={formatDate(item.publishedAt)}
                className="text-xs text-muted-foreground"
              >
                {formatDateTimeLocale(item.publishedAt, locale)}
              </time>
              <h4 className="text-sm font-medium leading-tight">
                <span className="line-clamp-3 hover:underline">{item.title}</span>
              </h4>
            </div>
          </div>
        </Card>
      </Link>
    )
  }

  if (variant === "latest") {
    return (
      <Card
        className={cn("overflow-hidden rounded-sm p-0 shadow-none", className)}
      >
        <div className="flex gap-3">
          <Link
            href={`/news/${item.slug}`}
            className="relative block h-20 w-28 shrink-0 overflow-hidden rounded-xs md:h-24 md:w-32"
          >
            {thumbSrc ? (
              <Image
                src={thumbSrc}
                alt={item.title}
                fill
                className="object-cover"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center px-1 text-center text-[10px] text-muted-foreground">
                Rasmni yuklab bo'lmadi
              </div>
            )}
          </Link>
          <div className="flex min-w-0 flex-1 flex-col justify-center gap-2 px-1 py-2">
            <div className="flex flex-wrap items-center gap-x-1.5 text-xs text-muted-foreground">
              <span className="font-medium uppercase italic text-brand">
                {item.category}
              </span>

            </div>
            <Link
              href={`/news/${item.slug}`}
              className="line-clamp-2 text-sm font-medium leading-tight hover:underline"
            >
              {item.title}
            </Link>
            <time dateTime={formatDateISO(item.publishedAt)} className="text-xs text-muted-foreground">
              {formatDateTimeLocale(item.publishedAt, locale)}
            </time>
          </div>
        </div>
      </Card>
    )
  }

  /* row */
  return (
    <Link
      href={`/news/${item.slug}`}
      className={cn("group block", className)}
    >
      <Card className="gap-0 border-0 bg-transparent py-0 shadow-none">
        <div className="flex items-stretch gap-3">
          <div className="relative h-24 w-32 shrink-0 overflow-hidden rounded-md bg-muted">
            {thumbSrc ? (
              <Image
                src={thumbSrc}
                alt={item.title}
                fill
                className="object-cover transition-transform duration-300 group-hover:scale-105"
              />
            ) : null}
          </div>

          <div className="flex min-w-0 flex-1 flex-col justify-around">
            <div className="flex items-center justify-between gap-3 text-xs text-muted-foreground">
              <span className="inline-flex items-center gap-1">
                <span className="font-medium uppercase italic text-brand">
                  {item.category}
                </span>
              </span>
            </div>
            <div className="line-clamp-2 text-sm font-medium group-hover:underline">
              {item.title}
            </div>
            <div className="flex items-center justify-start gap-1 text-xs text-muted-foreground">
              <time dateTime={formatDate(item.publishedAt)} className="shrink-0">
                {formatDateTimeLocale(item.publishedAt, locale)}
              </time>
            </div>
          </div>
        </div>
      </Card>
    </Link>
  )
}

export default MiniNewsCard
