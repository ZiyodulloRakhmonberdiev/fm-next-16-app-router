"use client"

import * as React from "react"
import { getNewsListForLocale, isImageTypeRawNews, type NewsItem, type RawNewsItem } from "@/features/news/model"
import { LoadMoreButton } from "@/shared/common/components/molecules"
import type { AppLocale } from "@/shared/common/lib/formatter"
import { useLocale, useTranslations } from "next-intl"
import { cn } from "@/shared/common/lib/utils"
import SimpleNewsCard from "../cards/simple-news-card"

type RelatedNewsProps =
  | { categorySlug: string; excludeSlug: string; latestLimit?: never; sidebar?: boolean }
  | { categorySlug?: never; excludeSlug?: never; latestLimit: number; sidebar?: boolean }

export default function RelatedNews(props: RelatedNewsProps) {
  const { categorySlug, excludeSlug, latestLimit, sidebar = false } = props
  const locale = useLocale() as AppLocale
  const t = useTranslations("common")

  const isLatestMode = latestLimit != null && latestLimit > 0
  const sectionTitle = isLatestMode ? t("latest_news") : t("related_news")
  const [rawItems, setRawItems] = React.useState<RawNewsItem[]>([])
  const [page, setPage] = React.useState(0)
  const [totalPages, setTotalPages] = React.useState(1)
  const [loading, setLoading] = React.useState(false)

  const items = React.useMemo(() => getNewsListForLocale(rawItems, locale), [rawItems, locale])

  const fetchPage = React.useCallback(async (targetPage: number) => {
    const params = new URLSearchParams()
    params.set("status", "published")
    params.set("sortBy", "publishedAt")
    params.set("page", String(targetPage))
    params.set("limit", "10")
    params.set("locale", locale)
    if (!isLatestMode && categorySlug) params.set("category", categorySlug)
    const res = await fetch(`/api/news?${params.toString()}`)
    if (!res.ok) return { rows: [] as RawNewsItem[], nextPage: targetPage, nextTotalPages: totalPages }
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
    const rows = (Array.isArray(json.data) ? json.data : [])
      .map((row) => ({
        ...(row as RawNewsItem),
        publishedAt: toDate(row.publishedAt) ?? new Date(0),
        createdAt: toDate(row.createdAt),
        updatedAt: toDate(row.updatedAt),
      }))
      .filter(isImageTypeRawNews)
      .filter((n) => (isLatestMode ? true : n.slug !== excludeSlug))
    return {
      rows,
      nextPage: Number(json.meta?.page ?? targetPage),
      nextTotalPages: Math.max(1, Number(json.meta?.totalPages ?? 1)),
    }
  }, [categorySlug, excludeSlug, isLatestMode, locale, totalPages])

  React.useEffect(() => {
    let cancelled = false
    setLoading(true)
    void (async () => {
      try {
        const [p1, p2] = await Promise.all([fetchPage(1), fetchPage(2)])
        if (cancelled) return
        const merged = [...p1.rows, ...p2.rows].filter(
          (item, idx, arr) => arr.findIndex((x) => x.slug === item.slug) === idx
        )
        setRawItems(merged)
        setTotalPages(Math.max(1, p1.nextTotalPages))
        setPage(p1.nextTotalPages >= 2 ? 2 : 1)
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [fetchPage])

  const loadMore = React.useCallback(async () => {
    if (loading || page >= totalPages) return
    setLoading(true)
    try {
      const next = await fetchPage(page + 1)
      setRawItems((prev) =>
        [...prev, ...next.rows].filter((item, idx, arr) => arr.findIndex((x) => x.slug === item.slug) === idx)
      )
      setPage(next.nextPage)
      setTotalPages(next.nextTotalPages)
    } finally {
      setLoading(false)
    }
  }, [fetchPage, loading, page, totalPages])

  if (items.length === 0 && !loading) return null

  return (
    <section
      className={cn(
        sidebar ? "mt-0 border-0 pt-0" : "border-t border-border pt-12"
      )}
    >
      <h2
        className={cn(
          "font-semibold",
          sidebar ? "mb-4 text-lg md:text-xl" : "mb-6 text-xl md:text-2xl"
        )}
      >
        {sectionTitle}
      </h2>
      <div className="grid grid-cols-1 gap-4">
        {items.map((item: NewsItem) => (
          <SimpleNewsCard
            key={item.slug}
            item={item}
            locale={locale}
            variant="row"
            description={false}
          />
        ))}
      </div>
      {page < totalPages && (
        <div className="mt-4 flex justify-start">
          <LoadMoreButton
            label={t("load_more")}
            loading={loading}
            onClick={() => void loadMore()}
          />
        </div>
      )}
    </section>
  )
}
