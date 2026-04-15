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
import { CategoryName } from "@/entities/news/_components/atoms/category-name"
import { PublishedAt } from "@/entities/news/_components/atoms/published-at"

export type SimpleNewsCardVariant =
  | "row"
  | "column"
  | "featured"

export type SimpleNewsCardProps = {
  item: NewsItem
  locale: AppLocale
  variant: SimpleNewsCardVariant
  className?: string
  title?: boolean
  description?: boolean
  publishedAt?: boolean
  categoryName?: boolean
}

export function SimpleNewsCard({
  item,
  locale,
  variant,
  className,
  title = true,
  description = true,
  publishedAt = true,
  categoryName = true,
}: SimpleNewsCardProps) {
  const categoryLabel = useCategoryLabel(item.categorySlug, locale, item.category)

  const fromImage = resolveNewsImageSrc(item.images?.[0])
  const thumbSrc = fromImage || getVideoPoster(item.videoUrl) || ""

  if (variant === "row") {
    return (
      <Link
        href={`/news/${item.slug}`}
        className={cn(
          "group gap-0 border-transparent bg-transparent py-0 shadow-none hover:border-border hover:shadow-none",
          className
        )}
      >
        <div className="flex items-stretch gap-3">
          <div className="relative h-18 w-18 md:h-24 md:w-32 shrink-0 overflow-hidden rounded-md bg-muted transition-transform duration-300">
            {thumbSrc ? (
              <Image
                src={thumbSrc}
                alt={item.title}
                fill
                className="object-cover transition-transform duration-300"
              />
            ) : null}
          </div>

          <div className="flex flex-col justify-between gap-0.5 py-1">
            <span className=""></span>
            {categoryName ? <CategoryName categorySlug={item.categorySlug} categoryLabel={categoryLabel} /> : null}
            {title ? (
              <div className="text-xs md:text-lg font-semibold leading-tight hover:text-brand transition-colors line-clamp-2 select-none group-hover:text-brand">
                {item.title}
              </div>
            ) : null}
            {description ? (
              <p className="text-sm text-muted-foreground select-none">
                <span className="line-clamp-2">{item.description ?? ""}</span>
              </p>
            ) : null}
            {publishedAt ? <PublishedAt publishedAt={item.publishedAt} /> : null}
          </div>
        </div>
      </Link>
    )
  }

  const isFeatured = variant === "featured"

  return (
    <Link
      href={`/news/${item.slug}`}
      className={cn(
        "group gap-0 border-transparent bg-transparent py-0 hover:bg-card select-none",
        className
      )}
    >
      <div className="flex flex-col gap-3">
        <div
          className={cn(
            "relative w-full overflow-hidden rounded-md bg-muted transition-transform duration-300",
            isFeatured ? "aspect-video max-h-72" : "aspect-video max-h-60"
          )}
        >
          {thumbSrc ? (
            <Image
              src={thumbSrc}
              alt={item.title}
              fill
              className="object-cover transition-transform duration-300"
            />
          ) : null}
        </div>

        <div className={cn("flex flex-col gap-1.5", isFeatured ? "px-2 pb-2" : "py-1")}>
          <div className="flex items-center justify-between gap-2">
            {categoryName ? (
              <CategoryName
                categorySlug={item.categorySlug}
                categoryLabel={categoryLabel}
                hasVideo={Boolean(item.videoUrl?.trim())}
              />
            ) : null}
            {publishedAt ? <PublishedAt publishedAt={item.publishedAt} /> : null}
          </div>
          {title ? (
            <div
              className={cn(
                "font-bold leading-normal tracking-wider hover:text-brand transition-colors",
                isFeatured ? "text-lg line-clamp-3 select-none group-hover:text-brand" : "text-base line-clamp-2 select-none group-hover:text-brand"
              )}
            >
              {item.title}
            </div>
          ) : null}
          {description ? (
            <p className={cn("text-sm text-muted-foreground", isFeatured ? "line-clamp-3" : "line-clamp-2")}>
              {item.description ?? ""}
            </p>
          ) : null}
        </div>
      </div>
    </Link>
  )
}

export default SimpleNewsCard
