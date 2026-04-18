"use client"

import * as React from "react"
import { Link } from "@/i18n/navigation"
import { useLocale } from "next-intl"
import { Card } from "@/shared/common/components/ui/card"
import { formatDateISO, formatDateTimeLocale, type AppLocale } from "@/shared/common/lib/formatter"
import { getNewsListForLocale, isTextOnlyRawNews, type NewsItem } from "@/features/news/model"
import { usePublicNewsQuery } from "@/features/news/model/public-news-query"
import { usePublicCategoriesQuery, type PublicCategory } from "@/features/category/model/public-categories-query"
import { getCategoryLabelForNewsItem } from "@/features/category/model/use-category-label"
import type { RawNewsItem } from "@/features/news/model"

type TextNewsSectionProps = {
  initialNews?: RawNewsItem[]
  initialCategories?: PublicCategory[]
}

export default function TextNewsSection({
  initialNews,
  initialCategories,
}: TextNewsSectionProps) {
  const locale = useLocale() as AppLocale
  const { data: qNews = [] } = usePublicNewsQuery()
  const { data: qCats = [], isPending: categoriesPending } = usePublicCategoriesQuery()

  const publicNews = initialNews ?? qNews
  const categories = initialCategories ?? qCats

  const items = React.useMemo(() => {
    const raw = [...publicNews]
      .filter(isTextOnlyRawNews)
      .sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime())
      .slice(0, 30)
    return getNewsListForLocale(raw, locale)
  }, [publicNews, locale])

  if (items.length === 0) return null

  return (
    <section className="w-full space-y-4 px-4 md:px-6 pt-4">
      <div className="py-4 border-t-2 mt-4 border-border">
        {/* <h2 className="mb-4 text-lg font-semibold"></h2> */}
        <ul className="grid grid-cols-1 justify-items-start gap-3 md:grid-cols-2 xl:grid-cols-3">
          {items.map((item: NewsItem) => (
            <li key={item.slug} className="w-full max-w-xl">
              <Card className="rounded-sm border p-3 shadow-none">
                <div className="flex min-w-0 flex-1 flex-col gap-2">
                  <div className="flex items-center gap-2 border-b pb-2">
                    <Link href={`/category/${item.categorySlug}`} className="flex flex-wrap items-center gap-2 text-xs  text-muted-foreground hover:underline">
                      <span className="block w-2 h-2 bg-brand rounded-full"></span>
                      <span className="capitalize">
                        {getCategoryLabelForNewsItem(categories, categoriesPending, item, locale)}
                      </span>
                    </Link>
                    <span className="text-muted-foreground text-xs">/</span>
                    <time dateTime={formatDateISO(item.publishedAt)} className="text-xs text-muted-foreground">
                      {formatDateTimeLocale(item.publishedAt, locale)}
                    </time>
                  </div>
                  <Link href={`/news/${item.slug}`} className="text-sm font-semibold leading-tight hover:underline">
                    <span className="line-clamp-2 md:line-clamp-3">{item.title ?? ""}</span>
                  </Link>
                  <p className="text-sm text-muted-foreground">
                    <span className="line-clamp-2 md:line-clamp-3">{item.description ?? ""}</span>
                  </p>

                </div>
              </Card>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
