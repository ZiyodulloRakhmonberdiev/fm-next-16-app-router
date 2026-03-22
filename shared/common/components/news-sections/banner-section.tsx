"use client"

import * as React from "react"
import { getNewsListForLocale, isImageTypeRawNews, type NewsItem } from "@/features/news/model"
import { usePublicNewsQuery } from "@/features/news/model/public-news-query"
import { getCategoryNameFromApi, usePublicCategoriesQuery } from "@/features/category/model/public-categories-query"
import { useLocale, useTranslations } from "next-intl"
import { Link } from "@/i18n/navigation"
import { Button } from "@/shared/common/components/ui/button"
import { ArrowRight } from "lucide-react"
import type { AppLocale } from "@/shared/common/lib/formatter"
import { FeaturedNewsCard } from "@/features/news/ui/featured-news-card"
import { MiniNewsCard } from "@/features/news/ui/mini-news-card"

type BannerSectionProps = {
  categorySlug?: string
  featuredPosition?: "left" | "right"
}

export default function BannerSection({
  categorySlug = "business",
}: BannerSectionProps) {
  const locale = useLocale() as AppLocale
  const t = useTranslations("common")
  const { data: publicNews = [] } = usePublicNewsQuery()
  const { data: categories = [] } = usePublicCategoriesQuery()
  const categoryName = getCategoryNameFromApi(categories, categorySlug, locale)
  const rawSorted = React.useMemo(
    () =>
      [...publicNews]
        .filter(isImageTypeRawNews)
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
  const leftItems = rest.slice(0, 4)
  const rightItems = rest.slice(4, 8)

  if (sorted.length < 1) return null

  return (
    <section className="w-full space-y-4 px-4 pb-4 md:px-6 rounded-md">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b-2 border-brand pb-2 pt-4 text-brand">
        <h2 className="text-lg font-semibold">{categoryName}</h2>
        <Button variant="ghost" size="sm" asChild className="">
          <Link href={`/category/${categorySlug}`} className="text-xs md:text-sm">
            {t("view_all")} <ArrowRight className="h-4 w-4" />
          </Link>
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-3 md:grid-cols-3 md:gap-4 
      ">
        <div className="hidden md:flex md:flex-col gap-2">
          {leftItems.map((item: NewsItem) => (
            <MiniNewsCard
              key={item.slug}
              item={item}
              locale={locale}
              variant="banner-side"
            />
          ))}
        </div>

        <div className="hidden md:block">
          {featured ? (
            <FeaturedNewsCard item={featured} locale={locale} variant="banner" />
          ) : null}
        </div>

        <div className="hidden md:flex md:flex-col gap-2">
          {rightItems.map((item: NewsItem) => (
            <MiniNewsCard
              key={item.slug}
              item={item}
              locale={locale}
              variant="banner-side"
            />
          ))}
        </div>

        <div className="grid grid-cols-1 gap-2 md:hidden">
          {([featured, ...leftItems, ...rightItems].filter(Boolean) as NewsItem[])
            .slice(0, 12)
            .map((item) => (
              <MiniNewsCard
                key={item.slug}
                item={item}
                locale={locale}
                variant="banner-mobile"
              />
            ))}
        </div>
      </div>
    </section>
  )
}
