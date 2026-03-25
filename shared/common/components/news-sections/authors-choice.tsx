"use client"

import { getNewsListForLocale, isImageTypeRawNews, type NewsItem } from "@/features/news/model"
import { usePublicNewsQuery } from "@/features/news/model/public-news-query"
import { usePublicCategoriesQuery } from "@/features/category/model/public-categories-query"
import { getCategoryLabelForNewsItem } from "@/features/category/model/use-category-label"
import { Card } from "@/shared/common/components/ui/card"
import {
  formatDateISO,
  formatDateTimeLocale,
} from "@/shared/common/lib/formatter"
import type { AppLocale } from "@/shared/common/lib/formatter"
import { Link } from "@/i18n/navigation"
import Image from "next/image"
import { useLocale, useTranslations } from "next-intl"
import { cn } from "@/shared/common/lib/utils"

const AUTHORS_CHOICE_CONTENT_BGS = [
  "bg-green-50 text-neutral-800 dark:bg-green-950/30 dark:text-green-100/95",
  "bg-orange-50 text-neutral-800 dark:bg-orange-950/30 dark:text-orange-100/95",
  "bg-sky-50 text-neutral-800 dark:bg-sky-950/30 dark:text-sky-100/95",
  "bg-violet-50 text-neutral-800 dark:bg-violet-950/30 dark:text-violet-100/95",
  "bg-emerald-50 text-neutral-800 dark:bg-emerald-950/30 dark:text-emerald-100/95",
  "bg-amber-50 text-neutral-800 dark:bg-amber-950/30 dark:text-amber-100/95",
] as const

const GRID_COUNT = 6

export default function AuthorsChoice() {
  const locale = useLocale() as AppLocale
  const t = useTranslations("common")
  const { data: publicNews = [] } = usePublicNewsQuery()
  const { data: categories = [], isPending: categoriesPending } = usePublicCategoriesQuery()

  const rawFiltered = [...publicNews]
    .filter(isImageTypeRawNews)
    .filter((item) => (item as { authorsChoice?: boolean }).authorsChoice)
    .sort(
      (a, b) =>
        new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
    )
    .slice(0, GRID_COUNT)
  const items = getNewsListForLocale(rawFiltered, locale)
  if (items.length < 1) return null

  return (
    <div className="w-full">
      <h2 className="mb-4 text-lg font-semibold">{t("authors_choice")}</h2>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {items.map((item: NewsItem, idx: number) => (
          <Card
            key={item.slug}
            className={cn(
              "overflow-hidden rounded-sm border-none p-0 shadow-none",
              AUTHORS_CHOICE_CONTENT_BGS[idx] ?? AUTHORS_CHOICE_CONTENT_BGS[0]
            )}
          >
            {/* <Link href={`/news/${item.slug}`} className="block">
              <div className="relative aspect-video w-full">
                <Image
                  src={item.images[0]}
                  alt={item.title}
                  fill
                  className="object-cover"
                  sizes="(max-width: 640px) 100vw, 50vw"
                />
              </div>
            </Link> */}
            <div
              className={cn(
                "flex flex-col gap-2 p-3 md:p-4"
              )}
            >
              <div className="flex flex-wrap items-center gap-x-1.5 text-xs text-neutral-600 dark:text-neutral-400">
                <Link
                  href={`/category/${item.categorySlug}`}
                  className="flex items-center gap-1 capitalize hover:underline"
                >
                  <span className="block size-2 rounded-full bg-brand" />
                  <span className="text-xs capitalize">
                    {getCategoryLabelForNewsItem(categories, categoriesPending, item, locale)}
                  </span>
                </Link>
                {/* <span aria-hidden>/</span>
                <time dateTime={formatDateISO(item.publishedAt)}>
                  {formatDateTimeLocale(item.publishedAt, locale)}
                </time> */}
              </div>
              <h3 className="text-base font-semibold leading-tight md:text-lg">
                <Link href={`/news/${item.slug}`} className="hover:underline">
                  <span className="line-clamp-2 md:line-clamp-3">{item.title}</span>
                </Link>
              </h3>
              <p className="text-sm text-neutral-600 dark:text-neutral-400">
                <span className="line-clamp-2 md:line-clamp-3">{item.description ?? ""}</span>
              </p>
            </div>
          </Card>
        ))}
      </div>
    </div>
  )
}
