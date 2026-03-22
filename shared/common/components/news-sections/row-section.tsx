"use client"

import * as React from "react"
import { ArrowRight } from "lucide-react"
import { Link } from "@/i18n/navigation"
import { useLocale, useTranslations } from "next-intl"
import type { AppLocale } from "@/shared/common/lib/formatter"
import { Button } from "@/shared/common/components/ui/button"
import { usePublicNewsQuery } from "@/features/news/model/public-news-query"
import { getNewsListForLocale, isImageTypeRawNews, type NewsItem } from "@/features/news/model"
import { getCategoryNameFromApi, usePublicCategoriesQuery } from "@/features/category/model/public-categories-query"
import { MiniNewsCard } from "@/features/news/ui/mini-news-card"

type RowSectionProps = {
  categorySlug: string
}

export default function RowSection({ categorySlug }: RowSectionProps) {
  const locale = useLocale() as AppLocale
  const t = useTranslations("common")
  const { data: publicNews = [] } = usePublicNewsQuery()
  const { data: categories = [] } = usePublicCategoriesQuery()

  const categoryName = getCategoryNameFromApi(categories, categorySlug, locale)

  const items = React.useMemo(() => {
    const raw = [...publicNews]
      .filter(isImageTypeRawNews)
      .filter((n) => n.categorySlug === categorySlug)
      .sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime())
      .slice(0, 6)
    return getNewsListForLocale(raw, locale)
  }, [publicNews, locale, categorySlug])

  if (items.length === 0) return null

  return (
    <section className="w-full px-4 pt-4 md:px-6">
      <div className="rounded-lg border bg-background">
        <div className="flex items-center justify-between gap-3 px-4 py-3">
          <h2 className="text-base font-semibold text-brand">{categoryName}</h2>
          <Button variant="ghost" size="sm" asChild className="">
            <Link
              href={`/category/${categorySlug}`}
              className="text-xs text-brand hover:text-brand hover:underline md:text-sm"
            >
              {t("view_all")} <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>
        <div className="h-px w-full bg-brand" />

        <div className="grid grid-cols-1 gap-x-8 gap-y-4 p-4 md:grid-cols-2">
          {items.map((item: NewsItem) => (
            <MiniNewsCard
              key={item.slug}
              item={item}
              locale={locale}
              variant="row"
            />
          ))}
        </div>
      </div>
    </section>
  )
}
