"use client"

import * as React from "react"
import { filterPublishedRawNews, getNewsListForLocale, type NewsItem } from "@/features/news/model"
import { seedNews } from "@/scripts/seed-news"
import { Card } from "@/shared/common/components/ui/card"
import { formatDate, formatDateISO } from "@/shared/common/lib/formatter"
import type { AppLocale } from "@/shared/common/lib/formatter"
import { Link } from "@/i18n/navigation"
import Image from "next/image"
import { useLocale } from "next-intl"

type RelatedNewsProps = {
  categorySlug: string
  excludeSlug: string
}

export default function RelatedNews({ categorySlug, excludeSlug }: RelatedNewsProps) {
  const locale = useLocale() as AppLocale

  const items = React.useMemo(() => {
    const raw = filterPublishedRawNews([...seedNews.news])
      .filter((n) => n.categorySlug === categorySlug && n.slug !== excludeSlug)
      .sort(
        (a, b) =>
          new Date(b.publishedAt).getTime() -
          new Date(a.publishedAt).getTime()
      )
      .slice(0, 9)
    return getNewsListForLocale(raw, locale)
  }, [categorySlug, excludeSlug, locale])

  if (items.length === 0) return null

  return (
    <section className="mt-10 border-t border-border pt-8">
      <h2 className="mb-4 text-lg font-semibold">Related news</h2>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((item: NewsItem) => (
          <Link key={item.slug} href={`/news/${item.slug}`} className="block">
            <Card className="overflow-hidden rounded-sm border-border p-0 shadow-none transition-shadow hover:shadow-md">
              <div className="flex gap-3 p-2">
                <div className="relative h-20 w-28 shrink-0 overflow-hidden rounded-sm">
                  <Image
                    src={item.images[0]}
                    alt={item.title}
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="flex min-w-0 flex-1 flex-col justify-center gap-1">
                  <time
                    dateTime={formatDateISO(item.publishedAt)}
                    className="text-xs text-muted-foreground"
                  >
                    {formatDate(item.publishedAt, locale)}
                  </time>
                  <h3 className="line-clamp-2 text-sm font-medium leading-tight">
                    {item.title}
                  </h3>
                </div>
              </div>
            </Card>
          </Link>
        ))}
      </div>
    </section>
  )
}
