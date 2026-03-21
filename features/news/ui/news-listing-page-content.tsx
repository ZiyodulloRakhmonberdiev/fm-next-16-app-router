"use client"

import * as React from "react"
import { useLocale, useTranslations } from "next-intl"
import { useSearchParams } from "next/navigation"
import type { AppLocale } from "@/shared/common/lib/formatter"
import { Button } from "@/shared/common/components/ui/button"
import { getNewsListForLocale, type NewsItem } from "@/features/news/model"
import {
  getCategoryNameFromApi,
  usePublicCategoriesQuery,
} from "@/features/category/model/public-categories-query"
import {
  type FilterType,
  type LayoutType,
  type NewsListResponse,
  type NewsListingVariant,
  flagsForFilter,
  sortByForFilter,
} from "./news-listing/news-listing-types"
import { normalizeRaw } from "./news-listing/news-listing-utils"
import { NewsListingFilterToolbar } from "./news-listing/news-listing-filter-toolbar"
import { NewsListingSkeleton } from "./news-listing/news-listing-skeleton"
import { NewsListingVideoGrid } from "./news-listing/news-listing-video-grid"
import { NewsListingList } from "./news-listing/news-listing-list"
import { NewsListingAuthorsChoiceSidebar } from "./news-listing/news-listing-authors-choice-sidebar"

export type { NewsListingVariant }

