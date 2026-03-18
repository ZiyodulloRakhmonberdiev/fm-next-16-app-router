"use client"

import * as React from "react"
import Image from "next/image"
import { Link } from "@/i18n/navigation"
import { useLocale, useTranslations } from "next-intl"
import { cn } from "@/shared/common/lib/utils"
import type { AppLocale } from "@/shared/common/lib/formatter"
import { usePublicNewsQuery } from "@/features/news/model/public-news-query"
import { getNewsListForLocale, isImageTypeRawNews, type NewsItem } from "@/features/news/model"

const DEFAULT_IMAGE = "/images/news/image-1.png"

function LiveIndicator() {
  return (
    <span className="relative flex h-2 w-2 items-center justify-center" aria-hidden>
      <span className="absolute inline-flex h-2 w-2 animate-ping rounded-full bg-brand opacity-75" />
      <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-brand" />
    </span>
  )
}

export default function HeaderNewsCarousel() {
  const locale = useLocale() as AppLocale
  const { data: publicNews = [] } = usePublicNewsQuery()
  const t = useTranslations("common")
  const items = React.useMemo(() => {
    const raw = [...publicNews]
      .filter(isImageTypeRawNews)
      .filter((n) => Array.isArray(n.images) && n.images.length > 0)
      .sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime())
      .slice(0, 10)
    return getNewsListForLocale(raw, locale)
  }, [publicNews, locale])

  if (items.length === 0) return null

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-6 my-0 mb-4 md:my-3">
      <section className="w-full bg-muted/30 px-4 py-1 md:py-3">
        <div className="flex items-stretch gap-4 md:gap-6">
          <div className="flex shrink-0 items-center gap-2 border-r border-border pr-4 md:pr-6">
            <LiveIndicator />
            <h2 className="text-base font-semibold tracking-tight text-foreground md:text-lg">
              {t("top_news")}
            </h2>
          </div>

          <div className="top-news-scroll-area relative min-w-0 flex-1 overflow-hidden">
            <div
              className="h-full w-full"
              style={{
                maskImage: "linear-gradient(to right, transparent 0%, black 4%, black 96%, transparent 100%)",
                WebkitMaskImage: "linear-gradient(to right, transparent 0%, black 4%, black 96%, transparent 100%)",
              }}
            >
              <div className="animate-top-news-scroll flex w-max flex-row gap-3 py-1">
                {[...items, ...items].map((item, index) => (
                  <TopNewsSliderItem key={`${item.slug}-${index}`} item={item} />
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

function TopNewsSliderItem({ item }: { item: NewsItem }) {
  const src = item.images?.[0] ?? DEFAULT_IMAGE
  return (
    <Link
      href={`/news/${item.slug}`}
      className={cn(
        "flex shrink-0 w-[280px] md:w-[320px] flex-row items-stretch overflow-hidden rounded-lg border border-border/60 bg-background/80 transition-colors hover:bg-muted/60"
      )}
    >
      <div className="relative h-14 w-20 shrink-0 overflow-hidden bg-muted">
        <Image
          src={src}
          alt=""
          fill
          className="object-cover"
          sizes="80px"
          unoptimized={src.startsWith("http")}
        />
      </div>
      <div className="min-w-0 flex-1 px-3 py-2 flex items-center">
        <span className="text-sm font-medium leading-snug text-foreground line-clamp-2">
          {item.title}
        </span>
      </div>
    </Link>
  )
}
