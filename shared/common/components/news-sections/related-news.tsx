"use client"

import * as React from "react"
import { getNewsListForLocale, isImageTypeRawNews, type NewsItem } from "@/features/news/model"
import { usePublicNewsQuery } from "@/features/news/model/public-news-query"
import { Card } from "@/shared/common/components/ui/card"
import { formatDate, formatDateISO, formatDateTimeLocale } from "@/shared/common/lib/formatter"
import type { AppLocale } from "@/shared/common/lib/formatter"
import Image from "next/image"
import { useLocale, useTranslations } from "next-intl"
import { Clock, Eye, Heart, MessageCircle, Play } from "lucide-react"
import { LoadMoreButton, VideoNewsModal } from "@/shared/common/components/molecules"
import { Link } from "@/i18n/navigation"
import { usePublicCategoriesQuery } from "@/features/category/model/public-categories-query"
import { getCategoryLabelForNewsItem } from "@/features/category/model/use-category-label"

type RelatedNewsProps =
  | { categorySlug: string; excludeSlug: string; latestLimit?: never }
  | { categorySlug?: never; excludeSlug?: never; latestLimit: number }

export default function RelatedNews(props: RelatedNewsProps) {
  const { categorySlug, excludeSlug, latestLimit } = props
  const locale = useLocale() as AppLocale
  const t = useTranslations("common")
  const { data: publicNews = [] } = usePublicNewsQuery()
  const { data: categories = [], isPending: categoriesPending } = usePublicCategoriesQuery()
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
            <Card className="overflow-hidden p-0 rounded-sm shadow-none border-none transition-shadow hover:shadow-md bg-card">
              <div className="flex h-full gap-3">
                <div className="relative h-24 w-32 md:h-36 md:w-48 shrink-0 overflow-hidden rounded-md bg-muted transition-transform duration-300">
                  {getSafeImageSrc(item.images?.[0]) ? (
                    <Link href={`/news/${item.slug}`} >
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
                <div className="flex min-w-0 flex-1 flex-col justify-around gap-2 py-4 px-2">
                    <div className="flex items-center gap-2">
                      <Link href={`/category/${item.categorySlug}`} className="text-xs font-mono capitalize flex items-center gap-2 hover:underline">
                        <span className="block w-2 h-2 bg-brand rounded-full"></span>
                        <span>
                          {getCategoryLabelForNewsItem(categories, categoriesPending, item, locale)}
                        </span>
                      </Link>
                      <span className="text-xs text-muted-foreground hidden md:block">/</span>
                      <time
                        dateTime={formatDateISO(item.publishedAt)}
                        className="text-xs text-muted-foreground hidden md:block"
                      >
                        {formatDateTimeLocale(item.publishedAt, locale)}
                      </time>
                    </div>
                    <Link href={`/news/${item.slug}`} className="line-clamp-2 md:line-clamp-2 text-sm md:text-lg font-medium leading-tight hover:underline flex-1">
                      {item.title ?? ""}
                    </Link>
                    <div className="hidden md:flex flex-wrap items-center gap-x-2 gap-y-1.5 border-t border-border/70 px-2 py-2 text-xs text-muted-foreground sm:px-1">
                      <span
                        className="inline-flex items-center gap-1.5"
                        title={`${item.views} ${t("views")}`}
                        aria-label={`${item.views} ${t("views")}`}
                      >
                        <Eye className="size-3.5 shrink-0 opacity-80" aria-hidden />
                        <span className="tabular-nums font-medium text-foreground/90">{item.views}</span>
                        <span className="hidden md:inline">{t("views")}</span>
                      </span>
                      <span className="text-border/80 select-none" aria-hidden>
                        ·
                      </span>
                      <span
                        className="inline-flex items-center gap-1.5"
                        title={`${item.minutes} ${t("min_read")}`}
                        aria-label={`${item.minutes} ${t("min_read")}`}
                      >
                        <Clock className="size-3.5 shrink-0 opacity-80" aria-hidden />
                        <span className="tabular-nums font-medium text-foreground/90">{item.minutes}</span>
                        <span className="hidden md:inline">{t("min_read")}</span>
                      </span>
                      <span className="text-border/80 select-none" aria-hidden>
                        ·
                      </span>
                      <span
                        className="inline-flex items-center gap-1.5"
                        title={`${item.commentCount ?? 0} ${t("comments")}`}
                        aria-label={`${item.commentCount ?? 0} ${t("comments")}`}
                      >
                        <MessageCircle className="size-3.5 shrink-0 opacity-80" aria-hidden />
                        <span className="tabular-nums font-medium text-foreground/90">
                          {item.commentCount ?? 0}
                        </span>
                        <span className="hidden md:inline">{t("comments")}</span>
                      </span>
                      <span className="text-border/80 select-none" aria-hidden>
                        ·
                      </span>
                      <span
                        className="inline-flex items-center gap-1.5"
                        title={`${item.reactionCount ?? 0} ${t("reactions")}`}
                        aria-label={`${item.reactionCount ?? 0} ${t("reactions")}`}
                      >
                        <Heart className="size-3.5 shrink-0 opacity-80" aria-hidden />
                        <span className="tabular-nums font-medium text-foreground/90">
                          {item.reactionCount ?? 0}
                        </span>
                        <span className="hidden md:inline">{t("reactions")}</span>
                      </span>
                      
                      {item.videoUrl ? (
                        <>
                          <span className="text-border/80 select-none" aria-hidden>
                            ·
                          </span>
                          <span
                            className="inline-flex items-center gap-1.5"
                            aria-label={t("video")}
                          >
                            <Play className="size-3.5 shrink-0 opacity-80" aria-hidden />
                            <span className="hidden md:inline">{t("video")}</span>
                          </span>
                        </>
                      ) : null}
                    </div>
                    <time
                        dateTime={formatDateISO(item.publishedAt)}
                        className="text-xs text-muted-foreground block md:hidden"
                      >
                        {formatDateTimeLocale(item.publishedAt, locale)}
                      </time>
                  </div>
                </div>
            </Card>


          </button>
        ))}
      </div>
      {visibleCount < items.length && (
        <div className="mt-4 flex justify-start">
          <LoadMoreButton
            label={t("load_more")}
            onClick={() => setVisibleCount((prev) => prev + 4)}
          />
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
