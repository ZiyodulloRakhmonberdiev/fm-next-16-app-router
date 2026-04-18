"use client"

import * as React from "react"
import { Card } from "@/shared/common/components/ui/card"
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/shared/common/components/ui/carousel"
import type { CarouselApi } from "@/shared/common/components/ui/carousel"
import Autoplay from "embla-carousel-autoplay"
import {
  getNewsListForLocale,
  isImageTypeRawNews,
  type NewsItem,
} from "@/features/news/model"
import { usePublicNewsQuery } from "@/features/news/model/public-news-query"
import { usePublicCategoriesQuery } from "@/features/category/model/public-categories-query"
import { getCategoryLabelForNewsItem } from "@/features/category/model/use-category-label"
import Image from "next/image"
import { cn } from "@/shared/common/lib/utils"
import {
  AppLocale,
  formatDateISO,
  formatDateTimeLocale,
} from "../../lib/formatter"
import { Link } from "@/i18n/navigation"
import { useLocale } from "next-intl"

function CarouselDots({
  count,
  selectedIndex,
  onSelect,
}: {
  count: number
  selectedIndex: number
  onSelect: (index: number) => void
}) {
  return (
    <div className="hidden md:flex justify-center gap-1.5 pt-3">
      {Array.from({ length: count }).map((_, i) => (
        <button
          key={i}
          type="button"
          aria-label={`Slide ${i + 1}`}
          onClick={() => onSelect(i)}
          className={cn(
            "h-2 rounded-full transition-all duration-200",
            i === selectedIndex
              ? "w-6 bg-primary"
              : "w-2 bg-muted-foreground/40 hover:bg-muted-foreground/60"
          )}
        />
      ))}
    </div>
  )
}

export default function TopNewsCarousel2() {
  const plugin = React.useRef(
    Autoplay({ delay: 6000, stopOnInteraction: true })
  )
  const locale = useLocale() as AppLocale
  const { data: publicNews = [] } = usePublicNewsQuery()
  const { data: categories = [], isPending: categoriesPending } = usePublicCategoriesQuery()
  const [api, setApi] = React.useState<CarouselApi | null>(null)
  const [selectedIndex, setSelectedIndex] = React.useState(0)

  React.useEffect(() => {
    if (!api) return
    setSelectedIndex(api.selectedScrollSnap())
    api.on("select", () => setSelectedIndex(api.selectedScrollSnap()))
  }, [api])

  const rawTop = [...publicNews]
    .filter(isImageTypeRawNews)
    .filter((item) => (item as { isTop?: boolean }).isTop)
    .sort(
      (a, b) =>
        new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
    )
    .slice(0, 10)
  const news = getNewsListForLocale(rawTop, locale)
  if (news.length === 0) return null

  const getSafeImageSrc = (raw?: string) => {
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

  const handleDotSelect = React.useCallback(
    (index: number) => api?.scrollTo(index),
    [api]
  )

  return (
    <div className="w-full min-h-[420px] md:min-h-[480px] lg:min-h-[520px]">
      <Carousel
        setApi={setApi}
        opts={{ loop: true }}
        plugins={[plugin.current]}
        className="w-full h-full"
        onMouseEnter={plugin.current.stop}
        onMouseLeave={plugin.current.reset}
      >
        <div className="relative h-full">
          <CarouselContent className="ml-0 h-full">
            {news.map((item: NewsItem) => (
              <CarouselItem key={item.slug} className="pl-0 h-full">
                <Card className="relative overflow-hidden mx-1 p-0 rounded-sm h-[420px] md:h-[480px] lg:h-[580px]">
                  <Link
                    href={`/news/${item.slug}`}
                    className="relative block w-full h-full"
                  >
                    {getSafeImageSrc(item.images?.[0]) ? (
                      <Image
                        src={getSafeImageSrc(item.images[0])}
                        alt={item.title ?? ""}
                        fill
                        className="object-cover"
                        sizes="100vw"
                      />
                    ) : (
                      <div className="absolute inset-0 bg-muted" aria-hidden />
                    )}
                    <div className="absolute inset-0 bg-linear-to-t from-black/70 via-black/40 to-transparent" />

                    <span className="absolute left-3 top-3 z-20 bg-primary rounded-xs px-1.5 py-0.5 text-xs font-semibold text-primary-foreground">
                      Top
                    </span>

                    <div className="absolute inset-x-0 bottom-0 z-20 p-4 md:p-6 flex flex-col gap-2 text-white bg-black/50">
                      <span className="text-xs font-medium uppercase tracking-wide text-white/80">
                        {getCategoryLabelForNewsItem(categories, categoriesPending, item, locale)}
                      </span>
                      <h3 className="text-lg font-semibold leading-tight md:text-2xl">
                        <span className="line-clamp-2 md:line-clamp-3">
                          {item.title ?? ""}
                        </span>
                      </h3>
                      <p className="text-sm text-white/90">
                        <span className="line-clamp-2 md:line-clamp-4">
                          {item.description ?? ""}
                        </span>
                      </p>
                      <time
                        className="mt-1 text-xs text-white/80"
                        dateTime={formatDateISO(item.publishedAt)}
                      >
                        {formatDateTimeLocale(item.publishedAt, locale)}
                      </time>
                    </div>
                  </Link>
                </Card>
              </CarouselItem>
            ))}
          </CarouselContent>
          <div className="absolute right-2 top-2 flex translate-y-0 gap-2 z-30">
            <CarouselPrevious className="static size-10 translate-x-0 translate-y-0 rounded-sm border-none bg-black/40 text-white hover:text-white hover:bg-black/60" />
            <CarouselNext className="static size-10 translate-x-0 translate-y-0 rounded-sm border-none bg-black/40 text-white hover:text-white hover:bg-black/60" />
          </div>
        </div>
        <CarouselDots
          count={news.length}
          selectedIndex={selectedIndex}
          onSelect={handleDotSelect}
        />
      </Carousel>
    </div>
  )
}