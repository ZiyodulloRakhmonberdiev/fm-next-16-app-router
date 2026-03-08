"use client"

import * as React from "react"
import { filterPublishedRawNews, getNewsListForLocale, type NewsItem } from "@/features/news/model"
import { seedNews } from "@/scripts/seed-news"
import { Card } from "@/shared/common/components/ui/card"
import { Button } from "@/shared/common/components/ui/button"
import {
  formatDate,
  formatDateISO,
  formatDateTimeLocale,
} from "@/shared/common/lib/formatter"
import type { AppLocale } from "@/shared/common/lib/formatter"
import { getCategoryName } from "@/shared/common/lib/seed-helpers"
import { Link } from "@/i18n/navigation"
import Image from "next/image"
import { useLocale, useTranslations } from "next-intl"
import { TruncateExpand } from "@/shared/common/components/ui/truncate-expand"

const PAGE_SIZE = 99

type CategoryPageContentProps = {
  slug: string
}

export function CategoryPageContent({ slug }: CategoryPageContentProps) {
  const locale = useLocale() as AppLocale
  const t = useTranslations("common")
  const category = getCategoryName(slug, locale)

  const allItems = React.useMemo(() => {
    const raw = filterPublishedRawNews([...seedNews.news])
      .filter((n) => n.categorySlug === slug)
      .sort(
        (a, b) =>
          new Date(b.publishedAt).getTime() -
          new Date(a.publishedAt).getTime()
      )
    return getNewsListForLocale(raw, locale)
  }, [slug, locale])

  const featured = allItems.slice(0, 3)
  const rest = allItems.slice(3)
  const [visibleCount, setVisibleCount] = React.useState(PAGE_SIZE)
  const visibleRest = rest.slice(0, visibleCount)
  const hasMore = rest.length > visibleCount

  if (allItems.length === 0) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-8">
        <h1 className="text-2xl font-semibold">{category}</h1>
        <p className="mt-4 text-muted-foreground">{t("search_results_empty")}</p>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-7xl px-2 md:px-6">
      <h1 className="text-2xl font-semibold md:text-3xl">{category}</h1>
      <section className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
        {featured.map((item: NewsItem) => (
          <Link key={item.slug} href={`/news/${item.slug}`} className="block">
            <Card className="h-full overflow-hidden rounded-sm border-border p-0 shadow-none transition-shadow hover:shadow-md">
              <div className="relative aspect-video w-full">
                <Image
                  src={item.images[0]}
                  alt={item.title}
                  fill
                  className="object-cover"
                />
              </div>
              <div className="flex flex-col gap-2 p-2 pt-0">
                <time
                  dateTime={formatDateISO(item.publishedAt)}
                  className="text-xs text-muted-foreground"
                >
                  {formatDateTimeLocale(item.publishedAt, locale)}
                </time>
                <h2 className="text-base font-semibold leading-tight">
                  <TruncateExpand text={item.title} as="span" maxLength={120} />
                </h2>
                <p className="line-clamp-3 text-sm text-muted-foreground">
                  <TruncateExpand text={item.description} as="span" maxLength={160} />
                </p>
              </div>
            </Card>
          </Link>
        ))}
      </section>
      {rest.length > 0 && (
        <section className="mt-4">
          <h2 className="mb-4 text-lg font-semibold">{t("results")}</h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
            {visibleRest.map((item: NewsItem) => (
              <Link
                key={item.slug}
                href={`/news/${item.slug}`}
                className="block"
              >
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
          {hasMore && (
            <div className="mt-8 flex justify-center">
              <Button
                variant="outline"
                onClick={() => setVisibleCount((n) => n + PAGE_SIZE)}
              >
                {t("read_more")}
              </Button>
            </div>
          )}
        </section>
      )}
    </div>
  )
}
