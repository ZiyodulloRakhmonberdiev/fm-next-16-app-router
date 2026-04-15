"use client"

import * as React from "react"
import Image from "next/image"
import { Link } from "@/i18n/navigation"
import { useLocale, useTranslations } from "next-intl"
import type { AppLocale } from "@/shared/common/lib/locale-api"
import { getNewsListForLocale, type RawNewsItem } from "@/features/news/model"
import { usePublicCategoriesQuery } from "@/features/category/model/public-categories-query"
import { getCategoryLabelForNewsItem } from "@/features/category/model/use-category-label"
import { formatDateISO, formatDateTimeDotSlash } from "@/shared/common/lib/formatter"
import { LoadMoreButton } from "@/shared/common/components/molecules/load-more-button"

function getSafeImageSrc(raw?: string): string {
  if (!raw?.trim()) return ""
  const candidate =
    raw.startsWith("http://") || raw.startsWith("https://") || raw.startsWith("/")
      ? raw
      : `/uploads/images/${raw}`
  try {
    new URL(candidate, "http://localhost")
    return candidate
  } catch {
    return ""
  }
}

export function SpecialNewsPageContent({
  title,
  headerImageUrl,
  headerSubtitle,
  headerDescription,
  initialNews,
  initialPage = 1,
  initialTotalPages = 1,
  enableLoadMore = false,
  loadMoreQuery,
}: {
  title: string
  headerImageUrl?: string
  headerSubtitle?: string
  headerDescription?: string
  initialNews: RawNewsItem[]
  initialPage?: number
  initialTotalPages?: number
  enableLoadMore?: boolean
  loadMoreQuery?: {
    stats?: boolean
    themeId?: string
    authorId?: string
  }
}) {
  const locale = useLocale() as AppLocale
  const t = useTranslations("common")
  const { data: categories = [] } = usePublicCategoriesQuery()
  const [rawItems, setRawItems] = React.useState<RawNewsItem[]>(initialNews)
  const [page, setPage] = React.useState(initialPage)
  const [totalPages, setTotalPages] = React.useState(Math.max(1, initialTotalPages))
  const [loading, setLoading] = React.useState(false)
  const hasMore = enableLoadMore && page < totalPages

  React.useEffect(() => {
    setRawItems(initialNews)
  }, [initialNews])

  const items = React.useMemo(() => getNewsListForLocale(rawItems, locale), [rawItems, locale])

  const loadMore = React.useCallback(async () => {
    if (!hasMore || loading) return
    setLoading(true)
    try {
      const nextPage = page + 1
      const params = new URLSearchParams()
      params.set("status", "published")
      params.set("page", String(nextPage))
      params.set("limit", "10")
      params.set("sortBy", "publishedAt")
      params.set("locale", locale)
      if (loadMoreQuery?.stats) params.set("stats", "1")
      if (loadMoreQuery?.themeId) params.set("theme", loadMoreQuery.themeId)
      if (loadMoreQuery?.authorId) params.set("authorId", loadMoreQuery.authorId)
      const res = await fetch(`/api/news?${params.toString()}`)
      if (!res.ok) return
      const json = (await res.json()) as {
        data: Array<Omit<RawNewsItem, "publishedAt" | "createdAt" | "updatedAt"> & {
          publishedAt: string | Date
          createdAt?: string | Date
          updatedAt?: string | Date
        }>
        meta?: { page?: number; totalPages?: number }
      }
      const toDate = (value?: string | Date) => {
        if (!value) return undefined
        const d = value instanceof Date ? value : new Date(value)
        return Number.isNaN(d.getTime()) ? undefined : d
      }
      const normalized = (Array.isArray(json.data) ? json.data : []).map((item) => ({
        ...(item as RawNewsItem),
        publishedAt: toDate(item.publishedAt) ?? new Date(0),
        createdAt: toDate(item.createdAt),
        updatedAt: toDate(item.updatedAt),
      }))
      setRawItems((prev) => [...prev, ...normalized].filter(
        (item, idx, arr) => arr.findIndex((x) => x.slug === item.slug) === idx
      ))
      setPage(Number(json.meta?.page ?? nextPage))
      setTotalPages(Math.max(1, Number(json.meta?.totalPages ?? totalPages)))
    } finally {
      setLoading(false)
    }
  }, [hasMore, loading, loadMoreQuery?.authorId, loadMoreQuery?.stats, loadMoreQuery?.themeId, locale, page, totalPages])

  return (
    <section className="space-y-4 mx-auto md:pt-4">
      <div className="border-b flex justify-center">
        <h1 className="text-xl font-bold md:text-3xl text-center bg-brand text-white inline-block px-3 py-2 rounded-xs">
          {title}
        </h1>
      </div>
      {headerImageUrl || headerSubtitle || headerDescription ? (
        <div className="p-4 bg-foreground/10 dark:bg-card">
          <div className="flex items-start flex-col md:flex-row gap-4">
            
            <div className="min-w-0 order-2 md:order-0">
              {headerSubtitle ? (
                <p className="text-lg md:text-2xl font-bold leading-snug">{headerSubtitle}</p>
              ) : null}
              {headerDescription ? (
                <p className="mt-1 text-sm text-muted-foreground">{headerDescription}</p>
              ) : null}
            </div>
            {headerImageUrl ? (
              <div className="relative w-full h-[30vh] rounded-md md:w-[120px] md:h-[90px] shrink-0 overflow-hidden bg-muted ring-1 ring-border order-1">
                <Image src={headerImageUrl} alt={title} fill className="object-cover" />
              </div>
            ) : null}
          </div>
        </div>
      ) : null}
      <div className="space-y-5 max-w-3xl mx-auto">
        {items.map((item) => {
          const thumb = getSafeImageSrc(item.images?.[0])
          const categoryLabel = getCategoryLabelForNewsItem(categories, false, item, locale)
          return (
            <Link
              key={item.slug}
              href={`/news/${item.slug}`}
              className="group grid grid-cols-3 overflow-hidden bg-background md:grid-cols-3"
            >
              <div className="flex md:min-h-[150px]  md:flex-col items-start md:items-start justify-between md:justify-start md:gap-3 md:p-4 col-span-2 font-semibold">
                <div className="hidden md:flex items-center gap-2 text-sm text-muted-foreground">
                  <span className="line-clamp-1">{categoryLabel}</span>
                  <span>|</span>
                  <time dateTime={formatDateISO(item.publishedAt)}>{formatDateTimeDotSlash(item.publishedAt)}</time>
                </div>
                <h2 className="line-clamp-3 md:text-xl font-bold leading-snug transition-colors group-hover:text-brand">
                  {item.title}
                </h2>
              </div>
              <div className="relative order-1 w-28 h-20 bg-muted md:order-2 md:w-full md:h-full rounded-md md:rounded-none">
                {thumb ? (
                  <Image src={thumb} alt={item.title} fill className="object-cover rounded-md md:rounded-none" />
                ) : null}
              </div>
            </Link>
          )
        })}
      </div>
      {hasMore ? (
        <div className="flex justify-start pt-2">
          <LoadMoreButton label={t("load_more")} loading={loading} onClick={() => void loadMore()} />
        </div>
      ) : null}
    </section>
  )
}
