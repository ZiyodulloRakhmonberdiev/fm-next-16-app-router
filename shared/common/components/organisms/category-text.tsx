"use client"

import * as React from "react"
import { Link } from "@/i18n/navigation"
import { useLocale, useTranslations } from "next-intl"
import { Card } from "@/shared/common/components/ui/card"
import { Button } from "@/shared/common/components/ui/button"
import { formatDateISO, formatDateTimeLocale, type AppLocale } from "@/shared/common/lib/formatter"
import { TruncateExpand } from "@/shared/common/components/ui/truncate-expand"
import {
  getNewsListForLocale,
  isTextOnlyRawNews,
  type NewsItem,
} from "@/features/news/model"
import { usePublicNewsQuery } from "@/features/news/model/public-news-query"
import { getCategoryNameFromApi, usePublicCategoriesQuery } from "@/features/category/model/public-categories-query"

type CategoryTextProps = {
  categorySlug?: string
}

export default function CategoryText({ categorySlug = "business" }: CategoryTextProps) {
  const locale = useLocale() as AppLocale
  const t = useTranslations("common")
  const { data: publicNews = [] } = usePublicNewsQuery()
  const { data: categories = [] } = usePublicCategoriesQuery()
  const categoryName = getCategoryNameFromApi(categories, categorySlug, locale)

  const items = React.useMemo(() => {
    const raw = [...publicNews]
      .filter((n) => n.categorySlug === categorySlug)
      .filter(isTextOnlyRawNews)
      .sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime())
      .slice(0, 9)
    return getNewsListForLocale(raw, locale)
  }, [publicNews, categorySlug, locale])

  if (items.length === 0) return null

  return (
    <section className="w-full space-y-4 pt-4 px-4 md:px-6">
      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border pt-4">
        <h2 className="text-lg font-semibold">{categoryName}</h2>
        <Button variant="ghost" size="sm" asChild className="text-brand">
          <Link href={`/category/${categorySlug}`} className="text-xs md:text-sm">
            {t("view_all")} {">>"}
          </Link>
        </Button>
      </div>

      <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((item: NewsItem) => (
          <li key={item.slug}>
            <Card className="rounded-sm p-3 shadow-none">
              <div className="flex min-w-0 flex-1 flex-col justify-center gap-2">
                <div className="flex flex-wrap items-center gap-x-1.5 text-xs text-muted-foreground">
                  <span className="uppercase font-medium text-brand italic">{item.category}</span>
                  <span aria-hidden>/</span>
                  <time dateTime={formatDateISO(item.publishedAt)}>
                    {formatDateTimeLocale(item.publishedAt, locale)}
                  </time>
                </div>
                <Link
                  href={`/news/${item.slug}`}
                  className="text-sm font-semibold leading-tight hover:underline"
                >
                  <TruncateExpand text={item.title ?? ""} as="span" className="line-clamp-3" />
                </Link>
                <p className="text-sm text-muted-foreground">
                  <TruncateExpand text={item.description ?? ""} className="line-clamp-3" as="span" />
                </p>
              </div>
            </Card>
          </li>
        ))}
      </ul>
    </section>
  )
}
