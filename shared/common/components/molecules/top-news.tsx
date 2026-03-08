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
import { filterPublishedRawNews, getNewsListForLocale, type NewsItem } from "@/features/news/model"
import { seedNews } from "@/scripts/seed-news"
import Image from "next/image"
import { cn } from "@/shared/common/lib/utils"
import { AppLocale, formatDateISO, formatDateTimeLocale } from "../../lib/formatter"
import { Link } from "@/i18n/navigation"
import { useLocale } from "next-intl"
import { TruncateExpand } from "@/shared/common/components/ui/truncate-expand"

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

export default function TopNews() {
  const plugin = React.useRef(
    Autoplay({ delay: 6000, stopOnInteraction: true })
  )
  const locale = useLocale() as AppLocale
  const [api, setApi] = React.useState<CarouselApi | null>(null)
  const [selectedIndex, setSelectedIndex] = React.useState(0)

  React.useEffect(() => {
    if (!api) return
    setSelectedIndex(api.selectedScrollSnap())
    api.on("select", () => setSelectedIndex(api.selectedScrollSnap()))
  }, [api])

  const rawTop = filterPublishedRawNews([...seedNews.news])
    .filter((item) => (item as { isTop?: boolean }).isTop)
    .sort(
      (a, b) =>
        new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
    )
    .slice(0, 10)
  const news = getNewsListForLocale(rawTop, locale)

  const handleDotSelect = React.useCallback(
    (index: number) => api?.scrollTo(index),
    [api]
  )

  return (
    <div className="w-full">
      <Carousel
        setApi={setApi}
        plugins={[plugin.current]}
        className="w-full h-auto"
        onMouseEnter={plugin.current.stop}
        onMouseLeave={plugin.current.reset}
      >
        <div className="relative h-full">
          <CarouselContent className="ml-0">
            {news.map((item: NewsItem) => (
              <CarouselItem key={item.slug} className="pl-0">
                <Card className="overflow-hidden mx-1 p-0 rounded-sm">
                  <div className="grid md:min-h-[380px] grid-cols-1 md:grid-cols-5">
                    <div className="flex flex-col justify-between order-1 md:order-0 gap-2 p-4 md:gap-3 md:p-8 bg-background border-none md:col-span-2">
                      <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                        {item.category}
                      </span>
                      <div className="flex flex-col gap-2">
                        <h3 className="text-lg font-semibold leading-tight md:text-xl">
                          <Link href={`/news/${item.slug}`} className="hover:underline">
                            <TruncateExpand maxLength={156} text={item.title} as="span" className="line-clamp-5" />
                          </Link>
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          <TruncateExpand maxLength={156} text={item.description} as="span" className="line-clamp-6" />
                        </p>
                      </div>
                      <time className="text-xs" dateTime={formatDateISO(item.publishedAt)}>
                        {formatDateTimeLocale(item.publishedAt, locale)}
                      </time>
                    </div>
                    <Link
                      href={`/news/${item.slug}`}
                      className="relative block aspect-video md:aspect-auto min-h-[220px] md:min-h-[380px] md:col-span-3"
                    >
                      <Image
                        src={item.images[0]}
                        alt={item.title}
                        fill
                        className="object-cover"
                      />
                      <div className="absolute inset-0 bg-black/30" aria-hidden />
                      <span className="absolute left-3 top-3 z-10 bg-primary rounded-xs px-1.5 py-0.5 text-xs font-semibold text-primary-foreground">
                        Top
                      </span>
                    </Link>
                  </div>
                </Card>
              </CarouselItem>
            ))}
          </CarouselContent>
          <div className="absolute right-2 top-2 flex translate-y-0 gap-2">
            <CarouselPrevious className="static size-10 translate-x-0 translate-y-0 rounded-sm border-none" />
            <CarouselNext className="static size-10 translate-x-0 translate-y-0 rounded-sm border-none" />
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
