"use client"

import * as React from "react"
import { filterPublishedRawNews, getNewsListForLocale, type NewsItem, type RawNewsItem } from "@/features/news/model"
import { seedNews } from "@/scripts/seed-news"
import { Card } from "@/shared/common/components/ui/card"
import { formatDate, formatDateISO } from "@/shared/common/lib/formatter"
import type { AppLocale } from "@/shared/common/lib/formatter"
import { Link } from "@/i18n/navigation"
import Image from "next/image"
import { useLocale, useTranslations } from "next-intl"
import { Play } from "lucide-react"

function isVideoNewsItem(item: RawNewsItem): boolean {
  const hasVideo = !!(item.videoSource && item.videoUrl)
  const hasImages = !!(item.images && item.images.length > 0)
  return item.type === "video" || (hasVideo && hasImages)
}

function VideoNewsCard({ item, locale }: { item: NewsItem; locale: AppLocale }) {
  return (
    <Link href={`/news/${item.slug}`} className="block">
      <Card className="h-[95px] overflow-hidden rounded-sm border-none p-0 shadow-none transition-shadow hover:shadow-md">
        <div className="flex h-full gap-3 p-2">
          <div className="relative h-20 w-28 shrink-0 overflow-hidden rounded-sm">
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
          <div className="flex min-w-0 flex-1 flex-col justify-center gap-1">
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
    </Link>
  )
}

export default function CategoryVideo() {
  const locale = useLocale() as AppLocale
  const t = useTranslations("common")

  const { featured, leftItems, rightItems } = React.useMemo(() => {
    const raw = filterPublishedRawNews([...seedNews.news])
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
  }, [locale])

  if (!featured && leftItems.length === 0 && rightItems.length === 0) return null

  return (
    <section className="w-full space-y-4 px-4 md:px-6 pt-4">
      <div className="py-4 border-t-2 mt-4 border-border">
        <div className="flex items-center justify-between gap-2 mb-4">
          <h2 className="text-lg font-semibold">Video news</h2>
          <Link
            href="/news/video"
            className="text-sm font-medium text-brand hover:underline"
          >
            {t("view_all")} {">>"}
          </Link>
        </div>

        <div className="grid w-full grid-cols-1 gap-4 md:grid-cols-4">
          <div className="flex w-full min-w-0 flex-col order-2 md:order-1">
            <div className="flex flex-col gap-3">
              {leftItems.map((item) => (
                <VideoNewsCard key={item.slug} item={item} locale={locale} />
              ))}
            </div>
          </div>

          {featured && (
            <Link
              href={`/news/${featured.slug}`}
              className="block w-full order-1 md:order-2 md:col-span-2"
            >
              <Card className="relative w-full overflow-hidden rounded-sm border-none p-0 shadow-none transition-shadow hover:shadow-md">
                <div className="relative aspect-video w-full">
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
                  <div className="absolute inset-x-0 bottom-0 bg-linear-to-t from-black/80 to-transparent p-4">
                    <time
                      dateTime={formatDateISO(featured.publishedAt)}
                      className="text-xs text-white/90"
                    >
                      {formatDate(featured.publishedAt, locale)}
                    </time>
                    <h3 className="mt-1 line-clamp-2 text-base font-semibold leading-tight text-white md:text-lg">
                      {featured.title}
                    </h3>
                  </div>
                </div>
              </Card>
            </Link>
          )}

          <div className="flex w-full min-w-0 flex-col order-3">
            <div className="flex flex-col gap-3">
              {rightItems.map((item) => (
                <VideoNewsCard key={item.slug} item={item} locale={locale} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