export function NewsListingPageContent({
  variant = "latest",
  initial,
  initialFilter,
  initialCategorySlug,
  layout = "list",
  showAuthorsChoice = true,
  forceVideoOnly = false,
  pageSize = 4,
}: {
  variant?: NewsListingVariant
  initial: { items: NewsItem[]; page: number; totalPages: number }
  initialFilter?: FilterType
  initialCategorySlug?: string
  layout?: LayoutType
  showAuthorsChoice?: boolean
  forceVideoOnly?: boolean
  pageSize?: number
}) {
  const locale = useLocale() as AppLocale
  const t = useTranslations("common")
  const { data: categories = [] } = usePublicCategoriesQuery()
  const searchParams = useSearchParams()

  const initialFilterResolved: FilterType =
    initialFilter ?? (variant === "trending" ? "popular" : "latest")
  const [activeFilter, setActiveFilter] = React.useState<FilterType>(initialFilterResolved)
  const [selectedCategorySlugs, setSelectedCategorySlugs] = React.useState<string[]>(() =>
    initialCategorySlug ? [initialCategorySlug] : []
  )
  const [items, setItems] = React.useState<NewsItem[]>(initial.items)
  const [page, setPage] = React.useState(initial.page)
  const [totalPages, setTotalPages] = React.useState(initial.totalPages)
  const [loading, setLoading] = React.useState(false)
  const [authorsChoiceItems, setAuthorsChoiceItems] = React.useState<NewsItem[]>([])
  const [authorsChoiceLoading, setAuthorsChoiceLoading] = React.useState(false)
  const [statsBySlug, setStatsBySlug] = React.useState<
    Record<string, { comments: number; reactions: number }>
  >({})

  const hasMore = page < totalPages

  const buildQuery = React.useCallback(
    (nextPage: number, filter: FilterType, slugs: string[]) => {
      const params = new URLSearchParams()
      params.set("status", "published")
      params.set("recentMonths", "6")
      params.set("page", String(nextPage))
      params.set("limit", String(pageSize))
      params.set("sortBy", sortByForFilter(filter))
      const flags = flagsForFilter(filter)
      if (flags.top) params.set("top", "1")
      if (flags.authorsChoice) params.set("authorsChoice", "1")
      if (flags.breaking) params.set("breaking", "1")
      if (flags.video || forceVideoOnly) params.set("video", "1")
      for (const slug of slugs) {
        params.append("category", slug)
      }
      return `/api/news?${params.toString()}`
    },
    [pageSize, forceVideoOnly]
  )

  const fetchFirstPage = React.useCallback(
    async (filter: FilterType, slugs: string[]) => {
      setLoading(true)
      try {
        const res = await fetch(buildQuery(1, filter, slugs), { cache: "no-store" })
        if (!res.ok) return
        const json = (await res.json()) as NewsListResponse
        const raw = Array.isArray(json.data) ? json.data.map(normalizeRaw) : []
        const nextItems = getNewsListForLocale(raw, locale)
        setItems(nextItems)
        setPage(Number(json.meta?.page ?? 1))
        setTotalPages(Math.max(1, Number(json.meta?.totalPages ?? 1)))
      } finally {
        setLoading(false)
      }
    },
    [buildQuery, locale]
  )

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

  React.useEffect(() => {
    if (!showAuthorsChoice) return
    void fetchAuthorsChoice()
  }, [fetchAuthorsChoice, showAuthorsChoice])

  const urlInitDoneRef = React.useRef(false)
  React.useEffect(() => {
    if (urlInitDoneRef.current) return
    const raw = searchParams?.get("filter")?.trim()
    if (!raw) return
    const allowed: FilterType[] = ["latest", "popular", "top", "authors_choice", "breaking", "video"]
    if (!allowed.includes(raw as FilterType)) return
    urlInitDoneRef.current = true
    const next = raw as FilterType
    setActiveFilter(next)
    const categorySlugs = initialCategorySlug ? [initialCategorySlug] : []
    void fetchFirstPage(next, categorySlugs)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams, fetchFirstPage, initialCategorySlug])

  React.useEffect(() => {
    const slugs = items.map((i) => i.slug)
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
  }, [items, statsBySlug])

  const loadMore = React.useCallback(async () => {
    if (loading || !hasMore) return
    setLoading(true)
    try {
      const nextPage = page + 1
      const res = await fetch(buildQuery(nextPage, activeFilter, selectedCategorySlugs), {
        cache: "no-store",
      })
      if (!res.ok) return
      const json = (await res.json()) as NewsListResponse
      const raw = Array.isArray(json.data) ? json.data.map(normalizeRaw) : []
      const nextItems = getNewsListForLocale(raw, locale)
      setItems((prev) => [...prev, ...nextItems])
      setPage(Number(json.meta?.page ?? nextPage))
      setTotalPages(Math.max(1, Number(json.meta?.totalPages ?? totalPages)))
    } finally {
      setLoading(false)
    }
  }, [loading, hasMore, page, totalPages, buildQuery, locale, activeFilter, selectedCategorySlugs])

  const selectedCount = selectedCategorySlugs.length

  const pageHeading = React.useMemo(() => {
    if (!initialCategorySlug) return t("news")
    return getCategoryNameFromApi(categories, initialCategorySlug, locale)
  }, [initialCategorySlug, categories, locale, t])

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
      <div className={showAuthorsChoice ? "grid grid-cols-1 gap-6 lg:grid-cols-3" : "relative w-full"}>
        <div className={showAuthorsChoice ? "lg:col-span-2" : "w-full"}>
          <NewsListingFilterToolbar
            pageHeading={pageHeading}
            locale={locale}
            categories={categories}
            activeFilter={activeFilter}
            selectedCategorySlugs={selectedCategorySlugs}
            selectedCount={selectedCount}
            onFilterChange={(nextFilter) => {
              setActiveFilter(nextFilter)
              void fetchFirstPage(nextFilter, selectedCategorySlugs)
            }}
            onCategoryToggle={onCategoryToggle}
            onApplyCategories={() => void fetchFirstPage(activeFilter, selectedCategorySlugs)}
            onClearCategories={() => setSelectedCategorySlugs([])}
            labels={{
              filterLatest: t("filter_latest"),
              filterPopular: t("filter_popular"),
              categories: t("categories"),
              apply: t("apply"),
              clear: t("clear"),
            }}
          />

          <div className="grid grid-cols-1 gap-4">
            {loading && page === 1 ? (
              <NewsListingSkeleton pageSize={pageSize} />
            ) : layout === "videoGrid" ? (
              <NewsListingVideoGrid
                items={items}
                locale={locale}
                emptyMessage={t("news_not_found")}
              />
            ) : (
              <NewsListingList
                items={items}
                locale={locale}
                statsBySlug={statsBySlug}
                emptyMessage={t("news_not_found")}
                imagesLabel={t("images")}
              />
            )}
          </div>

          <div className="mt-5 flex justify-start">
            {hasMore ? (
              <Button
                variant="outline"
                onClick={() => void loadMore()}
                disabled={loading}
                className="min-w-40 w-full bg-brand text-white hover:bg-brand/90 hover:text-white"
              >
                {loading ? t("loading") : t("load_more")}
              </Button>
            ) : null}
          </div>
        </div>

        {showAuthorsChoice ? (
          <NewsListingAuthorsChoiceSidebar
            items={authorsChoiceItems}
            loading={authorsChoiceLoading}
            locale={locale}
          />
        ) : null}
      </div>
    </section>
  )
}
