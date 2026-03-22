"use client"

import { useTranslations } from "next-intl"
import type { AppLocale } from "@/shared/common/lib/formatter"
import type { NewsItem } from "@/features/news/model"
import { MiniNewsCard } from "@/features/news/ui/mini-news-card"

type NewsListingAuthorsChoiceSidebarProps = {
  items: NewsItem[]
  loading: boolean
  locale: AppLocale
  /** Ota ustun sticky bo‘lsa — tashqi `aside` va sticky klasslarsiz */
  embedded?: boolean
}

export function NewsListingAuthorsChoiceSidebar({
  items,
  loading,
  locale,
  embedded = false,
}: NewsListingAuthorsChoiceSidebarProps) {
  const t = useTranslations("common")

  const inner = (
    <div className="flex w-full flex-col gap-4">
      <h2 className="inline-flex items-center text-lg font-semibold">{t("authors_choice")}</h2>
      {loading ? (
        <p className="text-sm text-muted-foreground">{t("loading")}</p>
      ) : items.length === 0 ? (
        <p className="text-sm text-muted-foreground">{t("search_results_empty")}</p>
      ) : (
        <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-1">
          {items.map((n) => (
            <li key={n.slug}>
              <MiniNewsCard item={n} locale={locale} variant="authors-choice" />
            </li>
          ))}
        </ul>
      )}
    </div>
  )

  if (embedded) return inner

  return (
    <aside className="mt-4 hidden h-fit lg:sticky lg:top-20 lg:col-span-1 lg:block lg:self-start">
      {inner}
    </aside>
  )
}
