"use client"

import * as React from "react"
import Image from "next/image"
import { Link } from "@/i18n/navigation"
import { useLocale } from "next-intl"
import type { AppLocale } from "@/shared/common/lib/locale-api"
import { getNewsListForLocale, type RawNewsItem } from "@/features/news/model"
import { usePublicCategoriesQuery } from "@/features/category/model/public-categories-query"
import { getCategoryLabelForNewsItem } from "@/features/category/model/use-category-label"
import { formatDateISO, formatDateTimeDotSlash } from "@/shared/common/lib/formatter"

function getSafeImageSrc(raw?: string): string {
  if (!raw?.trim()) return ""
  const candidate =
    raw.startsWith("http://") || raw.startsWith("https://") || raw.startsWith("/")
      ? raw
      : `/uploads/images/${raw}`
  try {
    new URL(candidate, "http://localhost")
    return candidate
  } catch {
    return ""
  }
}

export function SpecialNewsPageContent({
  title,
  initialNews,
}: {
  title: string
  initialNews: RawNewsItem[]
}) {
  const locale = useLocale() as AppLocale
  const { data: categories = [] } = usePublicCategoriesQuery()
  const items = React.useMemo(
    () => getNewsListForLocale(initialNews, locale),
    [initialNews, locale]
  )

  return (
    <section className="space-y-4">
      <h1 className="text-2xl font-bold md:text-3xl">{title}</h1>
      <div className="space-y-3">
        {items.map((item) => {
          const thumb = getSafeImageSrc(item.images?.[0])
          const categoryLabel = getCategoryLabelForNewsItem(categories, false, item, locale)
          return (
            <Link
              key={item.slug}
              href={`/news/${item.slug}`}
              className="group grid grid-cols-1 overflow-hidden rounded-sm border bg-background md:grid-cols-3"
            >
              <div className="order-2 flex min-h-[150px] flex-col justify-between gap-3 p-4 md:order-1 md:col-span-2">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <span className="line-clamp-1">{categoryLabel}</span>
                  <span>|</span>
                  <time dateTime={formatDateISO(item.publishedAt)}>{formatDateTimeDotSlash(item.publishedAt)}</time>
                </div>
                <h2 className="line-clamp-3 text-lg font-semibold leading-snug transition-colors group-hover:text-primary">
                  {item.title}
                </h2>
              </div>
              <div className="relative order-1 aspect-video w-full bg-muted md:order-2 md:aspect-auto md:h-full">
                {thumb ? (
                  <Image src={thumb} alt={item.title} fill className="object-cover" />
                ) : null}
              </div>
            </Link>
          )
        })}
      </div>
    </section>
  )
}
