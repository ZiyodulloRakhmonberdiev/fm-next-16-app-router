"use client"

import * as React from "react"
import Image from "next/image"
import { Link } from "@/i18n/navigation"
import { useLocale, useTranslations } from "next-intl"
import { Calendar, Check, ChevronDown, Clock, Eye, Heart, MessageSquare, Play } from "lucide-react"
import type { AppLocale } from "@/shared/common/lib/formatter"
import { formatDateISO, formatDateTimeLocale } from "@/shared/common/lib/formatter"
import { Button } from "@/shared/common/components/ui/button"
import { Card } from "@/shared/common/components/ui/card"
import type { RawNewsItem } from "@/features/news/model"
import { getNewsListForLocale, type NewsItem } from "@/features/news/model"
import { getCloudinaryVideoPosterUrl } from "@/shared/common/lib/cloudinary"
import { getYoutubeEmbedUrl, getYoutubeThumbnailUrl } from "@/shared/common/lib/youtube"
import { usePublicCategoriesQuery } from "@/features/category/model/public-categories-query"
import type { PublicCategory } from "@/features/category/model/public-categories-query"
import { useSearchParams } from "next/navigation"
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/shared/common/components/ui/dropdown-menu"

type NewsListResponse = {
  data: Array<Omit<RawNewsItem, "publishedAt" | "createdAt" | "updatedAt"> & { publishedAt: string | Date; createdAt?: string | Date; updatedAt?: string | Date }>
  meta?: { page: number; limit: number; totalPages: number; total?: number }
}

function toDate(value?: string | Date): Date | undefined {
  if (!value) return undefined
  const d = value instanceof Date ? value : new Date(value)
  return Number.isNaN(d.getTime()) ? undefined : d
}

function normalizeRaw(item: NewsListResponse["data"][number]): RawNewsItem {
  return {
    ...(item as any),
    publishedAt: toDate(item.publishedAt) ?? new Date(0),
    createdAt: toDate(item.createdAt),
    updatedAt: toDate(item.updatedAt),
  }
}

