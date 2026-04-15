"use client"

import * as React from "react"
import { getNewsListForLocale, isImageTypeRawNews, type NewsItem } from "@/features/news/model"
import { usePublicNewsQuery } from "@/features/news/model/public-news-query"
import { getCategoryNameFromApi, usePublicCategoriesQuery } from "@/features/category/model/public-categories-query"
import { useCategoryLabel } from "@/features/category/model/use-category-label"
import { Card } from "@/shared/common/components/ui/card"
import { formatDateISO, formatDateTimeLocale } from "@/shared/common/lib/formatter"
import type { AppLocale } from "@/shared/common/lib/formatter"
import { Link } from "@/i18n/navigation"
import { useLocale, useTranslations } from "next-intl"
import { ChevronRight } from "lucide-react"
import type { PublicCategory } from "@/features/category/model/public-categories-query"
import type { RawNewsItem } from "@/features/news/model"
import SimpleNewsCard from "@/entities/news/cards/simple-news-card"

type ColumnSectionProps = {
  categorySlug?: string
  featuredPosition?: "left" | "right"
  initialNews?: RawNewsItem[]
  initialCategories?: PublicCategory[]
}

function ColumnListCard({ item, locale }: { item: NewsItem; locale: AppLocale }) {
  const categoryLabel = useCategoryLabel(item.categorySlug, locale, item.category)
  return (
    <Card className="hidden flex-col gap-2 rounded-sm border-none bg-foreground/5 p-3 shadow-none md:bg-background">
      <div className="flex flex-wrap items-center gap-x-1.5 text-xs text-muted-foreground">
        <span className="font-mono text-foreground text-xs">{categoryLabel}</span>
        <span aria-hidden>/</span>
        <time dateTime={formatDateISO(item.publishedAt)}>{formatDateTimeLocale(item.publishedAt, locale)}</time>
      </div>
      <h4 className="text-sm font-semibold leading-tight">
        <Link href={`/news/${item.slug}`} className="hover:underline">
          <span className="line-clamp-2 md:line-clamp-3">{item.title ?? ""}</span>
        </Link>
      </h4>
      <p className="text-sm text-muted-foreground">
        <span className="line-clamp-2 md:line-clamp-3">{item.description ?? ""}</span>
      </p>
    </Card>
  )
}

export default function ColumnSection({
  categorySlug = "business",
  featuredPosition = "right",
  initialNews,
  initialCategories,
}: ColumnSectionProps) {
  const locale = useLocale() as AppLocale
  const { data: qNews = [] } = usePublicNewsQuery()
  const { data: qCats = [] } = usePublicCategoriesQuery()
  
  const publicNews = initialNews ?? qNews
  const categories = initialCategories ?? qCats

  const categoryName = getCategoryNameFromApi(categories, categorySlug, locale)
  const t = useTranslations("common")
  const items = React.useMemo(() => {
    const raw = [...publicNews]
      .filter(isImageTypeRawNews)
      .filter((n) => n.categorySlug === categorySlug)
      .sort(
        (a, b) =>
          new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
      )
      .slice(0, 7)
    return getNewsListForLocale(raw, locale)
  }, [categorySlug, locale, publicNews])

  const [featured, ...rightItems] = items

  if (items.length < 1) return null

  return (
    <div className="rounded-md px-4 py-6 md:px-6">
      <section className="w-full space-y-4 rounded-md border pb-4">
        <div>
          <h2 className="text-lg font-semibold text-foreground">{categoryName}</h2>
          <Link href={`/category/${categorySlug}`} className="text-sm font-medium underline-offset-4 hover:underline md:hidden flex items-center gap-2">
            <span>{t("view_all")}</span> <ChevronRight className="size-5 shrink-0 rounded-full bg-foreground p-1 text-background" aria-hidden />
          </Link>
        </div>

        <div className="grid grid-cols-1 gap-4 px-4 md:grid-cols-2 md:px-6">
          <div
            className={`grid gap-4 md:grid-cols-2 ${featuredPosition === "left" ? "md:order-2" : ""
              }`}
          >
            {rightItems.map((item: NewsItem) => (
              <ColumnListCard key={item.slug} item={item} locale={locale} />
            ))}
          </div>
          {featured ? (
            <div
              className={`h-full md:col-span-1 ${featuredPosition === "left" ? "md:order-1" : ""
                }`}
            >
              <SimpleNewsCard item={featured} locale={locale} variant="featured" />
            </div>
          ) : null}
        </div>
      </section>
    </div>
  )
}
