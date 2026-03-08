"use client"

import * as React from "react"
import { filterPublishedRawNews, getNewsListForLocale, type NewsItem, type RawNewsItem } from "@/features/news/model"
import { seedNews } from "@/scripts/seed-news"
import { Card } from "@/shared/common/components/ui/card"
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/shared/common/components/ui/carousel"
import { formatDate, formatDateISO } from "@/shared/common/lib/formatter"
import type { AppLocale } from "@/shared/common/lib/formatter"
import { Link } from "@/i18n/navigation"
import Image from "next/image"
import { useLocale, useTranslations } from "next-intl"
import { Play } from "lucide-react"
import { StayConnected } from "../molecules"

function isVideoNewsItem(item: RawNewsItem): boolean {
  const hasVideo = !!(item.videoSource && item.videoUrl)
  const hasImages = !!(item.images && item.images.length > 0)
  return item.type === "video" || (hasVideo && hasImages)
}

export default function CategoryVideo() {
  const locale = useLocale() as AppLocale

  const videoNews = React.useMemo(() => {
    const raw = filterPublishedRawNews([...seedNews.news])
      .filter(isVideoNewsItem)
      .sort(
        (a, b) =>
          new Date(b.publishedAt).getTime() -
          new Date(a.publishedAt).getTime()
      )
      .slice(0, 15)
    return getNewsListForLocale(raw, locale)
  }, [locale])

  const [featured, ...listItems] = videoNews

  if (videoNews.length === 0) return null
  const t = useTranslations("common")
  return (
    <section className="w-full space-y-4 px-4 md:px-6 pt-4">
      <div className="py-4 border-t-2 mt-4 border-border grid w-full grid-cols-1 gap-4 md:grid-cols-4">
        <Carousel
          opts={{ align: "start", loop: false, axis: "y" }}
          orientation="vertical"
          className="flex h-[500px] w-full min-w-0 flex-col"
        >
          <div className="flex items-center justify-between gap-2">
            <h2 className="text-lg font-semibold mr-2">Video news</h2>
            <div className="flex justify-center gap-2 mb-1 py-1">
              <CarouselPrevious
                className="static size-9 translate-y-0 rounded-sm"
                variant="outline"
              />
              <CarouselNext
                className="static size-9 translate-y-0 rounded-sm"
                variant="outline"
              />
            </div>
            <Link href="/news/video" className="text-sm font-medium text-brand hover:underline">{t("view_all")} {">>"}</Link>
          </div>
          <div className="min-h-0 flex-1 overflow-hidden">
            <CarouselContent className="-mt-3 h-full">
              {listItems.map((item) => (
                <CarouselItem key={item.slug} className="h-[95px] shrink-0 basis-auto pt-3">
                  <Link href={`/news/${item.slug}`} className="block h-full">
                    <Card className="h-full overflow-hidden rounded-sm border-none p-0 shadow-none transition-shadow hover:shadow-md">
                      <div className="flex h-full gap-3 p-2">
                        <div className="relative h-20 w-28 shrink-0 overflow-hidden rounded-sm">
                          <Image
                            src={item.images[0]}
                            alt={item.title}
                            fill
                            className="object-cover"
                          />
                          <span className="absolute inset-0 flex items-center justify-center bg-black/40">
                            <span className="flex size-10 items-center justify-center rounded-full bg-background text-primary">
                              <Play className="size-5 fill-current" />
                            </span>
                          </span>
                        </div>
                        <div className="flex min-w-0 flex-1 flex-col justify-center gap-1">
                          <time
                            dateTime={formatDateISO(item.publishedAt)}
                            className="text-xs text-muted-foreground"
                          >
                            {formatDate(item.publishedAt, locale)}
                          </time>
                          <span className="line-clamp-2 text-sm font-medium leading-tight">
                            {item.title}
                          </span>
                        </div>
                      </div>
                    </Card>
                  </Link>
                </CarouselItem>
              ))}
            </CarouselContent>
          </div>
        </Carousel>

        {featured && (
          <Link href={`/news/${featured.slug}`} className="block h-full md:col-span-2">
            <Card className="relative h-full min-h-[320px] overflow-hidden rounded-sm border-none p-0 shadow-none transition-shadow hover:shadow-md md:min-h-[420px]">
              <div className="relative aspect-video w-full md:aspect-auto md:h-full md:min-h-[420px]">
                <Image
                  src={featured.images[0]}
                  alt={featured.title}
                  fill
                  className="object-cover"
                />
                <span className="absolute inset-0 flex items-center justify-center bg-black/30">
                  <span className="flex size-16 items-center justify-center rounded-full bg-background text-primary md:size-20">
                    <Play className="size-8 fill-current md:size-10" />
                  </span>
                </span>
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent p-4">
                  <time
                    dateTime={formatDateISO(featured.publishedAt)}
                    className="text-xs text-white/90"
                  >
                    {formatDate(featured.publishedAt, locale)}
                  </time>
                  <h3 className="mt-1 line-clamp-2 text-base font-semibold leading-tight text-white md:text-lg">
                    {featured.title}
                  </h3>
                </div>
              </div>
            </Card>
          </Link>
        )}
        <StayConnected />
      </div>
    </section>
  )
}
