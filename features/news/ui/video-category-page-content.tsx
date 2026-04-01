"use client"

import * as React from "react"
import {
  getNewsListForLocale,
  isVideoRawNews,
  type NewsItem,
  type RawNewsItem,
} from "@/features/news/model"
import { usePublicNewsQuery } from "@/features/news/model/public-news-query"
import { Card } from "@/shared/common/components/ui/card"
import { Button } from "@/shared/common/components/ui/button"
import {
  formatDate,
  formatDateISO,
  formatDateTimeLocale,
  type AppLocale,
} from "@/shared/common/lib/formatter"
import { useLocale, useTranslations } from "next-intl"
import { Play } from "lucide-react"
import { ServerLoading, ServerUnavailable, VideoNewsModal } from "@/shared/common/components/molecules"
import { VideoCardMediaPreview } from "@/features/news/ui/news-listing/video-card-media-preview"

const PAGE_SIZE = 30

export function VideoCategoryPageContent() {
  const locale = useLocale() as AppLocale
  const t = useTranslations("common")
  const { data: publicNews = [], isError, isLoading, isFetching } = usePublicNewsQuery()
  const [selected, setSelected] = React.useState<NewsItem | null>(null)
  const [isOpen, setIsOpen] = React.useState(false)

  const allItems = React.useMemo(() => {
    const raw = [...publicNews]
      .filter(isVideoRawNews)
      .sort(
        (a, b) =>
          new Date(b.publishedAt).getTime() -
          new Date(a.publishedAt).getTime()
      )
    return getNewsListForLocale(raw, locale)
  }, [locale, publicNews])

  const featured = allItems.slice(0, 3)
  const rest = allItems.slice(3)
  const [visibleCount, setVisibleCount] = React.useState(PAGE_SIZE)
  const visibleRest = rest.slice(0, visibleCount)
  const hasMore = rest.length > visibleCount

  if ((isLoading || isFetching) && publicNews.length === 0) {
    return <ServerLoading />
  }
  if (isError && publicNews.length === 0) {
    return <ServerUnavailable />
  }

  const handleOpenVideo = (item: NewsItem) => {
    if (!item.videoSource || !item.videoUrl) return
    setSelected(item)
    setIsOpen(true)
  }

  if (allItems.length === 0) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-8">
        <h1 className="text-2xl font-semibold">{t("video_news")}</h1>
        <p className="mt-4 text-muted-foreground">
          {t("search_results_empty")}
        </p>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-7xl px-2 md:px-6">
      <h1 className="text-2xl font-semibold md:text-3xl">{t("video_news")}</h1>
      <section className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
        {featured.map((item: NewsItem) => (
          <button
            key={item.slug}
            type="button"
            className="block w-full text-left"
            onClick={() => handleOpenVideo(item)}
          >
            <Card className="group h-full overflow-hidden rounded-sm border-border p-0 shadow-none transition-shadow hover:shadow-md">
              <div className="relative aspect-video w-full">
                <VideoCardMediaPreview title={item.title} item={item} />
                <span className="absolute inset-0 flex items-center justify-center bg-black/30">
                  <span className="flex size-14 items-center justify-center rounded-full bg-background text-primary md:size-16">
                    <Play className="size-7 fill-current md:size-8" />
                  </span>
                </span>
              </div>
              <div className="flex flex-col gap-2 p-2 pt-0">
                <time
                  dateTime={formatDateISO(item.publishedAt)}
                  className="text-xs text-muted-foreground"
                >
                  {formatDateTimeLocale(item.publishedAt, locale)}
                </time>
                <h2 className="text-base font-semibold leading-tight">
                  <span className="line-clamp-2 md:line-clamp-3">{item.title ?? ""}</span>
                </h2>
                <p className="line-clamp-3 text-sm text-muted-foreground">
                  <span className="line-clamp-2 md:line-clamp-3">{item.description ?? ""}</span>
                </p>
              </div>
            </Card>
          </button>
        ))}
      </section>
      {rest.length > 0 && (
        <section className="mt-4">
          <h2 className="mb-4 text-lg font-semibold">{t("results")}</h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
            {visibleRest.map((item: NewsItem) => (
              <button
                key={item.slug}
                type="button"
                className="block w-full text-left"
                onClick={() => handleOpenVideo(item)}
              >
                <Card className="group overflow-hidden rounded-sm border-border p-0 shadow-none transition-shadow hover:shadow-md">
                  <div className="flex gap-3 p-2">
                    <div className="relative h-20 w-28 shrink-0 overflow-hidden rounded-sm">
                      <VideoCardMediaPreview title={item.title} item={item} />
                      <span className="absolute inset-0 flex items-center justify-center bg-black/30">
                        <span className="flex size-8 items-center justify-center rounded-full bg-background text-primary">
                          <Play className="size-4 fill-current" />
                        </span>
                      </span>
                    </div>
                    <div className="flex min-w-0 flex-1 flex-col justify-center gap-1">
                      <time
                        dateTime={formatDateISO(item.publishedAt)}
                        className="text-xs text-muted-foreground"
                      >
                        {formatDate(item.publishedAt, locale)}
                      </time>
                      <h3 className="line-clamp-2 text-sm font-medium leading-tight">
                        {item.title}
                      </h3>
                    </div>
                  </div>
                </Card>
              </button>
            ))}
          </div>
          {hasMore && (
            <div className="mt-8 flex justify-center">
              <Button
                variant="outline"
                onClick={() => setVisibleCount((n) => n + PAGE_SIZE)}
              >
                {t("read_more")}
              </Button>
            </div>
          )}
        </section>
      )}

      <VideoNewsModal
        item={selected}
        open={isOpen}
        onOpenChange={(open) => {
          setIsOpen(open)
          if (!open) {
            setSelected(null)
          }
        }}
      />
    </div>
  )
}

