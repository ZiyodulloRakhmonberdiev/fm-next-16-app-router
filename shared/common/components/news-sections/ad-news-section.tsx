"use client"

import * as React from "react"
import Image from "next/image"
import Autoplay from "embla-carousel-autoplay"
import { useLocale } from "next-intl"
import { Link } from "@/i18n/navigation"
import { Play } from "lucide-react"
import { getNewsListForLocale, type RawNewsItem } from "@/features/news/model"
import type { AppLocale } from "@/shared/common/lib/locale-api"
import { usePublicNewsQuery } from "@/features/news/model/public-news-query"
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/shared/common/components/ui/carousel"

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
      uz: { title: "Reklama yangiliklar", cta: "Hamkorlik qilish" },
      uzb: { title: "Реклама янгиликлар", cta: "Ҳамкорлик қилиш" },
      ru: { title: "Рекламные новости", cta: "Сотрудничать" },
      en: { title: "Sponsored News", cta: "Partner with us" },
    }
    return byLocale[locale]
  }, [locale])

  if (items.length === 0) return null

  return (
    <section className="px-4 py-4 md:px-6">
      <div className="rounded-sm border bg-background p-3 md:p-4">
        <Carousel
          plugins={[autoplay.current]}
          opts={{ align: "start", loop: true }}
          onMouseEnter={autoplay.current.stop}
          onMouseLeave={autoplay.current.reset}
          className="w-full"
        >
          <div className="mb-3 flex items-center justify-between gap-2 border-b pb-2">
            <h2 className="text-base font-semibold md:text-lg">{labels.title}</h2>
            <div className="flex items-center gap-2">
              <Link
                href="/announcements"
                className="inline-flex h-9 items-center justify-center rounded-sm border px-3 text-sm font-medium hover:bg-muted"
              >
                {labels.cta}
              </Link>
              <CarouselPrevious className="static hidden translate-x-0 translate-y-0 rounded-sm lg:inline-flex" />
              <CarouselNext className="static hidden translate-x-0 translate-y-0 rounded-sm lg:inline-flex" />
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
                      <div className="bg-primary/10 p-3 transition-colors duration-200 group-hover:bg-primary/20">
                        <h3 className="line-clamp-2 text-sm font-medium leading-snug md:text-base">
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
