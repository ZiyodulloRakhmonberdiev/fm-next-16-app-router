"use client"

import { filterPublishedRawNews, getNewsListForLocale, type NewsItem } from "@/features/news/model"
import { seedNews } from "@/scripts/seed-news"
import { Card } from "@/shared/common/components/ui/card"
import { formatDate, formatDateISO, formatDateTimeLocale } from "@/shared/common/lib/formatter"
import type { AppLocale } from "@/shared/common/lib/formatter"
import { Link } from "@/i18n/navigation"
import Image from "next/image"
import { useLocale, useTranslations } from "next-intl"

type LatestNewsProps = {
  /** Hozir ko‘rilayotgan yangilik slug — ro‘yxatda ko‘rsatilmaydi */
  excludeSlug?: string
}

export default function LatestNews({ excludeSlug }: LatestNewsProps = {}) {
  const locale = useLocale() as AppLocale
  const t = useTranslations("Home")

  const rawSorted = filterPublishedRawNews([...seedNews.news])
    .filter((n) => !excludeSlug || n.slug !== excludeSlug)
    .sort(
      (a, b) =>
        new Date((b as { createdAt?: Date }).createdAt ?? 0).getTime() -
        new Date((a as { createdAt?: Date }).createdAt ?? 0).getTime()
    )
    .slice(0, 9)
  const sorted = getNewsListForLocale(rawSorted, locale)
  const [featured, ...rest] = sorted

  return (
    <div className="flex w-full flex-col gap-4">
      <h2 className="inline-flex items-center text-lg font-semibold">
        {t("latest")}
      </h2>

      <div className="flex flex-col gap-3">

        <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-1">
          {rest.map((item: NewsItem) => (
            <li key={item.slug}>
              <Card className="overflow-hidden p-0 rounded-sm shadow-none">
                <div className="flex gap-3">
                  <Link
                    href={`/news/${item.slug}`}
                    className="relative block h-20 w-28 shrink-0 overflow-hidden rounded-xs md:h-24 md:w-32"
                  >
                    <Image
                      src={item.images[0]}
                      alt={item.title}
                      fill
                      className="object-cover"
                    />
                  </Link>
                  <div className="flex min-w-0 py-2 px-1 flex-col flex-1 justify-center gap-4">
                    <div className="flex flex-wrap items-center gap-x-1.5 text-xs text-muted-foreground">
                      <span className="uppercase font-medium text-brand italic">{item.category}</span>
                      <span aria-hidden>/</span>
                      <time dateTime={formatDateISO(item.publishedAt)}>
                        {formatDateTimeLocale(item.publishedAt, locale)}
                      </time>
                    </div>
                    <Link
                      href={`/news/${item.slug}`}
                      className="line-clamp-2 text-sm font-medium leading-tight hover:underline"
                    >
                      {item.title}
                    </Link>
                  </div>
                </div>
              </Card>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}
