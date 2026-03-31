"use client"

import * as React from "react"
import Image from "next/image"
import Autoplay from "embla-carousel-autoplay"
import { useLocale } from "next-intl"
import { Link } from "@/i18n/navigation"
import { ChevronRight, ExternalLink, Play } from "lucide-react"
import { getNewsListForLocale, type RawNewsItem } from "@/features/news/model"
import type { AppLocale } from "@/shared/common/lib/locale-api"
import { usePublicNewsQuery } from "@/features/news/model/public-news-query"
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
  type CarouselApi,
} from "@/shared/common/components/ui/carousel"
import { cn } from "@/shared/common/lib/utils"

type AdNewsSectionProps = {
  initialNews?: RawNewsItem[]
}

function hasRenderableMedia(item: RawNewsItem): boolean {
  const hasImage = Array.isArray(item.images) && item.images.some((src) => typeof src === "string" && src.trim() !== "")
  const hasVideo = typeof item.videoUrl === "string" && item.videoUrl.trim() !== ""
  return hasImage || hasVideo
}

function getSafeSrc(raw?: string): string {
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

function getVideoSrc(raw?: string): string {
  if (!raw?.trim()) return ""
  if (raw.startsWith("http://") || raw.startsWith("https://") || raw.startsWith("/")) return raw
  return `/${raw}`
}

export default function AdNewsSection({ initialNews }: AdNewsSectionProps) {
  const locale = useLocale() as AppLocale
  const { data: qNews = [] } = usePublicNewsQuery()
  const publicNews = initialNews ?? qNews
  const autoplay = React.useRef(
    Autoplay({
      delay: 4500,
      stopOnInteraction: true,
    })
  )

  const items = React.useMemo(() => {
    const raw = [...publicNews]
      .filter((item) => item.ad === true)
      .filter(hasRenderableMedia)
      .sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime())
      .slice(0, 24)
    return getNewsListForLocale(raw, locale)
  }, [locale, publicNews])

  const labels = React.useMemo(() => {
    const byLocale: Record<AppLocale, { title: string; cta: string }> = {
      uz: { title: "E'lonlar", cta: "Hamkorlik qilish" },
      uzb: { title: "Эълонлар", cta: "Ҳамкорлик қилиш" },
      ru: { title: "Объявления", cta: "Сотрудничать" },
      en: { title: "Advertisements", cta: "Partner with us" },
    }
    return byLocale[locale]
  }, [locale])

  if (items.length === 0) return null

  const MOBILE_DELAY_MS = 4500

  const [api, setApi] = React.useState<CarouselApi | null>(null)
  const [selected, setSelected] = React.useState(0)
  const snaps = React.useMemo(() => api?.scrollSnapList() ?? [], [api])
  const [progressPct, setProgressPct] = React.useState(0)
  const intervalRef = React.useRef<number | null>(null)
  const startRef = React.useRef<number>(0)
  const pausedAtRef = React.useRef<number | null>(null)

  React.useEffect(() => {
    if (!api) return
    const onSelect = () => setSelected(api.selectedScrollSnap())
    onSelect()
    api.on("select", onSelect)
    api.on("reInit", onSelect)
    return () => {
      api.off("select", onSelect)
    }
  }, [api])

  // Mobile progress bar: 0 → 100, then scrollNext (loop)
  React.useEffect(() => {
    if (!api) return
    if (snaps.length <= 1) return

    const stop = () => {
      if (intervalRef.current != null) window.clearInterval(intervalRef.current)
      intervalRef.current = null
    }

    stop()
    setProgressPct(0)
    startRef.current = Date.now()
    pausedAtRef.current = null

    intervalRef.current = window.setInterval(() => {
      const elapsed = Date.now() - startRef.current
      const pct = Math.min(100, (elapsed / MOBILE_DELAY_MS) * 100)
      setProgressPct(pct)
      if (pct >= 100) {
        stop()
        api.scrollNext()
      }
    }, 50)

    const onVisibility = () => {
      if (document.hidden) {
        // pause: remember when we stopped
        pausedAtRef.current = Date.now()
        stop()
        return
      }
      // resume: shift start time by paused duration
      if (pausedAtRef.current != null) {
        const pausedFor = Date.now() - pausedAtRef.current
        startRef.current += pausedFor
      }
      pausedAtRef.current = null
      stop()
      intervalRef.current = window.setInterval(() => {
        const elapsed = Date.now() - startRef.current
        const pct = Math.min(100, (elapsed / MOBILE_DELAY_MS) * 100)
        setProgressPct(pct)
        if (pct >= 100) {
          stop()
          api.scrollNext()
        }
      }, 50)
    }
    document.addEventListener("visibilitychange", onVisibility)

    return () => {
      document.removeEventListener("visibilitychange", onVisibility)
      stop()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [api, selected, snaps.length])

  return (
    <section className="px-4 py-4 md:px-6">
      {/* Mobile layout: gradient + progress segments */}
      <div className="md:hidden overflow-hidden rounded-xl bg-linear-to-b from-brand via-brand/85 to-black text-white">
        {/* autoplay segmented progress bar (one segment per slide) */}
        {snaps.length > 1 ? (
          <div className="mt-3 flex items-center gap-2 px-3 pt-2">
            <span className="flex items-center justify-center size-4 bg-white rounded-full">
              <span className="size-2 bg-brand rounded-full"></span>
            </span>
            {snaps.map((_, i) => {
              const fill =
                i < selected ? 100 : i === selected ? progressPct : 0
              return (
                <div
                  key={i}
                  className="h-1 flex-1 rounded-full bg-white/25 overflow-hidden"
                  aria-hidden
                >
                  <div
                    className={cn(
                      "h-full rounded-full bg-white transition-[width] duration-100",
                      i < selected ? "opacity-95" : "opacity-100"
                    )}
                    style={{ width: `${fill}%` }}
                  />
                </div>
              )
            })}
          </div>
        ) : null}
        <div className="px-4 pt-4">
          <div className="flex items-center justify-between gap-3">
            <Link href="/announcements" className="flex items-center gap-2 font-extrabold text-2xl tracking-tight">
              <span>{labels.title}</span>
              <ExternalLink className="size-5 opacity-90 hidden md:block" />
            </Link>
            <Link href="/partners" className="hidden md:inline-flex items-center gap-1 text-sm font-semibold opacity-95 hover:opacity-100">
              <span>{labels.cta}</span>
              <ChevronRight className="size-4" />
            </Link>
          </div>


        </div>

        <div className="px-4 pb-5 pt-4">
          <Carousel
            setApi={(a) => setApi(a)}
            opts={{ align: "start", loop: true }}
            className="w-full"
          >
            <CarouselContent className="-ml-4">
              {items.map((item) => {
                const imageSrc = getSafeSrc(item.images?.[0])
                const videoSrc = getVideoSrc(item.videoUrl)
                const hasImage = Boolean(imageSrc)
                const hasVideo = Boolean(videoSrc)
                const hasAudio = Boolean(item.audioUrl && item.audioUrl.trim())
                return (
                  <CarouselItem key={item.slug} className="pl-4 basis-full">
                    <article className="overflow-hidden">
                      <Link href={`/news/${item.slug}`} className="flex flex-col h-full justify-between">
                        <div className="pb-4 md:hidden items-stretch">
                          <h3 className="line-clamp-4 text-lg font-semibold leading-snug">
                            {item.title}
                          </h3>
                        </div>
                        <div className="relative aspect-video w-full rounded-md">
                          {hasImage ? (
                            <Image src={imageSrc} alt={item.title} fill className="object-cover rounded-md" />
                          ) : hasVideo ? (
                            <video
                              src={videoSrc}
                              className="h-full w-full object-cover rounded-md"
                              muted
                              autoPlay
                              loop
                              playsInline
                            />
                          ) : null}
                          {hasVideo || hasAudio ? (
                            <span className="pointer-events-none absolute bottom-3 left-3 z-10 inline-flex size-10 items-center justify-center rounded-full bg-white/15 text-white shadow-md ring-1 ring-white/20 backdrop-blur">
                              <Play className="size-5 fill-current" />
                            </span>
                          ) : null}
                        </div>
                        <div className="py-4 hidden md:block">
                          <h3 className="line-clamp-3 text-lg font-semibold leading-snug">
                            {item.title}
                          </h3>
                        </div>
                      </Link>
                    </article>
                  </CarouselItem>
                )
              })}
            </CarouselContent>
          </Carousel>
        </div>
      </div>

      {/* Desktop layout */}
      <div className="hidden md:block rounded-sm bg-background p-3 md:p-4">
        <Carousel
          plugins={[autoplay.current]}
          opts={{ align: "start", loop: true }}
          onMouseEnter={autoplay.current.stop}
          onMouseLeave={autoplay.current.reset}
          className="w-full"
        >
          <div className="mb-3 flex items-center justify-between gap-2 border-b pb-2">
            <div className="flex items-center gap-4">
              <Link href="/announcements" className="text-base font-bold md:text-3xl flex gap-2 items-center">
                <span>{labels.title}</span>
                <ExternalLink className="size-4" />
              </Link>
            </div>
            <div className="flex items-center gap-2">
              <Link
                href="/partners"
                className="inline-flex h-9 items-center justify-center rounded-sm px-3 text-sm font-medium hover:underline gap-2"
              >
                <span>{labels.cta}</span>
                <ChevronRight className="bg-foreground text-background rounded-full p-1 size-5" />
              </Link>
              <CarouselPrevious className="static hidden translate-x-0 translate-y-0 lg:inline-flex rounded-full" />
              <CarouselNext className="static hidden translate-x-0 translate-y-0 rounded-full lg:inline-flex" />
            </div>
          </div>
          <CarouselContent className="-ml-3">
            {items.map((item) => {
              const imageSrc = getSafeSrc(item.images?.[0])
              const videoSrc = getVideoSrc(item.videoUrl)
              const hasImage = Boolean(imageSrc)
              const hasVideo = Boolean(videoSrc)
              const hasAudio = Boolean(item.audioUrl && item.audioUrl.trim())
              return (
                <CarouselItem
                  key={item.slug}
                  className="pl-3 basis-full sm:basis-1/2 lg:basis-1/4"
                >
                  <article className="group overflow-hidden rounded-sm border bg-background">
                    <Link href={`/news/${item.slug}`} className="block">
                      <div className="relative aspect-video w-full bg-muted">
                        {hasImage ? (
                          <Image src={imageSrc} alt={item.title} fill className="object-cover" />
                        ) : hasVideo ? (
                          <video
                            src={videoSrc}
                            className="h-full w-full object-cover"
                            muted
                            autoPlay
                            loop
                            playsInline
                          />
                        ) : null}
                        {hasVideo || hasAudio ? (
                          <span className="pointer-events-none absolute bottom-2 left-2 z-10 inline-flex size-8 items-center justify-center rounded-full bg-brand text-white shadow-md ring-1 ring-black/5">
                            <Play className="size-4 fill-current" />
                          </span>
                        ) : null}
                      </div>
                      <div className="bg-brand dark:bg-brand/40 text-white p-3 transition-colors duration-200 group-hover:bg-brand/80 dark:group-hover:bg-brand/70 min-h-[130px]">
                        <h3 className="line-clamp-4 font-bold leading-snug md:text-base">
                          {item.title}
                        </h3>
                      </div>
                    </Link>
                  </article>
                </CarouselItem>
              )
            })}
          </CarouselContent>
        </Carousel>
      </div>
    </section>
  )
}
