"use client"

import * as React from "react"
import { getNewsListForLocale, isImageTypeRawNews, type NewsItem } from "@/features/news/model"
import { usePublicNewsQuery } from "@/features/news/model/public-news-query"
import { getCategoryNameFromApi, usePublicCategoriesQuery } from "@/features/category/model/public-categories-query"
import { Card } from "@/shared/common/components/ui/card"
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/shared/common/components/ui/carousel"
import type { CarouselApi } from "@/shared/common/components/ui/carousel"
import { formatDate, formatDateISO } from "@/shared/common/lib/formatter"
import type { AppLocale } from "@/shared/common/lib/formatter"
import { Link } from "@/i18n/navigation"
import Image from "next/image"
import { useLocale, useTranslations } from "next-intl"
import Autoplay from "embla-carousel-autoplay"
import { ArrowRight, ExternalLink } from "lucide-react"
import { cn } from "@/shared/common/lib/utils"

type SlideNewsSectionProps = {
  categorySlug?: string
}

type SlideVisual = { opacity: number; blurPx: number }

/** intersectionRatio 1 = to‘liq ko‘rinadi; <1 = qisman — opacity + blur */
function ratioToVisual(ratio: number): SlideVisual {
  const hidden = 1 - Math.min(1, Math.max(0, ratio))
  const edge = Math.min(1, hidden * 1.15)
  return {
    opacity: 1 - 0.42 * edge,
    blurPx: 3.5 * edge,
  }
}

