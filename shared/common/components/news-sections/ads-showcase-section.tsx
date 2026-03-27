"use client"

import * as React from "react"
import Autoplay from "embla-carousel-autoplay"
import { ExternalLink } from "lucide-react"
import { usePublicAdsQuery } from "@/features/ads/model/public-ads-query"
import { toAbsoluteExternalHref } from "@/features/ads/lib/external-href"
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/shared/common/components/ui/carousel"
import { Card } from "@/shared/common/components/ui/card"
import { Button } from "@/shared/common/components/ui/button"

function detectMediaKind(src?: string): "video" | "image" {
  const value = src?.toLowerCase() ?? ""
  if (/\.(mp4|webm|ogg|mov)(\?|#|$)/.test(value)) return "video"
  return "image"
}

export default function AdsShowcaseSection() {
  const { data: ads = [] } = usePublicAdsQuery()
  const autoplay = React.useRef(Autoplay({ delay: 4200, stopOnInteraction: true }))

  const activeItems = React.useMemo(() => ads.filter((item) => item.active), [ads])
  if (activeItems.length === 0) return null

  return (
    <section className="my-5 w-full px-4 md:px-6">
      <div className="rounded-xl border bg-muted/20 p-3 md:p-4">
        <div className="mb-3 flex items-center justify-between gap-3 border-b pb-2">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">Sponsored</h2>
        </div>

        <Carousel
          plugins={[autoplay.current]}
          opts={{ align: "start", loop: true }}
          className="w-full"
          onMouseEnter={autoplay.current.stop}
          onMouseLeave={autoplay.current.reset}
        >
          <div className="mb-2 hidden items-center justify-end gap-2 md:flex">
            <CarouselPrevious className="static size-8 translate-x-0 translate-y-0" />
            <CarouselNext className="static size-8 translate-x-0 translate-y-0" />
          </div>
          <CarouselContent>
            {activeItems.map((ad) => {
              const media = Array.isArray(ad.media) ? ad.media[0] : ad.media
              const mediaKind = detectMediaKind(media)
              const adHref = toAbsoluteExternalHref(ad.adUrl)

              return (
                <CarouselItem key={ad._id} className="basis-full md:basis-1/2 xl:basis-1/3">
                  <Card className="group h-full overflow-hidden rounded-lg p-0">
                    <div className="relative aspect-video w-full bg-muted">
                      {media ? (
                        mediaKind === "video" ? (
                          <video
                            src={media}
                            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
                            autoPlay
                            muted
                            loop
                            playsInline
                          />
                        ) : (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={media}
                            alt={ad.title ?? "Ad"}
                            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
                          />
                        )
                      ) : null}
                    </div>
                    <div className="space-y-2 p-3">
                      <p className="line-clamp-1 text-xs text-muted-foreground">{ad.siteName || "Sponsored"}</p>
                      <p className="line-clamp-2 text-sm font-medium">{ad.title || "Reklama"}</p>
                      {adHref ? (
                        <Button asChild variant="outline" size="sm" className="h-8 gap-1.5 rounded-md">
                          <a href={adHref} target="_blank" rel="noopener noreferrer sponsored nofollow">
                            O&apos;tish
                            <ExternalLink className="size-3.5" />
                          </a>
                        </Button>
                      ) : null}
                    </div>
                  </Card>
                </CarouselItem>
              )
            })}
          </CarouselContent>
        </Carousel>
      </div>
    </section>
  )
}
