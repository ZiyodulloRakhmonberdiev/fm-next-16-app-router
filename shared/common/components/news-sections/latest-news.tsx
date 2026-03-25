"use client"

import { getNewsListForLocale, isImageTypeRawNews, type NewsItem } from "@/features/news/model"
import { usePublicNewsQuery } from "@/features/news/model/public-news-query"
import { useLocale, useTranslations } from "next-intl"
import type { AppLocale } from "@/shared/common/lib/formatter"
import { MiniNewsCard } from "@/features/news/ui/mini-news-card"

type LatestNewsProps = {
  /** Hozir ko‘rilayotgan yangilik slug — ro‘yxatda ko‘rsatilmaydi */
  excludeSlug?: string
}

export default function LatestNews({ excludeSlug }: LatestNewsProps = {}) {
  const locale = useLocale() as AppLocale
  const t = useTranslations("Home")
  const { data: publicNews = [] } = usePublicNewsQuery()

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
      <h2 className="inline-flex items-center text-lg font-semibold">
        {t("latest")}
      </h2>

      <div className="flex flex-col gap-3">
        <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-1">
          {sorted.map((item: NewsItem) => (
            <li key={item.slug}>
              <MiniNewsCard item={item} locale={locale} variant="latest" />
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}
