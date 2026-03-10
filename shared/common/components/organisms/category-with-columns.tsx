"use client"

import * as React from "react"
import { getNewsListForLocale, isVisualRawNews, type NewsItem } from "@/features/news/model"
import { usePublicNewsQuery } from "@/features/news/model/public-news-query"
import { getCategoryNameFromApi, usePublicCategoriesQuery } from "@/features/category/model/public-categories-query"
import { Card } from "@/shared/common/components/ui/card"
import {
  formatDateISO,
  formatDateTimeLocale,
} from "@/shared/common/lib/formatter"
import type { AppLocale } from "@/shared/common/lib/formatter"
import { Link } from "@/i18n/navigation"
import Image from "next/image"
import { useLocale, useTranslations } from "next-intl"
import { TruncateExpand } from "@/shared/common/components/ui/truncate-expand"
import { Button } from "../ui/button"

type CategoryWithColumnsProps = {
  categorySlug?: string
  featuredPosition?: "left" | "right"
}

export default function CategoryWithColumns({
  categorySlug = "business",
  featuredPosition = "right",
}: CategoryWithColumnsProps) {
  const locale = useLocale() as AppLocale
  const t = useTranslations("common")
  const { data: publicNews = [] } = usePublicNewsQuery()
  const { data: categories = [] } = usePublicCategoriesQuery()
  const categoryName = getCategoryNameFromApi(categories, categorySlug, locale)

  const items = React.useMemo(() => {
    const raw = [...publicNews]
      .filter(isVisualRawNews)
      .filter((n) => n.categorySlug === categorySlug)
      .sort(
        (a, b) =>
          new Date(b.publishedAt).getTime() -
          new Date(a.publishedAt).getTime()
      )
      .slice(0, 7)
    return getNewsListForLocale(raw, locale)
  }, [categorySlug, locale, publicNews])

  const [featured, ...rightItems] = items

  if (items.length < 6) return null

  return (
    <div className="w-full px-4 md:px-6 mt-4">
      <div className=" border-t-2 border-border py-4">
        <div className="flex items-center justify-between gap-2 mb-4">
          <h2 className="text-lg font-semibold">{categoryName}</h2>
          <Button variant="ghost" size="sm" asChild className="text-brand">
            <Link href={`/category/${categorySlug}`} className="text-xs md:text-sm">{t("view_all")} {">>"}</Link>
          </Button>
        </div>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div
            className={`grid md:grid-cols-2 gap-4 ${
              featuredPosition === "left" ? "md:order-2" : ""
            }`}
          >
            {rightItems.map((item: NewsItem) => (
              <Card
                key={item.slug}
                className="flex flex-col gap-2 rounded-sm border-none p-3 shadow-none bg-foreground/5 md:bg-background"
              >
                <div className="flex flex-wrap items-center gap-x-1.5 text-xs text-muted-foreground">
                  <span className="uppercase font-medium text-brand italic">{item.category}</span>
                  <span aria-hidden>/</span>
                  <time dateTime={formatDateISO(item.publishedAt)}>
                    {formatDateTimeLocale(item.publishedAt, locale)}
                  </time>
                </div>
                <h4 className="text-sm font-semibold leading-tight">
                  <Link
                    href={`/news/${item.slug}`}
                    className="hover:underline"
                  >
                    <TruncateExpand text={item.title ?? ""} as="span" className="line-clamp-3" />
                  </Link>
                </h4>
                <p className="text-sm text-muted-foreground">
                  <TruncateExpand text={item.description ?? ""} className="line-clamp-3" as="span" />
                </p>
              </Card>
            ))}
          </div>
          {featured && (
            <div
              className={`md:col-span-1 h-full ${
                featuredPosition === "left" ? "md:order-1" : ""
              }`}
            >
              <Card className="overflow-hidden rounded-sm border border-border p-0 shadow-none">
                <Link href={`/news/${featured.slug}`} className="block">
                  <div className="relative aspect-video w-full">
                    <Image
                      src={featured.images[0]}
                      alt={featured.title}
                      fill
                      className="object-cover"
                    />
                  </div>
                </Link>
                <div className="flex flex-col gap-2 p-4">
                  <div className="flex flex-wrap items-center gap-x-1.5 text-xs text-muted-foreground">
                    <span className="uppercase font-medium text-brand italic">{featured.category}</span>
                    <span aria-hidden>/</span>
                    <time dateTime={formatDateISO(featured.publishedAt)}>
                      {formatDateTimeLocale(featured.publishedAt, locale)}
                    </time>
                  </div>
                  <h3 className="text-lg font-semibold leading-tight">
                    <Link
                      href={`/news/${featured.slug}`}
                      className="hover:underline"
                    >
                      <span className="line-clamp-3">
                        {featured.title}
                      </span>
                    </Link>
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    <span className="line-clamp-3">
                      {featured.description}
                    </span>
                  </p>
                </div>
              </Card>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
