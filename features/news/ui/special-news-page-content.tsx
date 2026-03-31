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
  headerImageUrl,
  headerSubtitle,
  headerDescription,
  initialNews,
}: {
  title: string
  headerImageUrl?: string
  headerSubtitle?: string
  headerDescription?: string
  initialNews: RawNewsItem[]
}) {
  const locale = useLocale() as AppLocale
  const { data: categories = [] } = usePublicCategoriesQuery()
  const items = React.useMemo(
    () => getNewsListForLocale(initialNews, locale),
    [initialNews, locale]
  )

  return (
    <section className="space-y-4 mx-auto pt-4">
      <div className="border-b flex justify-start">
        <h1 className="text-2xl font-bold md:text-3xl text-center bg-brand text-white inline-block px-3 py-2 rounded-xs">
          {title}
        </h1>
      </div>
      {headerImageUrl || headerSubtitle || headerDescription ? (
        <div className="p-4 bg-foreground/10 dark:bg-card">
          <div className="flex items-start flex-col md:flex-row gap-4">
            
            <div className="min-w-0 order-2 md:order-0">
              {headerSubtitle ? (
                <p className="text-lg md:text-2xl font-bold leading-snug">{headerSubtitle}</p>
              ) : null}
              {headerDescription ? (
                <p className="mt-1 text-sm text-muted-foreground">{headerDescription}</p>
              ) : null}
            </div>
            {headerImageUrl ? (
              <div className="relative w-full h-[30vh] rounded-md md:w-[120px] md:h-[90px] shrink-0 overflow-hidden bg-muted ring-1 ring-border order-1">
                <Image src={headerImageUrl} alt={title} fill className="object-cover" />
              </div>
            ) : null}
          </div>
        </div>
      ) : null}
      <div className="space-y-5 max-w-3xl mx-auto">
        {items.map((item) => {
          const thumb = getSafeImageSrc(item.images?.[0])
          const categoryLabel = getCategoryLabelForNewsItem(categories, false, item, locale)
          return (
            <Link
              key={item.slug}
              href={`/news/${item.slug}`}
              className="group grid grid-cols-3 overflow-hidden bg-background md:grid-cols-3"
            >
              <div className="flex md:min-h-[150px]  md:flex-col items-start md:items-start justify-center md:gap-3 md:p-4 col-span-2 font-semibold">
                <div className="hidden md:flex items-center gap-2 text-sm text-muted-foreground">
                  <span className="line-clamp-1">{categoryLabel}</span>
                  <span>|</span>
                  <time dateTime={formatDateISO(item.publishedAt)}>{formatDateTimeDotSlash(item.publishedAt)}</time>
                </div>
                <h2 className="line-clamp-3 md:text-xl font-bold leading-snug transition-colors group-hover:text-brand">
                  {item.title}
                </h2>
              </div>
              <div className="relative order-1 w-28 h-20 bg-muted md:order-2 md:w-full md:h-full rounded-md md:rounded-none">
                {thumb ? (
                  <Image src={thumb} alt={item.title} fill className="object-cover rounded-md md:rounded-none" />
                ) : null}
              </div>
            </Link>
          )
        })}
      </div>
    </section>
  )
}