function getSafeImageSrc(raw?: string) {
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

function getVideoPoster(url?: string) {
  const u = url?.trim()
  if (!u) return ""
  if (getYoutubeEmbedUrl(u)) return getYoutubeThumbnailUrl(u)
  return getCloudinaryVideoPosterUrl(u)
}

export type NewsListingVariant = "latest" | "trending"
type FilterType = "latest" | "popular" | "top" | "authors_choice" | "breaking" | "video"
type LayoutType = "list" | "videoGrid"

function sortByForFilter(filter: FilterType) {
  return filter === "popular" ? "views" : "publishedAt"
}

function flagsForFilter(filter: FilterType) {
  return {
    top: filter === "top",
    authorsChoice: filter === "authors_choice",
    breaking: filter === "breaking",
    video: filter === "video",
  }
}

export function NewsListingPageContent({
  variant = "latest",
  initial,
  initialFilter,
  layout = "list",
  showAuthorsChoice = true,
  forceVideoOnly = false,
  pageSize = 4,
}: {
  variant?: NewsListingVariant
  initial: { items: NewsItem[]; page: number; totalPages: number }
  initialFilter?: FilterType
  layout?: LayoutType
  showAuthorsChoice?: boolean
  forceVideoOnly?: boolean
  pageSize?: number
}) {
  const locale = useLocale() as AppLocale
  const t = useTranslations("common")
  const { data: categories = [] } = usePublicCategoriesQuery()
  const searchParams = useSearchParams()

  const initialFilterResolved: FilterType = initialFilter ?? (variant === "trending" ? "popular" : "latest")
  const [activeFilter, setActiveFilter] = React.useState<FilterType>(initialFilterResolved)
  const [selectedCategorySlugs, setSelectedCategorySlugs] = React.useState<string[]>([])
  const [items, setItems] = React.useState<NewsItem[]>(initial.items)
  const [page, setPage] = React.useState(initial.page)
  const [totalPages, setTotalPages] = React.useState(initial.totalPages)
  const [loading, setLoading] = React.useState(false)
  const [authorsChoiceItems, setAuthorsChoiceItems] = React.useState<NewsItem[]>([])
  const [authorsChoiceLoading, setAuthorsChoiceLoading] = React.useState(false)
  const [statsBySlug, setStatsBySlug] = React.useState<Record<string, { comments: number; reactions: number }>>({})

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

  const fetchFirstPage = React.useCallback(async (filter: FilterType, slugs: string[]) => {
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
  }, [buildQuery, locale])

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

  // URL orqali filter init: /news?filter=video
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
    void fetchFirstPage(next, [])
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams, fetchFirstPage])

  // Stats (comments + reactions) — faqat ko'rinayotgan itemlar uchun
  React.useEffect(() => {
    const slugs = items.map((i) => i.slug)
    const missing = slugs.filter((s) => statsBySlug[s] == null)
    if (missing.length === 0) return
    const ac = new AbortController()
    void (async () => {
      const pairs = await Promise.all(
        missing.map(async (slug) => {
          const [reactionsRes, commentsRes] = await Promise.all([
            fetch(`/api/news/${encodeURIComponent(slug)}/reactions`, { signal: ac.signal }).catch(() => null),
            fetch(`/api/news/${encodeURIComponent(slug)}/comments?limit=1&offset=0`, { signal: ac.signal }).catch(() => null),
          ])
          const reactionsJson = reactionsRes && reactionsRes.ok ? await reactionsRes.json().catch(() => null) : null
          const commentsJson = commentsRes && commentsRes.ok ? await commentsRes.json().catch(() => null) : null
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
      const res = await fetch(buildQuery(nextPage, activeFilter, selectedCategorySlugs), { cache: "no-store" })
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

  function getCategoryLabel(c: PublicCategory) {
    return c.name?.[locale] ?? c.name?.uz ?? c.slug
  }

  const selectedCount = selectedCategorySlugs.length

  return (
    <section className="w-full px-4 md:px-6 py-6">
      <div className="mx-auto w-full">
        <div className={showAuthorsChoice ? "grid grid-cols-1 gap-6 lg:grid-cols-3" : "w-full relative"}>
          <div className={showAuthorsChoice ? "lg:col-span-2" : "w-full"}>
            <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <h1 className="text-xl font-semibold">{t("news")}</h1>
              <div className="flex items-center gap-2">
                <div className="w-full flex-wrap">
                  <div className="flex flex-wrap items-center gap-1 rounded-md bg-background px-2 py-1">
                    {[
                      { key: "latest", label: t("filter_latest") },
                      { key: "popular", label: t("filter_popular") },
                      // { key: "top", label: t("filter_top") },
                      // { key: "authors_choice", label: t("filter_authors_choice") },
                      // { key: "breaking", label: t("filter_breaking") },
                      // { key: "video", label: t("filter_video") },
                    ].map((btn) => (
                      <Button
                        key={btn.key}
                        type="button"
                        size="sm"
                        variant="ghost"
                        className={[
                          "h-8 rounded-sm px-2",
                          activeFilter === (btn.key as FilterType) ? "text-brand underline underline-offset-4" : "text-muted-foreground",
                        ].join(" ")}
                        onClick={() => {
                          const nextFilter = btn.key as FilterType
                          setActiveFilter(nextFilter)
                          void fetchFirstPage(nextFilter, selectedCategorySlugs)
                        }}
                      >
                        {btn.label}
                      </Button>
                    ))}
                  </div>
                </div>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button type="button" size="sm" variant="ghost" className="h-8 gap-2">
                      <span>{t("categories")}</span>
                      {selectedCount > 0 ? (
                        <span className="text-muted-foreground">({selectedCount})</span>
                      ) : null}
                      <ChevronDown className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuLabel>{t("categories")}</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    {categories.map((c) => {
                      const checked = selectedCategorySlugs.includes(c.slug)
                      return (
                        <DropdownMenuCheckboxItem
                          key={c.slug}
                          checked={checked}
                          onSelect={(e) => e.preventDefault()}
                          onCheckedChange={(next) => {
                            setSelectedCategorySlugs((prev) => {
                              const set = new Set(prev)
                              if (next) set.add(c.slug)
                              else set.delete(c.slug)
                              return Array.from(set)
                            })
                          }}
                        >
                          {getCategoryLabel(c)}
                        </DropdownMenuCheckboxItem>
                      )
                    })}
                    <DropdownMenuSeparator />
                    <div className="flex w-full flex-row gap-2 p-2">
                      <Button
                        type="button"
                        size="sm"
                        variant="ghost"
                        className="h-8 justify-start bg-foreground text-background gap-2"
                        onClick={() => void fetchFirstPage(activeFilter, selectedCategorySlugs)}
                      >
                        {t("apply")}
                      </Button>
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        className="h-8 justify-start gap-2"
                        onClick={() => {
                          setSelectedCategorySlugs([])
                        }}
                      >
                        {t("clear")}
                      </Button>
                    </div>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4">
              {loading && page === 1 ? (
                Array.from({ length: pageSize }).map((_, i) => (
                  <div key={i} className="animate-pulse rounded-lg border bg-background p-3">
                    <div className="flex flex-col gap-3 sm:flex-row">
                      <div className="h-44 w-full rounded-md bg-muted sm:h-28 sm:basis-1/3" />
                      <div className="flex-1 space-y-3">
                        <div className="h-3 w-2/3 rounded bg-muted" />
                        <div className="h-4 w-5/6 rounded bg-muted" />
                        <div className="h-4 w-4/6 rounded bg-muted" />
                        <div className="h-3 w-full rounded bg-muted" />
                        <div className="h-3 w-5/6 rounded bg-muted" />
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                layout === "videoGrid" ? (
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {items.length === 0 ? (
                      <div className="col-span-full rounded-lg border bg-background p-6 text-center text-sm text-muted-foreground">
                        {t("news_not_found")}
                      </div>
                    ) : items.map((item) => {
                      const thumbSrc = getSafeImageSrc(item.images?.[0])
                      const videoPoster = !thumbSrc ? getSafeImageSrc(getVideoPoster(item.videoUrl)) : ""
                      const showVideo = Boolean(item.videoUrl?.trim())
                      const mediaSrc = thumbSrc || videoPoster
                      return (
                        <Link key={item.slug} href={`/news/${item.slug}`} className="group block">
                          <Card className="overflow-hidden rounded-lg shadow-none transition-colors hover:bg-muted/30 gap-0 py-0">
                            <div className="relative aspect-video w-full overflow-hidden bg-muted">
                              {mediaSrc ? (
                                <Image
                                  src={mediaSrc}
                                  alt={item.title}
                                  fill
                                  className="object-cover transition-transform duration-300 group-hover:scale-105"
                                />
                              ) : null}
                              {showVideo ? (
                                <div className="absolute inset-0 flex items-center justify-center">
                                  <span className="inline-flex size-12 items-center justify-center rounded-full bg-black/50">
                                    <Play className="h-6 w-6 text-white" />
                                  </span>
                                </div>
                              ) : null}
                            </div>
                            <div className="p-3 space-y-2">
                              <div className="text-sm font-semibold leading-snug">
                                <span className="line-clamp-2">{item.title ?? ""}</span>
                              </div>
                              <div className="flex flex-wrap items-center gap-x-2 text-xs text-muted-foreground">
                                <span className="uppercase font-medium text-brand italic">{item.category}</span>
                                <span aria-hidden className="select-none">|</span>
                                <time dateTime={formatDateISO(item.publishedAt)}>
                                  {formatDateTimeLocale(item.publishedAt, locale)}
                                </time>
                                <span aria-hidden className="select-none">|</span>
                                <span className="inline-flex items-center gap-1">
                                  <Eye className="h-3.5 w-3.5" />
                                  {item.views}
                                </span>
                              </div>
                            </div>
                          </Card>
                        </Link>
                      )
                    })}
                  </div>
                ) : (
                  items.length === 0 ? (
                    <div className="rounded-lg border bg-background p-6 text-center text-sm text-muted-foreground">
                      {t("news_not_found")}
                    </div>
                  ) : (
                    items.map((item) => {
                      const thumbSrc = getSafeImageSrc(item.images?.[0])
                      const videoPoster = !thumbSrc ? getSafeImageSrc(getVideoPoster(item.videoUrl)) : ""
                      const showVideo = !thumbSrc && Boolean(item.videoUrl?.trim())
                      const mediaSrc = thumbSrc || videoPoster
                      const stats = statsBySlug[item.slug]
                      return (
                        <Link
                          key={item.slug}
                          href={`/news/${item.slug}`}
                          className="group block"
                        >
                          <Card className="overflow-hidden rounded-lg shadow-none transition-colors hover:bg-muted/30 p-0 gap-0 py-0">
                            <div className="flex flex-col gap-3 p-0 sm:flex-row">
                              <div className="relative h-44 w-full overflow-hidden rounded-md bg-muted sm:h-48 sm:basis-1/3">
                                {mediaSrc ? (
                                  <Image
                                    src={mediaSrc}
                                    alt={item.title}
                                    fill
                                    className="object-cover transition-transform duration-300 group-hover:scale-105"
                                  />
                                ) : (
                                  <div className="flex h-full w-full items-center justify-center px-1 text-[10px] text-muted-foreground text-center">
                                    {t("images")}
                                  </div>
                                )}
                                {showVideo ? (
                                  <div className="absolute inset-0 flex items-center justify-center">
                                    <span className="inline-flex size-10 items-center justify-center rounded-full bg-black/50">
                                      <Play className="h-5 w-5 text-white" />
                                    </span>
                                  </div>
                                ) : null}
                              </div>

                              <div className="min-w-0 flex-1 space-y-2 sm:basis-2/3 p-4">
                                <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-[11px] text-muted-foreground">
                                  <span className="uppercase font-medium text-brand italic">{item.category}</span>
                                  <span aria-hidden className="select-none">·</span>
                                  <time dateTime={formatDateISO(item.publishedAt)} className="inline-flex items-center gap-1">
                                    <Calendar className="h-3.5 w-3.5" />
                                    {formatDateTimeLocale(item.publishedAt, locale)}
                                  </time>
                                  <span aria-hidden className="select-none">·</span>
                                  <span className="inline-flex items-center gap-1">
                                    <Clock className="h-3.5 w-3.5" />
                                    {item.minutes}
                                  </span>
                                  <span aria-hidden className="select-none">·</span>
                                  <span className="inline-flex items-center gap-1">
                                    <Eye className="h-3.5 w-3.5" />
                                    {item.views}
                                  </span>
                                  <span aria-hidden className="select-none">·</span>
                                  <span className="inline-flex items-center gap-1">
                                    <MessageSquare className="h-3.5 w-3.5" />
                                    {stats?.comments ?? 0}
                                  </span>
                                  <span aria-hidden className="select-none">·</span>
                                  <span className="inline-flex items-center gap-1">
                                    <Heart className="h-3.5 w-3.5" />
                                    {stats?.reactions ?? 0}
                                  </span>
                                </div>

                                <div className="text-sm font-semibold leading-snug">
                                  <span className="line-clamp-2">{item.title ?? ""}</span>
                                </div>

                                {item.description ? (
                                  <p className="text-sm text-muted-foreground leading-relaxed line-clamp-3">
                                    {item.description}
                                  </p>
                                ) : null}
                              </div>
                            </div>
                          </Card>
                        </Link>
                      )
                    })
                  )
                )
              )}
            </div>

            <div className="mt-5 flex justify-start">
              {hasMore ? (
                <Button variant="outline" onClick={() => void loadMore()} disabled={loading} className="min-w-40 bg-brand hover:bg-brand/90 text-white hover:text-white w-full">
                  {loading ? t("loading") : t("load_more")}
                </Button>
              ) : null}
            </div>
          </div>

          {showAuthorsChoice ? (
            <aside className="hidden lg:block lg:col-span-1 lg:sticky lg:top-20 lg:self-start">
              <div className="flex w-full flex-col gap-4">
                <h2 className="inline-flex items-center text-lg font-semibold">
                  {t("authors_choice")}
                </h2>
                {authorsChoiceLoading ? (
                  <p className="text-sm text-muted-foreground">{t("loading")}</p>
                ) : authorsChoiceItems.length === 0 ? (
                  <p className="text-sm text-muted-foreground">{t("search_results_empty")}</p>
                ) : (
                  <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-1">
                    {authorsChoiceItems.map((n) => {
                      const img = getSafeImageSrc(n.images?.[0]) || getSafeImageSrc(getVideoPoster(n.videoUrl))
                      return (
                        <li key={n.slug}>
                          <Card className="overflow-hidden p-0 rounded-sm shadow-none">
                            <div className="flex gap-3">
                              <Link
                                href={`/news/${n.slug}`}
                                className="relative block h-20 w-28 shrink-0 overflow-hidden rounded-xs md:h-24 md:w-32 bg-muted"
                              >
                                {img ? (
                                  <Image src={img} alt={n.title} fill className="object-cover" />
                                ) : (
                                  <div className="flex h-full w-full items-center justify-center px-1 text-[10px] text-muted-foreground text-center">
                                    {t("images")}
                                  </div>
                                )}
                              </Link>
                              <div className="flex min-w-0 py-2 px-1 flex-col flex-1 justify-center gap-4">
                                <div className="flex flex-wrap items-center gap-x-1.5 text-xs text-muted-foreground">
                                  <span className="uppercase font-medium text-brand italic">{n.category}</span>
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
          ) : null}
        </div>
      </div>
    </section>
  )
}

