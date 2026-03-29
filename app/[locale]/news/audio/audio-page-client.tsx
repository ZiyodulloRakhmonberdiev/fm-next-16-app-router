"use client"

import * as React from "react"
import { useLocale } from "next-intl"
import { Volume2 } from "lucide-react"
import type { AppLocale } from "@/shared/common/lib/formatter"
import { getNewsListForLocale, type NewsItem, type RawNewsItem } from "@/features/news/model"
import { AudioListingCard } from "@/features/news/ui/news-listing/audio-listing-card"
import { NewsListingAuthorsChoiceSidebar } from "@/features/news/ui/news-listing/news-listing-authors-choice-sidebar"
import { AudioPlayerBar } from "@/widgets/audio-player-bar/ui/audio-player-bar"
import { LoadMoreButton } from "@/shared/common/components/molecules/load-more-button"
import { normalizeRaw } from "@/features/news/ui/news-listing/news-listing-utils"
import type { NewsListResponse } from "@/features/news/ui/news-listing/news-listing-types"
import { cn } from "@/shared/common/lib/utils"

type Props = {
  initial: { items: NewsItem[]; page: number; totalPages: number }
}

export function AudioNewsPageClient({ initial }: Props) {
  const locale = useLocale() as AppLocale
  const [items, setItems] = React.useState<NewsItem[]>(initial.items)
  const [page, setPage] = React.useState(initial.page)
  const [totalPages, setTotalPages] = React.useState(initial.totalPages)
  const [loading, setLoading] = React.useState(false)
  const [activeIndex, setActiveIndex] = React.useState<number | null>(null)
  const [isPlaying, setIsPlaying] = React.useState(false)
  const [authorsChoiceItems, setAuthorsChoiceItems] = React.useState<NewsItem[]>([])
  const [authorsChoiceLoading, setAuthorsChoiceLoading] = React.useState(false)
  const activeAudio = activeIndex !== null ? items[activeIndex] ?? null : null
  const hasPrev = activeIndex !== null && activeIndex > 0
  const hasNext = activeIndex !== null && activeIndex < items.length - 1

  const hasMore = page < totalPages

  React.useEffect(() => {
    setAuthorsChoiceLoading(true)
    fetch(`/api/news?status=published&authorsChoice=1&sortBy=publishedAt&page=1&limit=6`)
      .then((r) => (r.ok ? r.json() : null))
      .then((json) => {
        if (!json) return
        const raw: RawNewsItem[] = Array.isArray(json.data) ? json.data.map(normalizeRaw) : []
        setAuthorsChoiceItems(getNewsListForLocale(raw, locale))
      })
      .finally(() => setAuthorsChoiceLoading(false))
  }, [locale])

  const loadMore = React.useCallback(async () => {
    if (loading || !hasMore) return
    setLoading(true)
    try {
      const nextPage = page + 1
      const res = await fetch(
        `/api/news?status=published&audio=1&sortBy=publishedAt&page=${nextPage}&limit=9`
      )
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
  }, [loading, hasMore, page, totalPages, locale])

  const handlePlay = React.useCallback(
    (item: NewsItem) => {
      const idx = items.findIndex((i) => i.slug === item.slug)
      if (idx === -1) return
      if (activeIndex === idx) {
        setIsPlaying((prev) => !prev)
      } else {
        setActiveIndex(idx)
        setIsPlaying(true)
      }
    },
    [items, activeIndex]
  )

  const handlePrev = React.useCallback(() => {
    if (!hasPrev || activeIndex === null) return
    setActiveIndex(activeIndex - 1)
    setIsPlaying(true)
  }, [hasPrev, activeIndex])

  const handleNext = React.useCallback(() => {
    if (!hasNext || activeIndex === null) return
    setActiveIndex(activeIndex + 1)
    setIsPlaying(true)
  }, [hasNext, activeIndex])

  const handleClose = React.useCallback(() => {
    setActiveIndex(null)
    setIsPlaying(false)
  }, [])

  return (
    <div className="relative px-4 md:px-6">
      <AudioPlayerBar
        activeNews={activeAudio}
        isPlaying={isPlaying}
        onPlayPause={setIsPlaying}
        onPrev={handlePrev}
        onNext={handleNext}
        hasPrev={hasPrev}
        hasNext={hasNext}
        onClose={handleClose}
      />

      {/* Top padding when player is active so content doesn't hide behind it (~64px player height) */}
      {/* <div className={cn("transition-all duration-300", activeAudio ? "pt-16" : "pt-0")} /> */}

      <section className="w-full pt-6">
        {/* Page heading */}
        {/* <div className="pb-6">
          <div className="inline-flex items-center gap-3">
            <div>
              <h1 className="text-2xl font-bold md:text-3xl tracking-tight">Audio</h1>
              <p className="text-sm text-muted-foreground mt-0.5">
                Oxirgi audio xabarlar va tahlillar
              </p>
            </div>
          </div>
        </div> */}

        {/* Two-column layout: news list + authors choice sidebar */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3 lg:items-start">
          <div className="lg:col-span-2 space-y-4">
            {items.length === 0 && !loading ? (
              <div className="rounded-xl border bg-background p-8 text-center text-sm text-muted-foreground">
                Audio xabarlar topilmadi
              </div>
            ) : (
              items.map((item, idx) => (
                <AudioListingCard
                  key={item.slug}
                  item={item}
                  locale={locale}
                  isActive={activeIndex === idx}
                  isPlaying={activeIndex === idx && isPlaying}
                  onPlay={handlePlay}
                />
              ))
            )}

            {hasMore ? (
              <div className="pt-2">
                <LoadMoreButton
                  label={loading ? "Yuklanmoqda…" : "Ko'proq yuklash"}
                  onClick={() => void loadMore()}
                />
              </div>
            ) : null}
          </div>

          <NewsListingAuthorsChoiceSidebar
            items={authorsChoiceItems}
            loading={authorsChoiceLoading}
            locale={locale}
          />
        </div>
      </section>
    </div>
  )
}
