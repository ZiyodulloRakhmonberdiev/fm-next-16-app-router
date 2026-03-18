"use client"

import * as React from "react"
import Image from "next/image"
import { ArrowRight, Eye } from "lucide-react"
import { Link } from "@/i18n/navigation"
import { useLocale, useTranslations } from "next-intl"
import type { AppLocale } from "@/shared/common/lib/formatter"
import { formatDate, formatDateISO, formatDateTimeLocale } from "@/shared/common/lib/formatter"
import { Card } from "@/shared/common/components/ui/card"
import { Button } from "@/shared/common/components/ui/button"
import { usePublicNewsQuery } from "@/features/news/model/public-news-query"
import { getNewsListForLocale, isImageTypeRawNews, type NewsItem } from "@/features/news/model"
import { getCategoryNameFromApi, usePublicCategoriesQuery } from "@/features/category/model/public-categories-query"

type RowSectionProps = {
  categorySlug: string
}

function getSafeImageSrc(raw?: string) {
  if (!raw?.trim()) return ""
  return raw.startsWith("http://") || raw.startsWith("https://") || raw.startsWith("/")
    ? raw
    : `/uploads/images/${raw}`
}

function formatTime(value: Date, locale: AppLocale) {
  try {
    return value.toLocaleTimeString(locale, { hour: "2-digit", minute: "2-digit" })
  } catch {
    return value.toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" })
  }
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
    <section className="w-full px-4 md:px-6 pt-4">
      <div className="rounded-lg border bg-background">
        <div className="flex items-center justify-between gap-3 px-4 py-3">
          <h2 className="text-base font-semibold text-brand">{categoryName}</h2>
          <Button variant="ghost" size="sm" asChild className="">
            <Link href={`/category/${categorySlug}`} className="text-xs text-brand hover:text-brand hover:underline md:text-sm">
              {t("view_all")} <ArrowRight className="w-4 h-4" />
            </Link>
          </Button>
        </div>
        <div className="h-px w-full bg-brand" />

        <div className="grid grid-cols-1 gap-x-8 gap-y-4 p-4 md:grid-cols-2">
          {items.map((item: NewsItem) => {
            const img = getSafeImageSrc(item.images?.[0])
            return (
              <Link key={item.slug} href={`/news/${item.slug}`} className="group block">
                <Card className="border-0 shadow-none bg-transparent gap-0 py-0">
                  <div className="flex items-stretch gap-3">
                    <div className="relative h-24 w-32 shrink-0 overflow-hidden rounded-md bg-muted">
                      {img ? (
                        <Image
                          src={img}
                          alt={item.title}
                          fill
                          className="object-cover transition-transform duration-300 group-hover:scale-105"
                        />
                      ) : null}
                    </div>

                    <div className="min-w-0 flex-1 flex flex-col justify-around">
                      <div className="flex items-center justify-between gap-3 text-xs text-muted-foreground">
                        <span className="inline-flex items-center gap-3">
                          <span className="uppercase text-brand italic">
                            {item.category}
                          </span>
                        </span>
                      </div>
                      <div className="text-sm font-medium line-clamp-2 group-hover:underline">
                        {item.title}
                      </div>
                      <div className="flex items-center justify-start gap-3 text-xs text-muted-foreground">
                        <time dateTime={formatDate(item.publishedAt)} className="shrink-0">
                          {formatDateTimeLocale(item.publishedAt, locale)}
                        </time>
                        /
                        <span className="inline-flex items-center gap-1">
                          <Eye className="h-3.5 w-3.5" />
                          {item.views}
                        </span>
                      </div>
                    </div>
                  </div>
                </Card>
              </Link>
            )
          })}
        </div>
      </div>
    </section>
  )
}