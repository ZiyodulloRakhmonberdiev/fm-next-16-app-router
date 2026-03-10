"use client"

import * as React from "react"
import { filterPublishedRawNews, getNewsListForLocale, type NewsItem } from "@/features/news/model"
import { seedNews } from "@/scripts/seed-news"
import { Card } from "@/shared/common/components/ui/card"
import { formatDate, formatDateISO } from "@/shared/common/lib/formatter"
import type { AppLocale } from "@/shared/common/lib/formatter"
import Image from "next/image"
import { useLocale, useTranslations } from "next-intl"
import { Play } from "lucide-react"
import { VideoNewsModal } from "@/shared/common/components/molecules"

type RelatedNewsProps = {
  categorySlug: string
  excludeSlug: string
}

export default function RelatedNews({ categorySlug, excludeSlug }: RelatedNewsProps) {
  const locale = useLocale() as AppLocale
  const t = useTranslations("common")
  const [selected, setSelected] = React.useState<NewsItem | null>(null)
  const [isOpen, setIsOpen] = React.useState(false)

  const items = React.useMemo(() => {
    const raw = filterPublishedRawNews([...seedNews.news])
      .filter((n) => n.categorySlug === categorySlug && n.slug !== excludeSlug)
      .sort(
        (a, b) =>
          new Date(b.publishedAt).getTime() -
          new Date(a.publishedAt).getTime()
      )
      .slice(0, 9)
    return getNewsListForLocale(raw, locale)
  }, [categorySlug, excludeSlug, locale])

  if (items.length === 0) return null

  return (
    <section className="mt-10 border-t border-border pt-8">
      <h2 className="mb-4 text-lg font-semibold">{t("related_news")}</h2>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((item: NewsItem) => (
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
            <Card className="overflow-hidden p-0 rounded-sm shadow-none transition-shadow hover:shadow-md bg-background">
              <div className="flex gap-3">
                <div className="relative block h-20 w-28 shrink-0 overflow-hidden rounded-xs md:h-24 md:w-32">
                  <Image
                    src={item.images[0]}
                    alt={item.title}
                    fill
                    className="object-cover"
                  />
                  {item.videoSource && item.videoUrl && (
                    <span className="absolute inset-0 flex items-center justify-center bg-black/30">
                      <span className="flex size-8 items-center justify-center rounded-full bg-background text-primary">
                        <Play className="size-4 fill-current" />
                      </span>
                    </span>
                  )}
                </div>
                <div className="flex min-w-0 flex-1 flex-col justify-center gap-1 py-2 px-1">
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
