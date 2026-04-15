"use client"

import * as React from "react"
import { useEffect, useState } from "react"
import { useLocale, useTranslations } from "next-intl"
import { SavedNewsActions } from "@/features/news/ui/saved-news-actions"
import type { AppLocale } from "@/shared/common/lib/formatter"
import { getNewsListForLocale, type NewsItem, type RawNewsItem } from "@/features/news/model"
import RelatedNews from "@/entities/news/lists/related-news"
import { NewsListingListCard } from "@/features/news/ui/news-listing/news-listing-list-card"
import { normalizeRaw } from "@/features/news/ui/news-listing/news-listing-utils"
import type { FilterType, NewsListResponse } from "@/features/news/ui/news-listing/news-listing-types"
import { NewsListingFilterToolbar } from "@/features/news/ui/news-listing/news-listing-filter-toolbar"
import { NewsListingAuthorsChoiceSidebar } from "@/features/news/ui/news-listing/news-listing-authors-choice-sidebar"
import { usePublicCategoriesQuery } from "@/features/category/model/public-categories-query"
import { Button } from "@/shared/common/components/ui/button"

type SavedItem = {
  _id: string
  newsId?: string
  newsSlug?: string
  news?: Record<string, unknown> | null
}

function toNewsItemFromApi(
  news: Record<string, unknown> | null | undefined,
  locale: AppLocale
) {
  if (!news || typeof news.slug !== "string") return null
  const raw = normalizeRaw(news as NewsListResponse["data"][number]) as RawNewsItem
  return getNewsListForLocale([raw], locale)[0] ?? null
}

