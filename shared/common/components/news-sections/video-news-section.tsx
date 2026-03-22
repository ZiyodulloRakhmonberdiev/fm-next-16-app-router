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
import { ArrowRight, Eye, Play } from "lucide-react"
import { VideoNewsModal } from "@/shared/common/components/molecules"
import { getCloudinaryVideoPosterUrl } from "@/shared/common/lib/cloudinary"
import { getYoutubeThumbnailUrl, getYoutubeEmbedUrl } from "@/shared/common/lib/youtube"

function isVideoNewsItem(item: RawNewsItem): boolean {
  const hasVideo = Boolean(item.videoSource && item.videoUrl)
  return item.type === "video" || hasVideo
}

function getSafeImageSrc(raw?: string): string {
  if (!raw?.trim()) return ""
  return raw.startsWith("http://") || raw.startsWith("https://") || raw.startsWith("/")
    ? raw
    : `/uploads/images/${raw}`
}

/** Kartochka uchun rasm: avval images[0], keyin YouTube thumbnail, keyin Cloudinary poster */
function getCardImageSrc(item: {
  images?: string[]
  videoUrl?: string | null
  videoSource?: string | null
}): string {
  const img = getSafeImageSrc(item.images?.[0])
  if (img) return img
  if (getYoutubeEmbedUrl(item.videoUrl ?? "")) return getYoutubeThumbnailUrl(item.videoUrl) || ""
  return getCloudinaryVideoPosterUrl(item.videoUrl) || ""
}

export default function VideoNewsSection() {
  const locale = useLocale() as AppLocale
  const t = useTranslations("common")
  const { data: publicNews = [] } = usePublicNewsQuery()
  const [selected, setSelected] = React.useState<NewsItem | null>(null)
  const [isOpen, setIsOpen] = React.useState(false)

  const items = React.useMemo(() => {
    const raw = [...publicNews]
      .filter(isVideoNewsItem)
      .sort(
        (a, b) =>
          new Date(b.publishedAt).getTime() -
          new Date(a.publishedAt).getTime()
      )
      .slice(0, 12)
    return getNewsListForLocale(raw, locale)
  }, [locale, publicNews])

  const handleOpenVideo = (item: NewsItem) => {
    if (!item.videoSource || !item.videoUrl) return
    setSelected(item)
    setIsOpen(true)
  }

  if (items.length === 0) return null

  const featured = items.slice(0, 3)
  const rest = items.slice(3)

  return (
    <section className="w-full space-y-4 px-4 md:px-6 pt-4">
      <div className="py-4 pt-4 pb-2">
        <div className="flex text-brand border-b-2 border-brand pb-2 items-center justify-between gap-2 mb-4">
          <h2 className="text-lg font-semibold">{t("video_news")}</h2>
          <Link
            href="/news/video"
            className="text-xs hover:text-brand hover:underline md:text-sm font-medium flex items-center gap-1"
          >
            {t("view_all")} <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          {featured.map((item) => {
            const poster = getCardImageSrc(item)
            return (
              <button
                key={item.slug}
                type="button"
                className="group relative block w-full text-left overflow-hidden rounded-lg"
                onClick={() => handleOpenVideo(item)}
              >
                <div className="relative aspect-video w-full bg-muted overflow-hidden">
                  {poster ? (
                    <Image
                      src={poster}
                      alt={item.title}
                      fill
                      className="object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                  ) : (
                    <div className="absolute inset-0 bg-muted" aria-hidden />
                  )}

                  <span className="absolute inset-0 flex items-center justify-center">
                    <span className="flex size-12 items-center justify-center rounded-full bg-black/35 text-white backdrop-blur-sm">
                      <Play className="size-6 fill-current" />
                    </span>
                  </span>

                  <div className="absolute inset-x-0 bottom-0 bg-linear-to-t from-black/50 to-transparent py-2 px-4 bg-black/30">
                    <p className="line-clamp-2 text-sm font-semibold leading-snug text-white">
                      {item.title}
                    </p>
                    <div className="mt-2 flex items-center justify-end text-[11px] text-white/90 gap-2">
                      <span className="text-xs capitalize">
                        {item.category}
                      </span>
                      <span aria-hidden className="text-muted-foreground text-xs">/</span>
                      <time dateTime={formatDateISO(item.publishedAt)}>
                        {formatDate(item.publishedAt, locale)}
                      </time>
                      {/* <span className="inline-flex items-center gap-1">
                        <Eye className="h-3.5 w-3.5" />
                        {item.views}
                      </span> */}
                    </div>
                  </div>
                </div>
              </button>
            )
          })}
        </div>

        {rest.length > 0 ? (
          <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {rest.map((item) => {
              const poster = getCardImageSrc(item)
              return (
                <button
                  key={item.slug}
                  type="button"
                  className="group block w-full text-left"
                  onClick={() => handleOpenVideo(item)}
                >
                  <Card className="overflow-hidden p-0 rounded-sm shadow-none transition-shadow hover:shadow-md bg-background gap-0 py-0">
                    <div className="flex gap-3">
                      <div className="relative block h-20 w-28 shrink-0 overflow-hidden rounded-xs md:h-24 md:w-32 bg-muted">
                        {poster ? (
                          <Image src={poster} alt={item.title} fill className="object-cover transition-transform duration-300 group-hover:scale-105" />
                        ) : (
                          <div className="absolute inset-0 bg-muted" aria-hidden />
                        )}
                        <span className="absolute inset-0 flex items-center justify-center bg-black/25">
                          <span className="flex size-9 items-center justify-center rounded-full bg-background/90 text-primary">
                            <Play className="size-4 fill-current" />
                          </span>
                        </span>
                      </div>

                      <div className="flex min-w-0 flex-1 flex-col justify-center gap-2 py-2 pr-2">
                        <span className="line-clamp-2 text-sm font-medium leading-tight">
                          {item.title}
                        </span>
                        <div className="flex items-center justify-between gap-2 text-[11px] text-muted-foreground">
                          <span className="inline-flex items-center gap-1">
                            <span className="inline-block size-1.5 rounded-full bg-red-500" aria-hidden />
                            <span className="uppercase">{item.category}</span>
                          </span>
                          <time dateTime={formatDateISO(item.publishedAt)} className="shrink-0">
                            {formatDate(item.publishedAt, locale)}
                          </time>
                        </div>
                      </div>
                    </div>
                  </Card>
                </button>
              )
            })}
          </div>
        ) : null}
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
