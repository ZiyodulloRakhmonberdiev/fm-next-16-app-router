"use client"

import Image from "next/image"
import { Link } from "@/i18n/navigation"
import type { NewsItem } from "@/features/news/model"
import { resolveNewsImageSrc } from "@/features/news/lib/resolve-news-image-src"
import { Card } from "@/shared/common/components/ui/card"
import { cn } from "@/shared/common/lib/utils"
import type { AppLocale } from "@/shared/common/lib/formatter"
import { useCategoryLabel } from "@/features/category/model/use-category-label"
import { NewsCardContent } from "@/shared/common/components/news-sections/news-card-content"

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
  const categoryLabel = useCategoryLabel(item.categorySlug, locale, item.category)

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
          <NewsCardContent
            item={item}
            locale={locale}
            categoryLabel={categoryLabel}
            titleClassName="text-lg"
            variant="inline"
            dateVariant="dateTimeSlash"
          />
        </div>
      </Card>
    )
  }

  /* banner */
  return (
    <Card className="overflow-hidden rounded-sm border-border group bg-background p-0 shadow-none transition-shadow hover:shadow-none">
      <Link href={`/news/${item.slug}`} className="relative aspect-video max-h-64 w-full group-hover:scale-105 transition-transform duration-300">
        {img ? (
          <Image
            src={img}
            alt={item.title}
            fill
            className="object-cover"
          />
        ) : null}
      </Link>
      <div className="flex flex-col gap-2 p-3">
        <NewsCardContent
          item={item}
          locale={locale}
          categoryLabel={categoryLabel}
          variant="inline"
          dateVariant="dateTimeSlash"
          titleClassName="text-base"
          descriptionClassName="leading-tight"
        />
      </div>
    </Card>
  )
}

export default FeaturedNewsCard
