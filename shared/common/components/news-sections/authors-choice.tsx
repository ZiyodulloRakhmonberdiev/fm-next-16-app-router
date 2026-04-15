"use client"

import { getNewsListForLocale, isImageTypeRawNews, type NewsItem } from "@/features/news/model"
import { usePublicNewsQuery } from "@/features/news/model/public-news-query"
import type { AppLocale } from "@/shared/common/lib/formatter"
import { useLocale, useTranslations } from "next-intl"
import TextNewsCard from "@/entities/news/cards/text-news-card"

const GRID_COUNT = 6

export default function AuthorsChoice() {
  const locale = useLocale() as AppLocale
  const t = useTranslations("common")
  const { data: publicNews = [] } = usePublicNewsQuery()

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
      <h2 className="mb-4 text-2xl md:text-4xl font-bold">{t("authors_choice")}</h2>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {items.map((item: NewsItem, idx: number) => (
          <TextNewsCard
            key={item.slug}
            item={item}
            locale={locale}
            variant="authors-choice"
            index={idx}
          />
        ))}
      </div>
    </div>
  )
}
