"use client"

import { getNewsListForLocale, isImageTypeRawNews, type NewsItem, type RawNewsItem } from "@/features/news/model"
import { usePublicNewsQuery } from "@/features/news/model/public-news-query"
import { useLocale, useTranslations } from "next-intl"
import type { AppLocale } from "@/shared/common/lib/formatter"
import SimpleNewsCard from "@/entities/news/cards/simple-news-card"

type LatestNewsProps = {
  excludeSlug?: string
  initialNews?: RawNewsItem[]
}

export default function LatestNews({ excludeSlug, initialNews }: LatestNewsProps = {}) {
  const locale = useLocale() as AppLocale
  const t = useTranslations("Home")
  const { data: qNews = [] } = usePublicNewsQuery()
  const publicNews = initialNews ?? qNews

  const rawSorted = [...publicNews]
    .filter(isImageTypeRawNews)
    .filter((n) => !excludeSlug || n.slug !== excludeSlug)
    .sort(
      (a, b) =>
        new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
    )
    .slice(0, 10)
  const sorted = getNewsListForLocale(rawSorted, locale)
  if (sorted.length === 0) return null

  return (
    <div className="flex w-full flex-col gap-4">
      <h2 className="inline-flex items-center text-lg md:text-2xl  font-semibold md:font-bold">
        {t("latest")}
      </h2>
      <div className="flex flex-col gap-3">
        <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-1">
          {sorted.map((item: NewsItem) => (
            <li key={item.slug}>
              <SimpleNewsCard item={item} locale={locale} variant="row" description={false} />
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}