export default function SlideNewsSection({
  categorySlug = "sports",
}: SlideNewsSectionProps) {
  const autoplay = React.useRef(
    Autoplay({
      delay: 5000,
      stopOnInteraction: true,
    })
  )
  const locale = useLocale() as AppLocale
  const t = useTranslations("common")
  const { data: publicNews = [] } = usePublicNewsQuery()
  const { data: categories = [] } = usePublicCategoriesQuery()
  const categoryName = getCategoryNameFromApi(categories, categorySlug, locale)
  const [api, setApi] = React.useState<CarouselApi | null>(null)
  const [slideVisual, setSlideVisual] = React.useState<SlideVisual[]>([])
  const [selectedSnap, setSelectedSnap] = React.useState(0)

  React.useEffect(() => {
    if (!api) return
    const sync = () => setSelectedSnap(api.selectedScrollSnap())
    sync()
    api.on("select", sync)
    api.on("reInit", sync)
    return () => {
      api.off("select", sync)
      api.off("reInit", sync)
    }
  }, [api])

  const items = React.useMemo(() => {
    const raw = [...publicNews]
      .filter(isImageTypeRawNews)
      .filter((n) => n.categorySlug === categorySlug)
      .sort(
        (a, b) =>
          new Date(b.publishedAt).getTime() -
          new Date(a.publishedAt).getTime()
      )
    return getNewsListForLocale(raw, locale)
  }, [categorySlug, locale, publicNews])

  React.useEffect(() => {
    if (!api || items.length === 0) return

    const root = api.rootNode()
    const threshold = Array.from({ length: 21 }, (_, i) => i / 20)

    let observer: IntersectionObserver | null = null

    const setup = () => {
      observer?.disconnect()
      observer = new IntersectionObserver(
        (entries) => {
          setSlideVisual((prev) => {
            const next =
              prev.length === items.length ? [...prev] : items.map(() => ({ opacity: 1, blurPx: 0 }))
            const slides = api.slideNodes()
            for (const entry of entries) {
              const idx = slides.indexOf(entry.target as HTMLElement)
              if (idx < 0) continue
              const logical =
                slides.length === items.length ? idx : idx % items.length
              if (logical < 0 || logical >= items.length) continue
              next[logical] = ratioToVisual(entry.intersectionRatio)
            }
            return next
          })
        },
        { root, rootMargin: "0px", threshold }
      )
      api.slideNodes().forEach((el) => observer!.observe(el))
    }

    setSlideVisual(items.map(() => ({ opacity: 1, blurPx: 0 })))
    setup()
    api.on("reInit", setup)

    return () => {
      api.off("reInit", setup)
      observer?.disconnect()
    }
  }, [api, items.length])

  if (items.length < 1) return null

  return (
    <section className="my-4 w-full space-y-4 px-4 md:px-6">
      <div className="border-t-2 border-border">
        <Carousel
          setApi={setApi}
          plugins={[autoplay.current]}
          opts={{
            align: "center",
            loop: true,
            duration: 20,
          }}
          className="w-full"
          onMouseEnter={autoplay.current.stop}
          onMouseLeave={autoplay.current.reset}
        >
          <div className="my-4 flex flex-wrap items-center justify-between gap-3 border-b-2 border-brand pb-3">
            <Link
              href={`/category/${categorySlug}`}
              className="flex items-center gap-2 text-lg font-semibold text-brand transition-colors hover:text-brand/80 hover:underline"
            >
              <span>{categoryName}</span>
              <ExternalLink className="hidden size-4 md:inline-block" aria-hidden />
            </Link>
            <Link
              href={`/category/${categorySlug}`}
              className="text-sm font-medium text-brand underline-offset-4 hover:underline md:hidden flex items-center gap-2"
            >
              <span>{t("view_all")}</span> <ArrowRight className="w-4 h-4" />
            </Link>
            <div className="hidden shrink-0 items-center gap-2 md:flex md:gap-3">
              <CarouselPrevious
                variant="outline"
                className="static shrink-0 left-auto! right-auto! top-auto! translate-none! size-9 rounded-sm border bg-background shadow-sm md:size-10"
              />
              <CarouselNext
                variant="outline"
                className="static shrink-0 left-auto! right-auto! top-auto! translate-none! size-9 rounded-sm border bg-background shadow-sm md:size-10"
              />
            </div>
          </div>

          {/* Mobile: yon peek kartalar biroz torroq; md: ~3 ta + o‘ng peek */}
          <div className="min-w-0 w-full [--slide-w:calc((100%-1rem)/1.08)] md:[--slide-w:calc((100%-1rem)/3.2)]">
            <CarouselContent className="ml-0">
              {items.map((item: NewsItem, index: number) => {
                const fx = slideVisual[index] ?? { opacity: 1, blurPx: 0 }
                return (
                  <CarouselItem
                    key={item.slug}
                    className="min-w-0 shrink-0 pl-3 flex-[0_0_var(--slide-w)]"
                  >
                    <div
                      className="h-full transition-[opacity,filter] duration-200 ease-out"
                      style={{
                        opacity: fx.opacity,
                        filter:
                          fx.blurPx > 0.35
                            ? `blur(${fx.blurPx.toFixed(2)}px)`
                            : undefined,
                      }}
                    >
                      <Link href={`/news/${item.slug}`} className="block h-full">
                        <Card className="h-full gap-0 overflow-hidden rounded-sm border bg-background p-0 shadow-none transition-shadow hover:shadow-md">
                          <div className="relative aspect-video w-full">
                            <Image
                              src={item.images[0]}
                              alt={item.title}
                              fill
                              className="object-cover"
                            />
                          </div>
                          <div className="flex flex-col gap-2 p-4">
                            <time
                              dateTime={formatDateISO(item.publishedAt)}
                              className="text-xs text-muted-foreground"
                            >
                              {formatDate(item.publishedAt, locale)}
                            </time>
                            <h3 className="line-clamp-3 text-sm font-semibold leading-tight hover:underline">
                              {item.title}
                            </h3>
                            <p className="line-clamp-3 text-xs text-muted-foreground">
                              {item.description}
                            </p>
                          </div>
                        </Card>
                      </Link>
                    </div>
                  </CarouselItem>
                )
              })}
            </CarouselContent>
          </div>

          <div
            className="mt-4 flex flex-wrap items-center justify-center gap-2"
            role="tablist"
            aria-label="Carousel slides"
          >
            {items.map((_, i) => (
              <button
                key={i}
                type="button"
                role="tab"
                aria-selected={i === selectedSnap}
                aria-label={`${i + 1}`}
                className={cn(
                  "size-2 rounded-full transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand",
                  i === selectedSnap
                    ? "bg-brand w-6 transition-all duration-300"
                    : "bg-muted-foreground/35 hover:bg-muted-foreground/55"
                )}
                onClick={() => api?.scrollTo(i)}
              />
            ))}
          </div>
        </Carousel>
      </div>
    </section>
  )
}