export function SavedNewsPageContent() {
  const locale = useLocale() as AppLocale
  const t = useTranslations("auth")
  const tc = useTranslations("common")
  const { data: categories = [] } = usePublicCategoriesQuery()
  const [items, setItems] = useState<SavedItem[]>([])
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [activeFilter, setActiveFilter] = useState<FilterType>("latest")
  const [selectedCategorySlugs, setSelectedCategorySlugs] = useState<string[]>([])
  const [appliedCategorySlugs, setAppliedCategorySlugs] = useState<string[]>([])
  const [authorsChoiceItems, setAuthorsChoiceItems] = useState<NewsItem[]>([])
  const [authorsChoiceLoading, setAuthorsChoiceLoading] = useState(false)
  const [statsBySlug, setStatsBySlug] = React.useState<
    Record<string, { comments: number; reactions: number }>
  >({})

  const selectedCount = selectedCategorySlugs.length

  const fetchAuthorsChoice = React.useCallback(async () => {
    setAuthorsChoiceLoading(true)
    try {
      const res = await fetch(
        `/api/news?status=published&recentMonths=6&authorsChoice=1&sortBy=publishedAt&page=1&limit=4`,
        { cache: "no-store" }
      )
      if (!res.ok) return
      const json = (await res.json()) as NewsListResponse
      const raw = Array.isArray(json.data) ? json.data.map(normalizeRaw) : []
      setAuthorsChoiceItems(getNewsListForLocale(raw, locale))
    } finally {
      setAuthorsChoiceLoading(false)
    }
  }, [locale])

  useEffect(() => {
    void fetchAuthorsChoice()
  }, [fetchAuthorsChoice])

  async function load(nextPage = 1) {
    const res = await fetch(`/api/me/saved-news?page=${nextPage}&limit=30`, { cache: "no-store" })
    if (!res.ok) return
    const payload = (await res.json()) as {
      data?: SavedItem[]
      meta?: { totalPages?: number }
    }
    setItems(payload.data ?? [])
    setTotalPages(Math.max(1, payload.meta?.totalPages ?? 1))
    setPage(nextPage)
  }

  useEffect(() => {
    void load(1)
  }, [])

  const displayRows = React.useMemo(() => {
    const parsed = items.map((row) => ({
      row,
      ni: toNewsItemFromApi(row.news, locale),
    }))
    let list = parsed.filter((p) => {
      if (!p.ni) return true
      if (appliedCategorySlugs.length === 0) return true
      return appliedCategorySlugs.includes(p.ni.categorySlug)
    })
    list = [...list].sort((a, b) => {
      if (!a.ni && !b.ni) return 0
      if (!a.ni) return 1
      if (!b.ni) return -1
      if (activeFilter === "popular") {
        return (b.ni.views ?? 0) - (a.ni.views ?? 0)
      }
      return b.ni.publishedAt.getTime() - a.ni.publishedAt.getTime()
    })
    return list
  }, [items, locale, activeFilter, appliedCategorySlugs])

  const { relatedCategorySlug, relatedExcludeSlug } = React.useMemo(() => {
    const first = displayRows.find(({ ni }) => ni)?.ni
    if (first) {
      return { relatedCategorySlug: first.categorySlug, relatedExcludeSlug: first.slug }
    }
    return { relatedCategorySlug: "politics", relatedExcludeSlug: "" }
  }, [displayRows])

  React.useEffect(() => {
    const slugs = items
      .map((row) => toNewsItemFromApi(row.news, locale)?.slug)
      .filter((s): s is string => Boolean(s))
    const missing = slugs.filter((s) => statsBySlug[s] == null)
    if (missing.length === 0) return
    const ac = new AbortController()
    void (async () => {
      const pairs = await Promise.all(
        missing.map(async (slug) => {
          const [reactionsRes, commentsRes] = await Promise.all([
            fetch(`/api/news/${encodeURIComponent(slug)}/reactions`, { signal: ac.signal }).catch(
              () => null
            ),
            fetch(`/api/news/${encodeURIComponent(slug)}/comments?limit=1&offset=0`, {
              signal: ac.signal,
            }).catch(() => null),
          ])
          const reactionsJson =
            reactionsRes && reactionsRes.ok ? await reactionsRes.json().catch(() => null) : null
          const commentsJson =
            commentsRes && commentsRes.ok ? await commentsRes.json().catch(() => null) : null
          const counts = (reactionsJson?.counts ?? {}) as Record<string, number>
          const reactionsTotal = Object.values(counts).reduce((a, b) => a + Number(b), 0)
          const commentsTotal = Number(commentsJson?.totalPublic ?? 0)
          return [slug, { comments: commentsTotal, reactions: reactionsTotal }] as const
        })
      )
      setStatsBySlug((prev) => {
        const next = { ...prev }
        for (const [slug, stats] of pairs) next[slug] = stats
        return next
      })
    })()
    return () => ac.abort()
  }, [items, locale, statsBySlug])

  const onCategoryToggle = React.useCallback((slug: string, checked: boolean) => {
    setSelectedCategorySlugs((prev) => {
      const set = new Set(prev)
      if (checked) set.add(slug)
      else set.delete(slug)
      return Array.from(set)
    })
  }, [])

  return (
    <section className="w-full px-4 pb-4 md:px-6">
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3 lg:items-start">
        <div className="lg:col-span-2">
          <NewsListingFilterToolbar
            pageHeading={t("saved_messages_title")}
            locale={locale}
            categories={categories}
            activeFilter={activeFilter}
            selectedCategorySlugs={selectedCategorySlugs}
            selectedCount={selectedCount}
            onFilterChange={(next) => setActiveFilter(next)}
            onCategoryToggle={onCategoryToggle}
            onApplyCategories={() => setAppliedCategorySlugs([...selectedCategorySlugs])}
            onClearCategories={() => {
              setSelectedCategorySlugs([])
              setAppliedCategorySlugs([])
            }}
            labels={{
              filterLatest: tc("filter_latest"),
              filterPopular: tc("filter_popular"),
              categories: tc("categories"),
              apply: tc("apply"),
              clear: tc("clear"),
            }}
          />

          <div className="grid grid-cols-1 gap-4">
            {displayRows.map(({ row, ni }) => {
              if (!ni) {
                return (
                  <div
                    key={row._id}
                    className="rounded-lg border border-dashed bg-muted/30 p-4 text-sm text-muted-foreground"
                  >
                    {tc("news_not_found")}
                    {row.newsSlug ? (
                      <span className="ml-1 font-mono text-xs">({row.newsSlug})</span>
                    ) : null}
                  </div>
                )
              }
              return (
                <NewsListingListCard
                  key={row._id}
                  item={ni}
                  locale={locale}
                  stats={statsBySlug[ni.slug]}
                  imagesLabel={tc("images")}
                  imageOverlay={
                    <SavedNewsActions
                      slug={ni.slug}
                      newsId={row.newsId}
                      overlay
                      onToggle={(saved) => {
                        if (!saved) void load(page)
                      }}
                    />
                  }
                />
              )
            })}
          </div>

          {items.length === 0 ? (
            <p className="mt-2 text-sm text-muted-foreground">{tc("saved_news_empty")}</p>
          ) : displayRows.length === 0 ? (
            <p className="mt-2 text-sm text-muted-foreground">{tc("search_results_empty")}</p>
          ) : null}

          {totalPages > 1 ? (
            <div className="mt-5 flex items-center justify-center gap-2">
              <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => void load(page - 1)}>
                {tc("pagination_prev")}
              </Button>
              <span className="text-sm text-muted-foreground">
                {page} / {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                disabled={page >= totalPages}
                onClick={() => void load(page + 1)}
              >
                {tc("pagination_next")}
              </Button>
            </div>
          ) : null}
           <RelatedNews categorySlug={relatedCategorySlug} excludeSlug={relatedExcludeSlug} />
        </div>

        <NewsListingAuthorsChoiceSidebar
          items={authorsChoiceItems}
          loading={authorsChoiceLoading}
          locale={locale}
        />
      </div>
    </section>
  )
}
