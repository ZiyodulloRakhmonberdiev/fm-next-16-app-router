"use client"

import * as React from "react"
import { seedNews } from "@/scripts/seed-news"
import { Card } from "@/shared/common/components/ui/card"
import { formatDate, formatDateISO } from "@/shared/common/lib/formatter"
import type { AppLocale } from "@/shared/common/lib/formatter"
import { Link } from "@/i18n/navigation"
import Image from "next/image"
import { useLocale, useTranslations } from "next-intl"
import { Button } from "@/shared/common/components/ui/button"
import { TruncateExpand } from "@/shared/common/components/ui/truncate-expand"

type NewsItem = (typeof seedNews.news)[number]

type CategoryWithBannerProps = {
  /** Category name — news filtered by this */
  category?: string
  categorySlug?: string
  /** Featured block: "left" (default) or "right" */
  featuredPosition?: "left" | "right"
}

function slugFromCategory(category: string): string {
  return category.toLowerCase().replace(/\s+/g, "-")
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
      <Card className="overflow-hidden rounded-sm border-border p-0 shadow-none transition-shadow hover:shadow-md">
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
  category = "Business",
  categorySlug,
  featuredPosition = "left",
}: CategoryWithBannerProps) {
  const locale = useLocale() as AppLocale
  const slug = categorySlug ?? slugFromCategory(category)
  const t = useTranslations("common")
  const sorted = React.useMemo(
    () =>
      [...seedNews.news]
        .filter((n) => n.category === category)
        .sort(
          (a, b) =>
            new Date(b.publishedAt).getTime() -
            new Date(a.publishedAt).getTime()
        ),
    [category]
  )

  const [featured, ...rest] = sorted
  const rightItems = rest.slice(0, 6)

  if (sorted.length === 0) return null

  return (
    <section className="w-full space-y-4 pt-4 px-4 md:px-6">
      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border pt-4">
        <h2 className="text-lg font-semibold">{category}</h2>
        <Button variant="ghost" size="sm" asChild className="text-brand">
          <Link href={`/category/${slug}`}>{t("view_all")} {">>"}</Link>
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
          className={`grid md:grid-cols-2 gap-2 ${
            featuredPosition === "left" ? "md:pl-4" : "order-1 md:pr-4"
          }`}
        >
          {rightItems.map((item: NewsItem) => (
            <Link
              key={item.slug}
              href={`/news/${item.slug}`}
              className="flex gap-3 items-center p-3 transition-colors hover:bg-muted/50 border-b border-border rounded-sm"
            >
              <div className="flex min-w-0 flex-1 flex-col justify-center gap-1">
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
              <div className="relative h-16 w-24 shrink-0 overflow-hidden rounded-sm">
                <Image
                  src={item.images[0]}
                  alt={item.title}
                  fill
                  className="object-cover"
                />
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}
