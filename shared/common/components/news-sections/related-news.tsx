"use client"

import * as React from "react"
import { getNewsListForLocale, isImageTypeRawNews, type NewsItem } from "@/features/news/model"
import { usePublicNewsQuery } from "@/features/news/model/public-news-query"
import { Card } from "@/shared/common/components/ui/card"
import { formatDate, formatDateISO } from "@/shared/common/lib/formatter"
import type { AppLocale } from "@/shared/common/lib/formatter"
import Image from "next/image"
import { useLocale, useTranslations } from "next-intl"
import { ChevronRight, Play, RotateCcw, RotateCw } from "lucide-react"
import { VideoNewsModal } from "@/shared/common/components/molecules"
import { Button } from "../ui/button"
import { Link } from "@/i18n/navigation"
import { getCategoryName } from "../../lib/seed-helpers"

type RelatedNewsProps =
  | { categorySlug: string; excludeSlug: string; latestLimit?: never }
  | { categorySlug?: never; excludeSlug?: never; latestLimit: number }

export default function RelatedNews(props: RelatedNewsProps) {
  const { categorySlug, excludeSlug, latestLimit } = props
  const locale = useLocale() as AppLocale
  const t = useTranslations("common")
  const { data: publicNews = [] } = usePublicNewsQuery()
  const [selected, setSelected] = React.useState<NewsItem | null>(null)
  const [isOpen, setIsOpen] = React.useState(false)

  const isLatestMode = latestLimit != null && latestLimit > 0
  const sectionTitle = isLatestMode ? t("latest_news") : t("related_news")

  const [visibleCount, setVisibleCount] = React.useState(
    isLatestMode && latestLimit ? latestLimit : 4
  )

  const items = React.useMemo(() => {
    const raw = [...publicNews]
      .filter(isImageTypeRawNews)
      .filter((n) =>
        isLatestMode ? true : n.slug !== excludeSlug
      )
      .sort(
        (a, b) =>
          new Date(b.publishedAt).getTime() -
          new Date(a.publishedAt).getTime()
      )
    return getNewsListForLocale(raw, locale)
  }, [excludeSlug, locale, publicNews, isLatestMode])

  const visibleItems = items.slice(0, visibleCount)

  if (visibleItems.length === 0) return null

  const getSafeImageSrc = (raw?: string) => {
    if (!raw?.trim()) return ""
    return raw.startsWith("http") || raw.startsWith("/") ? raw : `/uploads/images/${raw}`
  }

  return (
    <section className="mt-10 border-t border-border pt-8">
      <h2 className="mb-6 text-xl md:text-2xl font-semibold">{sectionTitle}</h2>
      <div className="grid grid-cols-1 gap-4">
        {visibleItems.map((item: NewsItem) => (
          <button
            key={item.slug}
            type="button"
            className="block w-full text-left"
            onClick={() => {
              if (item.videoSource && item.videoUrl) {
                setSelected(item)
                setIsOpen(true)
              } else {
                window.location.href = `/news/${item.slug}`
              }
            }}
          >
            <Card className="overflow-hidden p-0 rounded-sm shadow-none border-none transition-shadow hover:shadow-md bg-accent">
              <div className="flex h-full gap-3">
                <div className="relative block h-24 w-32 shrink-0 overflow-hidden rounded-xs md:h-36 md:w-48">
                  {getSafeImageSrc(item.images?.[0]) ? (
                    <Link href={`/news/${item.slug}`}>
                      <Image
                        src={getSafeImageSrc(item.images[0])}
                        alt={item.title ?? ""}
                        fill
                        className="object-cover"
                      />
                    </Link>
                  ) : (
                    <div className="absolute inset-0 bg-muted" />
                  )}
                  {item.videoSource && item.videoUrl && (
                    <span className="absolute inset-0 flex items-center justify-center bg-black/30">
                      <span className="flex size-8 items-center justify-center rounded-full bg-background text-primary">
                        <Play className="size-4 fill-current" />
                      </span>
                    </span>
                  )}
                </div>
                <div className="flex min-w-0 flex-1 flex-col justify-around gap-2 py-2 px-2">
                  <span className="text-xs font-medium text-brand italic uppercase">
                    {getCategoryName(item.categorySlug, locale)}
                  </span>
                  <div className="flex flex-col gap-2">
                    <Link href={`/news/${item.slug}`} className="line-clamp-3 md:text-lg font-medium leading-tight hover:underline">
                      {item.title ?? ""}
                    </Link>
                    {/* <h3 className="line-clamp-3 text-sm leading-tight">
                      <span className="line-clamp-2 md:line-clamp-3 text-muted-foreground">{item.description ?? ""}</span>
                    </h3> */}
                  </div>
                  <div className="flex items-center gap-1">
                    <time
                      dateTime={formatDateISO(item.publishedAt)}
                      className="text-xs"
                    >
                      {formatDate(item.publishedAt, locale)}
                    </time>
                    <span className="text-xs text-muted-foreground">|</span>
                    <span className="text-xs text-muted-foreground">
                      {item.views} {t("views")}
                    </span>
                    <span className="text-xs text-muted-foreground">|</span>
                    <span className="text-xs text-muted-foreground">
                      {item.minutes} {t("min_read")}
                    </span>
                      
                  </div>
                </div>
              </div>
            </Card>
          </button>
        ))}
      </div>
      {visibleCount < items.length && (
        <div className="mt-4 flex justify-start">
          <Button
            className="mt-2 md:mt-4 rounded-sm md:text-lg md:py-6 md:px-8 text-white bg-brand hover:bg-brand/90 cursor-pointer"
            onClick={() => setVisibleCount((prev) => prev + 4)}
          >
            {t("load_more")} <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
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
    </section>
  )
}
