"use client"

import * as React from "react"
import { getNewsListForLocale, isVisualRawNews, type NewsItem } from "@/features/news/model"
import { usePublicNewsQuery } from "@/features/news/model/public-news-query"
import { getCategoryNameFromApi, usePublicCategoriesQuery } from "@/features/category/model/public-categories-query"
import { Card } from "@/shared/common/components/ui/card"
import { formatDate, formatDateISO } from "@/shared/common/lib/formatter"
import type { AppLocale } from "@/shared/common/lib/formatter"
import { Link } from "@/i18n/navigation"
import Image from "next/image"
import { useLocale, useTranslations } from "next-intl"
import { Button } from "@/shared/common/components/ui/button"

type CategoryWithBannerProps = {
  categorySlug?: string
  featuredPosition?: "left" | "right"
}

function FeaturedBlock({
  featured,
  locale,
}: {
  featured: NewsItem
  locale: AppLocale
}) {
  return (
    <Link href={`/news/${featured.slug}`} className="block">
      <Card className="overflow-hidden rounded-sm border-border p-0 shadow-none transition-shadow hover:shadow-md bg-background">
        <div className="relative aspect-video max-h-64 w-full">
          <Image
            src={featured.images[0]}
            alt={featured.title}
            fill
            className="object-cover"
          />
        </div>
        <div className="flex flex-col gap-2 p-3">
          <time
            dateTime={formatDateISO(featured.publishedAt)}
            className="text-xs text-muted-foreground"
          >
            {formatDate(featured.publishedAt, locale)}
          </time>
          <h3 className="text-base font-semibold leading-tight line-clamp-3 hover:underline">
            {featured.title}
          </h3>
          <span className="text-base font-normal text-muted-foreground leading-tight line-clamp-3">
            {featured.description}
          </span>
        </div>
      </Card>
    </Link>
  )
}

export default function CategoryWithBanner({
  categorySlug = "business",
  featuredPosition = "left",
}: CategoryWithBannerProps) {
  const locale = useLocale() as AppLocale
  const t = useTranslations("common")
  const { data: publicNews = [] } = usePublicNewsQuery()
  const { data: categories = [] } = usePublicCategoriesQuery()
  const categoryName = getCategoryNameFromApi(categories, categorySlug, locale)
  const rawSorted = React.useMemo(
    () =>
      [...publicNews]
        .filter(isVisualRawNews)
        .filter((n) => n.categorySlug === categorySlug)
        .sort(
          (a, b) =>
            new Date(b.publishedAt).getTime() -
            new Date(a.publishedAt).getTime()
        ),
    [categorySlug, publicNews]
  )
  const sorted = getNewsListForLocale(rawSorted, locale)
  const [featured, ...rest] = sorted
  const rightItems = rest.slice(0, 6)

  if (sorted.length < 6) return null

  return (
    <section className="w-full space-y-4 pt-4 px-4 md:px-6">
      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border pt-4">
        <h2 className="text-lg font-semibold">{categoryName}</h2>
        <Button variant="ghost" size="sm" asChild className="text-brand">
          <Link href={`/category/${categorySlug}`} className="text-xs md:text-sm">{t("view_all")} {">>"}</Link>
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-2 md:grid-cols-[1fr_1fr]">
        <div
          className={`border-border rounded-sm ${
            featuredPosition === "left" ? "pr-0" : "order-2 md:pl-4"
          }`}
        >
          {featured && (
            <FeaturedBlock featured={featured} locale={locale} />
          )}
        </div>

        <div
          className={`grid md:grid-cols-2 gap-2 justify-start items-start ${
            featuredPosition === "left" ? "md:pl-4" : "order-1 md:pr-4"
          }`}
        >
          {rightItems.map((item: NewsItem) => (
            <Link key={item.slug} href={`/news/${item.slug}`} className="block">
              <Card className="overflow-hidden p-0 rounded-sm shadow-none border border-border transition-shadow hover:shadow-md bg-background">
                <div className="flex gap-3">
                  <div className="relative block h-20 w-28 shrink-0 overflow-hidden rounded-xs md:h-24 md:w-32">
                    <Image
                      src={item.images[0]}
                      alt={item.title}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div className="flex min-w-0 flex-1 flex-col justify-center gap-1 py-1 pr-2">
                    <time
                      dateTime={formatDateISO(item.publishedAt)}
                      className="text-xs text-muted-foreground"
                    >
                      {formatDate(item.publishedAt, locale)}
                    </time>
                    <h4 className="text-sm font-medium leading-tight">
                      <span className="line-clamp-3 hover:underline">
                        {item.title}
                      </span>
                    </h4>
                  </div>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}
