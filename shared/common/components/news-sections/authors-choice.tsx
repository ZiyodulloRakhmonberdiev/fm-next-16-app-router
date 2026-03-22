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
    .slice(0, 4)
  const items = getNewsListForLocale(rawFiltered, locale)
  if (items.length < 3) return null
  const [featured, ...rightItems] = items

  return (
    <div className="w-full">
      <h2 className="mb-4 text-lg font-semibold">{t("authors_choice")}</h2>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {featured && (
          <div className="md:col-span-1 h-full">
            <Card className="overflow-hidden rounded-sm border-none p-0 shadow-none bg-foreground/5 md:bg-background">
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
                  <Link href={`/category/${featured.categorySlug}`} className="capitalize font-mono flex items-center gap-1 hover:underline">
                    <span className="block w-2 h-2 bg-brand rounded-full"></span>
                    <span className="text-xs capitalize">
                      {getCategoryLabelForNewsItem(categories, categoriesPending, featured, locale)}
                    </span>
                  </Link>
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

        <div className="flex flex-col gap-4">
          {rightItems.map((item: NewsItem) => (
            <Card
              key={item.slug}
              className="flex flex-col gap-2 rounded-sm border-none p-4 shadow-none bg-foreground/5  md:bg-background"
            >
              <div className="flex flex-wrap items-center gap-x-1.5 text-xs text-muted-foreground">
                <Link href={`/category/${item.categorySlug}`} className="capitalize font-mono flex items-center gap-1 hover:underline">
                  <span className="block w-2 h-2 bg-brand rounded-full"></span>
                  <span className="text-xs capitalize">
                    {getCategoryLabelForNewsItem(categories, categoriesPending, item, locale)}
                  </span>
                </Link>
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
                  <span className="line-clamp-2 md:line-clamp-3">{item.title ?? ""}</span>
                </Link>
              </h4>
              <p className="text-sm text-muted-foreground">
                <span className="line-clamp-2 md:line-clamp-3">{item.description ?? ""}</span>
              </p>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}
