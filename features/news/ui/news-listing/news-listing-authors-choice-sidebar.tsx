"use client"

import Image from "next/image"
import { Link } from "@/i18n/navigation"
import { useTranslations } from "next-intl"
import type { AppLocale } from "@/shared/common/lib/formatter"
import { formatDateISO, formatDateTimeLocale } from "@/shared/common/lib/formatter"
import { Card } from "@/shared/common/components/ui/card"
import type { NewsItem } from "@/features/news/model"
import { getSafeImageSrc, getVideoPoster } from "./news-listing-utils"

type NewsListingAuthorsChoiceSidebarProps = {
  items: NewsItem[]
  loading: boolean
  locale: AppLocale
}

export function NewsListingAuthorsChoiceSidebar({
  items,
  loading,
  locale,
}: NewsListingAuthorsChoiceSidebarProps) {
  const t = useTranslations("common")

  return (
    <aside className="hidden lg:sticky lg:top-20 lg:col-span-1 lg:block lg:self-start">
      <div className="flex w-full flex-col gap-4">
        <h2 className="inline-flex items-center text-lg font-semibold">{t("authors_choice")}</h2>
        {loading ? (
          <p className="text-sm text-muted-foreground">{t("loading")}</p>
        ) : items.length === 0 ? (
          <p className="text-sm text-muted-foreground">{t("search_results_empty")}</p>
        ) : (
          <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-1">
            {items.map((n) => {
              const img = getSafeImageSrc(n.images?.[0]) || getSafeImageSrc(getVideoPoster(n.videoUrl))
              return (
                <li key={n.slug}>
                  <Card className="overflow-hidden rounded-sm p-0 shadow-none">
                    <div className="flex gap-3">
                      <Link
                        href={`/news/${n.slug}`}
                        className="relative block h-20 w-28 shrink-0 overflow-hidden rounded-xs bg-muted md:h-24 md:w-32"
                      >
                        {img ? (
                          <Image src={img} alt={n.title} fill className="object-cover" />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center px-1 text-center text-[10px] text-muted-foreground">
                            {t("images")}
                          </div>
                        )}
                      </Link>
                      <div className="flex min-w-0 flex-1 flex-col justify-center gap-4 px-1 py-2">
                        <div className="flex flex-wrap items-center gap-x-1.5 text-xs text-muted-foreground">
                          <span className="font-medium text-brand italic uppercase">{n.category}</span>
                          <span aria-hidden>/</span>
                          <time dateTime={formatDateISO(n.publishedAt)}>
                            {formatDateTimeLocale(n.publishedAt, locale)}
                          </time>
                        </div>
                        <Link
                          href={`/news/${n.slug}`}
                          className="line-clamp-2 text-sm font-medium leading-tight hover:underline"
                        >
                          {n.title}
                        </Link>
                      </div>
                    </div>
                  </Card>
                </li>
              )
            })}
          </ul>
        )}
      </div>
    </aside>
  )
}
