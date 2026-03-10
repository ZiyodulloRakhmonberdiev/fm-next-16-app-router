"use client"

import * as React from "react"
import {
  getNewsListForLocale,
  type NewsItem,
  type RawNewsItem,
} from "@/features/news/model"
import { usePublicNewsQuery } from "@/features/news/model/public-news-query"
import { Card } from "@/shared/common/components/ui/card"
import { formatDate, formatDateISO } from "@/shared/common/lib/formatter"
import type { AppLocale } from "@/shared/common/lib/formatter"
import { Link } from "@/i18n/navigation"
import Image from "next/image"
import { useLocale, useTranslations } from "next-intl"
import { Play } from "lucide-react"
import { VideoNewsModal } from "@/shared/common/components/molecules"

function isVideoNewsItem(item: RawNewsItem): boolean {
  const hasVideo = !!(item.videoSource && item.videoUrl)
  const hasImages = !!(item.images && item.images.length > 0)
  return item.type === "video" || (hasVideo && hasImages)
}

export default function CategoryVideo() {
  const locale = useLocale() as AppLocale
  const t = useTranslations("common")
  const { data: publicNews = [] } = usePublicNewsQuery()
  const [selected, setSelected] = React.useState<NewsItem | null>(null)
  const [isOpen, setIsOpen] = React.useState(false)

  const { featured, leftItems, rightItems } = React.useMemo(() => {
    const raw = [...publicNews]
      .filter(isVideoNewsItem)
      .sort(
        (a, b) =>
          new Date(b.publishedAt).getTime() -
          new Date(a.publishedAt).getTime()
      )
      .slice(0, 9)
    const list = getNewsListForLocale(raw, locale)
    if (list.length === 0) {
      return { featured: null, leftItems: [], rightItems: [] }
    }
    const featuredItem = list.reduce((best, cur) =>
      cur.views > best.views ? cur : best
    )
    const rest = list.filter((n) => n.slug !== featuredItem.slug)
    return {
      featured: featuredItem,
      leftItems: rest.slice(0, 4),
      rightItems: rest.slice(4, 8),
    }
  }, [locale, publicNews])

  const handleOpenVideo = (item: NewsItem) => {
    if (!item.videoSource || !item.videoUrl) return
    setSelected(item)
    setIsOpen(true)
  }

  if (!featured && leftItems.length === 0 && rightItems.length === 0) return null
  if (1 + leftItems.length + rightItems.length < 7) return null

  return (
    <section className="w-full space-y-4 px-4 md:px-6 pt-4">
      <div className="py-4 border-t-2 mt-4 border-border">
        <div className="flex items-center justify-between gap-2 mb-4">
          <h2 className="text-lg font-semibold">{t("video_news")}</h2>
          <Link
            href="/news/video"
            className="text-xs md:text-sm font-medium text-brand hover:underline"
          >
            {t("view_all")} {">>"}
          </Link>
        </div>

        <div className="grid w-full grid-cols-1 items-stretch gap-4 md:grid-cols-4">
          <div className="flex w-full min-w-0 flex-col order-2 md:order-1">
            <div className="flex flex-col gap-3">
              {leftItems.map((item) => (
                <button
                  key={item.slug}
                  type="button"
                  className="block w-full text-left"
                  onClick={() => handleOpenVideo(item)}
                >
                  <Card className="overflow-hidden p-0 rounded-sm shadow-none transition-shadow hover:shadow-md bg-background">
                    <div className="flex gap-3">
                      <div className="relative block h-20 w-28 shrink-0 overflow-hidden rounded-xs md:h-24 md:w-32">
                        <Image
                          src={item.images[0]}
                          alt={item.title}
                          fill
                          className="object-cover"
                        />
                        <span className="absolute inset-0 flex items-center justify-center bg-black/40">
                          <span className="flex size-10 items-center justify-center rounded-full bg-background text-primary">
                            <Play className="size-5 fill-current" />
                          </span>
                        </span>
                      </div>
                      <div className="flex min-w-0 flex-1 flex-col justify-center gap-1 py-2 px-1">
                        <time
                          dateTime={formatDateISO(item.publishedAt)}
                          className="text-xs text-muted-foreground"
                        >
                          {formatDate(item.publishedAt, locale)}
                        </time>
                        <span className="line-clamp-2 text-sm font-medium leading-tight">
                          {item.title}
                        </span>
                      </div>
                    </div>
                  </Card>
                </button>
              ))}
            </div>
          </div>

          {featured && (
            <button
              type="button"
              className="block w-full order-1 md:order-2 md:col-span-2 text-left"
              onClick={() => handleOpenVideo(featured)}
            >
              <Card className="relative w-full h-full overflow-hidden rounded-sm border-none p-0 shadow-none transition-shadow hover:shadow-md">
                <div className="relative w-full aspect-video md:h-full md:aspect-auto">
                  <Image
                    src={featured.images[0]}
                    alt={featured.title}
                    fill
                    className="object-cover"
                  />
                  <span className="absolute inset-0 flex items-center justify-center bg-black/30">
                    <span className="flex size-16 items-center justify-center rounded-full bg-background text-primary md:size-20">
                      <Play className="size-8 fill-current md:size-10" />
                    </span>
                  </span>
                  <div className="absolute inset-x-0 bottom-0 bg-linear-to-t from-black/80 to-transparent p-4 space-y-4">
                    <time
                      dateTime={formatDateISO(featured.publishedAt)}
                      className="text-xs text-white/90"
                    >
                      {formatDate(featured.publishedAt, locale)}
                    </time>
                    <h3 className="mt-1 line-clamp-2 text-base font-semibold leading-tight text-white md:text-lg">
                      {featured.title}
                    </h3>
                    <span className="line-clamp-3 hidden md:block font-medium leading-tight text-muted-foreground">{featured.description}</span>
                  </div>
                </div>
              </Card>
            </button>
          )}

          <div className="flex w-full min-w-0 flex-col order-3">
            <div className="flex flex-col gap-3">
              {rightItems.map((item) => (
                <button
                  key={item.slug}
                  type="button"
                  className="block w-full text-left"
                  onClick={() => handleOpenVideo(item)}
                >
                  <Card className="overflow-hidden p-0 rounded-sm shadow-none transition-shadow hover:shadow-md">
                    <div className="flex gap-3">
                      <div className="relative block h-20 w-28 shrink-0 overflow-hidden rounded-xs md:h-24 md:w-32">
                        <Image
                          src={item.images[0]}
                          alt={item.title}
                          fill
                          className="object-cover"
                        />
                        <span className="absolute inset-0 flex items-center justify-center bg-black/40">
                          <span className="flex size-10 items-center justify-center rounded-full bg-background text-primary">
                            <Play className="size-5 fill-current" />
                          </span>
                        </span>
                      </div>
                      <div className="flex min-w-0 flex-1 flex-col justify-center gap-1 py-2 px-1">
                        <time
                          dateTime={formatDateISO(item.publishedAt)}
                          className="text-xs text-muted-foreground"
                        >
                          {formatDate(item.publishedAt, locale)}
                        </time>
                        <span className="line-clamp-2 text-sm font-medium leading-tight">
                          {item.title}
                        </span>
                      </div>
                    </div>
                  </Card>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
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
    </section>
  )
}
