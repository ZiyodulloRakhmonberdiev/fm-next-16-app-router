"use client"

import { Card } from "@/shared/common/components/ui/card"
import { Link } from "@/i18n/navigation"
import { cn } from "@/shared/common/lib/utils"
import type { AppLocale } from "@/shared/common/lib/formatter"
import type { NewsItem } from "@/features/news/model"
import { useCategoryLabel } from "@/features/category/model/use-category-label"
import { CategoryName } from "@/entities/news/_components/atoms/category-name"
import { PublishedAt } from "@/entities/news/_components/atoms/published-at"

const AUTHORS_CHOICE_CONTENT_BGS = [
  "bg-green-50 text-neutral-800 dark:bg-green-950/30 dark:text-green-100/95",
  "bg-orange-50 text-neutral-800 dark:bg-orange-950/30 dark:text-orange-100/95",
  "bg-sky-50 text-neutral-800 dark:bg-sky-950/30 dark:text-sky-100/95",
  "bg-violet-50 text-neutral-800 dark:bg-violet-950/30 dark:text-violet-100/95",
  "bg-emerald-50 text-neutral-800 dark:bg-emerald-950/30 dark:text-emerald-100/95",
  "bg-amber-50 text-neutral-800 dark:bg-amber-950/30 dark:text-amber-100/95",
] as const

type TextNewsCardProps = {
  item: NewsItem
  locale: AppLocale
  variant: "breaking" | "authors-choice"
  index?: number
}

export function TextNewsCard({ item, locale, variant, index = 0 }: TextNewsCardProps) {
  const categoryLabel = useCategoryLabel(item.categorySlug, locale, item.category)

  if (variant === "breaking") {
    return (
      <Card className="flex flex-col gap-2 rounded-sm border-none p-3 shadow-none bg-card">
        <div className="flex items-center justify-between gap-2 text-xs text-muted-foreground">
          <CategoryName
            categorySlug={item.categorySlug}
            categoryLabel={categoryLabel}
            hasVideo={Boolean(item.videoUrl?.trim())}
          />
          {/* <PublishedAt publishedAt={item.publishedAt} /> */}
        </div>
        <h3 className="text-base font-semibold leading-normal tracking-wider md:text-lg">
          <Link href={`/news/${item.slug}`} className="hover:underline">
            <span className="line-clamp-2 md:line-clamp-3">{item.title}</span>
          </Link>
        </h3>
        <p className="text-sm text-muted-foreground">
          <span className="line-clamp-2 md:line-clamp-3">{item.description ?? ""}</span>
        </p>
      </Card>
    )
  }

  return (
    <Card
      className={cn(
        "overflow-hidden rounded-sm border-none p-0 shadow-none",
        AUTHORS_CHOICE_CONTENT_BGS[index] ?? AUTHORS_CHOICE_CONTENT_BGS[0]
      )}
    >
      <div className="flex flex-col gap-2 p-3 md:p-4">
        <div className="flex items-center justify-between gap-2 text-xs text-neutral-600 dark:text-neutral-400">
          <CategoryName
            categorySlug={item.categorySlug}
            categoryLabel={categoryLabel}
            hasVideo={Boolean(item.videoUrl?.trim())}
            className="text-neutral-600 dark:text-neutral-400"
          />
          {/* <PublishedAt publishedAt={item.publishedAt} className="text-neutral-600 dark:text-neutral-400" /> */}
        </div>
        <h3 className="text-base font-semibold leading-normal tracking-wider md:text-lg">
          <Link href={`/news/${item.slug}`} className="hover:underline">
            <span className="line-clamp-2 md:line-clamp-3">{item.title}</span>
          </Link>
        </h3>
        <p className="text-sm text-neutral-600 dark:text-neutral-400">
          <span className="line-clamp-2 md:line-clamp-3">{item.description ?? ""}</span>
        </p>
      </div>
    </Card>
  )
}

export default TextNewsCard
