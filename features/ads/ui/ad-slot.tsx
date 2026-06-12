"use client"

import { useEffect, useMemo, useState } from "react"
import { MoreVertical } from "lucide-react"
import { cn } from "@/shared/common/lib/utils"
import { usePublicAdsQuery } from "@/features/ads/model/public-ads-query"
import { Button } from "@/shared/common/components/ui/button"
import { usePublicSiteSettingsQuery } from "@/shared/server/public-site-settings-query"
import { useIsMobile } from "@/shared/hooks/use-mobile"
import { toAbsoluteExternalHref } from "../lib/external-href"
import { AdSlotPlaceholder } from "./ad-slot-placeholder"
import { AdSlotHide } from "./ad-slot-hide"

type Props = {
  placement: "header_top_full" | "sidebar_widget" | "home_bottom_full" | "article_bottom_full"
}

function detectMediaKind(src?: string): "video" | "image" {
  const value = src?.toLowerCase() ?? ""
  if (/\.(mp4|webm|ogg|mov)(\?|#|$)/.test(value)) return "video"
  return "image"
}

let adsHiddenUntilRefresh = false

export function AdSlot({ placement }: Props) {
  const { data: settings } = usePublicSiteSettingsQuery()
  const { data: ads = [] } = usePublicAdsQuery(placement)
  const [adIndex, setAdIndex] = useState(0)
  const [allHidden, setAllHidden] = useState(adsHiddenUntilRefresh)
  const [panelOpen, setPanelOpen] = useState(false)
  const isMobile = useIsMobile()
  const ad = useMemo(() => ads[adIndex] ?? null, [ads, adIndex])
  const mediaList = useMemo(() => {
    if (!ad?.media) return []
    return Array.isArray(ad.media) ? ad.media : [ad.media]
  }, [ad?.media])
  const mediaMobileList = useMemo(() => {
    if (!ad?.mediaMobile) return []
    return Array.isArray(ad.mediaMobile) ? ad.mediaMobile : [ad.mediaMobile]
  }, [ad?.mediaMobile])
  const effectiveMediaList = isMobile && mediaMobileList.length > 0 ? mediaMobileList : mediaList
  const currentMedia = effectiveMediaList[0] ?? ""

  const adsExplicitlyDisabled = settings?.clientDelivery?.models?.ads === false

  useEffect(() => {
    if (!ads.length) return
    const safeIndex = adIndex >= ads.length ? 0 : adIndex
    if (safeIndex !== adIndex) setAdIndex(safeIndex)
  }, [ads, adIndex])

  useEffect(() => {
    if (!ads.length) return
    const key = `fm:ad-slot-index:${placement}`
    const prevRaw = window.sessionStorage.getItem(key)
    const prevIndex = Number.isFinite(Number(prevRaw)) ? Number(prevRaw) : -1
    const nextIndex = (prevIndex + 1 + ads.length) % ads.length
    window.sessionStorage.setItem(key, String(nextIndex))
    setAdIndex(nextIndex)
  }, [ads, placement])

  // Hozircha media carousel ham o'chirilgan:
  // bitta ad ichida faqat birinchi media ko'rsatiladi.

  if (adsExplicitlyDisabled) return null
  if (allHidden) return null
  if (ads.length < 1) {
    return (
      <div data-ad-slot className="relative w-full py-2">
        <AdSlotPlaceholder placement={placement} />
      </div>
    )
  }

  const mediaKind = detectMediaKind(currentMedia)
  const openPanel = () => {
    setPanelOpen(true)
  }
  const closePanel = () => {
    setPanelOpen(false)
  }
  const handleAdSectionClosed = () => {
    adsHiddenUntilRefresh = true
    setAllHidden(true)
  }

  const adHref = toAbsoluteExternalHref(ad.adUrl)
  const hideExtraLinks =
    placement === "sidebar_widget" || placement === "article_bottom_full"
  const isArticleBottomFull = placement === "article_bottom_full"
  const primaryLink = ad.links?.[0]
  const primaryLinkHref = toAbsoluteExternalHref(primaryLink?.href)

  return (
    <div
      data-ad-slot
      className={cn(
        "relative w-full md:py-2",
        isArticleBottomFull && "w-screen max-w-none md:w-full"
      )}
    >
      <div
        className={cn(
          "relative w-full overflow-hidden",
          isArticleBottomFull
            ? "h-screen min-h-screen md:h-auto md:min-h-0 md:aspect-video"
            : "aspect-video max-h-[185px] lg:max-h-[220px]"
        )}
      >
         <span className="hidden md:block absolute left-2 top-3 z-10 rounded px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider text-white/95 bg-black/90" aria-hidden>
          Reklama
        </span> 
        {panelOpen ? (
          <AdSlotHide
            ad={ad}
            placement={placement}
            onClose={closePanel}
            onAdSectionClosed={handleAdSectionClosed}
          />
        ) : isArticleBottomFull ? (
          <div className="relative h-full w-full">
            {currentMedia ? (
              mediaKind === "video" ? (
                <video
                  key={currentMedia}
                  src={currentMedia}
                  className="absolute inset-0 h-full w-full object-cover md:object-contain"
                  style={{ objectPosition: "center center" }}
                  autoPlay
                  muted
                  loop
                  playsInline
                />
              ) : (
                <img
                  key={currentMedia}
                  src={currentMedia}
                  alt={ad.title ?? "Reklama"}
                  className="absolute inset-0 h-full w-full object-cover md:object-contain"
                  style={{ objectPosition: "center center" }}
                />
              )
            ) : null}

            <Button
              size="icon"
              variant="secondary"
              className="absolute right-2 top-3 z-20 size-7"
              onClick={openPanel}
              aria-label="Reklama menyusi"
            >
              <MoreVertical className="size-4" />
            </Button>

            {/* Mobile: article_bottom_full uchun faqat links[0] absolute CTA */}
            {primaryLinkHref && primaryLink?.label ? (
              <div className="pointer-events-none absolute inset-x-0 bottom-24 flex justify-center md:hidden">
                <a
                  href={primaryLinkHref}
                  target="_blank"
                  rel="noopener noreferrer sponsored nofollow"
                  className="pointer-events-auto inline-flex items-center justify-center bg-white/95 px-6 py-3 text-sm font-semibold text-black shadow-xl"
                  style={{ animation: "ad-cta-pulse 2s ease-in-out infinite" }}
                >
                  {primaryLink.label}
                </a>
              </div>
            ) : null}

            {adHref ? (
              <a
                href={adHref}
                target="_blank"
                rel="noopener noreferrer sponsored nofollow"
                className="absolute inset-0 hidden md:block"
                aria-label={ad.title ?? "Reklama"}
              />
            ) : null}
          </div>
        ) : ad.type === "image" ? (
          <div className="relative h-full w-full mb-auto z-10">
            {currentMedia ? (
              mediaKind === "video" ? (
                <video key={currentMedia} src={currentMedia} className="absolute inset-0 h-full w-full object-contain"
                  style={{ objectPosition: "center center" }} autoPlay muted loop playsInline />
              ) : (
                <img key={currentMedia} src={currentMedia} alt={ad.title ?? "Reklama"} className=" h-full w-full object-fill md:object-fill"
                  style={{ objectPosition: "center center" }} />
              )
            ) : null}
            <Button
              size="icon"
              variant="secondary"
              className="absolute right-2 top-3 z-10 size-7"
              onClick={openPanel}
              aria-label="Reklama menyusi"
            >
              <MoreVertical className="size-4" />
            </Button>
            {adHref ? (
              <a href={adHref} target="_blank" rel="noopener noreferrer sponsored nofollow" className="absolute inset-0" aria-label={ad.title ?? "Reklama"} />
            ) : null}
          </div>
        ) : (
          <>
            {/* Mobil: faqat media (content yashirin) */}
            <div className="relative h-full w-full md:hidden">
              {currentMedia ? (
                mediaKind === "video" ? (
                  <video key={currentMedia} src={currentMedia} className="absolute inset-0 h-full w-full object-contain"
                    style={{ objectPosition: "center center" }} autoPlay muted loop playsInline />
                ) : (
                  <img key={currentMedia} src={currentMedia} alt={ad.title ?? "Reklama"} className="object-cover"
                    style={{ objectPosition: "center center" }} />
                )
              ) : null}
              <Button
                size="icon"
                variant="secondary"
                className="absolute right-2 top-2 z-10 size-7"
                onClick={openPanel}
                aria-label="Reklama menyusi"
              >
                <MoreVertical className="size-4" />
              </Button>
              {adHref ? (
                <a href={adHref} target="_blank" rel="noopener noreferrer sponsored nofollow" className="absolute inset-0" aria-label={ad.title ?? "Reklama"} />
              ) : null}
            </div>
            {/* Desktop: media + content */}
            <div className="hidden h-full grid-cols-[42%_58%] md:grid">
              <div className="relative h-full bg-muted">
                {currentMedia ? (
                  adHref ? (
                    <a href={adHref} target="_blank" rel="noopener noreferrer sponsored nofollow" className="block h-full w-full">
                      {mediaKind === "video" ? (
                        <video key={currentMedia} src={currentMedia} className="h-full w-full object-contain"
                          style={{ objectPosition: "center center" }} autoPlay muted loop playsInline />
                      ) : (
                        <img key={currentMedia} src={currentMedia} alt={ad.title ?? "Reklama"} className="h-full w-full object-contain"
                          style={{ objectPosition: "center center" }} />
                      )}
                    </a>
                  ) : mediaKind === "video" ? (
                    <video key={currentMedia} src={currentMedia} className="h-full w-full object-contain"
                      style={{ objectPosition: "center center" }} autoPlay muted loop playsInline />
                  ) : (
                    <img key={currentMedia} src={currentMedia} alt={ad.title ?? "Reklama"} className="h-full w-full object-contain"
                      style={{ objectPosition: "center center" }} />
                  )
                ) : null}
              </div>
              <div className="flex h-full flex-col justify-between p-4">
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex min-w-0 items-center gap-2">
                      {ad.logo ? (
                        <img src={ad.logo} alt={ad.siteName} className="size-5 rounded-sm object-cover" />
                      ) : null}
                      <div className="min-w-0">
                        <p className="truncate text-xs font-medium text-foreground/80">{ad.siteName}</p>
                        <p className="text-[11px] text-muted-foreground">reklama</p>
                      </div>
                    </div>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="size-7 shrink-0"
                      onClick={openPanel}
                      aria-label="Reklama menyusi"
                    >
                      <MoreVertical className="size-4" />
                    </Button>
                  </div>
                  <div className="space-y-2">
                    {adHref ? (
                      <a href={adHref} target="_blank" rel="noopener noreferrer sponsored nofollow" className="block hover:underline">
                        <h3 className="line-clamp-2 text-lg font-semibold leading-tight">{ad.title}</h3>
                      </a>
                    ) : (
                      <h3 className="line-clamp-2 text-lg font-semibold leading-tight">{ad.title}</h3>
                    )}
                    {ad.description ? (
                      <div className="hidden md:block">
                        {adHref ? (
                          <a href={adHref} target="_blank" rel="noopener noreferrer sponsored nofollow" className="block hover:underline">
                            <p className="line-clamp-2 text-sm text-muted-foreground">{ad.description}</p>
                          </a>
                        ) : (
                          <p className="line-clamp-2 text-sm text-muted-foreground">{ad.description}</p>
                        )}
                      </div>
                    ) : null}
                  </div>
                  {!hideExtraLinks && ad.links?.length ? (
                    <div className="hidden flex-wrap gap-x-4 gap-y-1 text-sm text-foreground/80 md:flex">
                      {ad.links.map((item, index) => {
                        const href = toAbsoluteExternalHref(item.href)
                        if (!href) return null
                        return (
                          <a key={`${item.href}-${index}`} href={href} target="_blank" rel="noopener noreferrer sponsored nofollow" className="hover:underline">
                            <Button variant="secondary" size="sm" className="text-xs px-3 rounded-xs py-1.5 h-auto"><span>{item.label}</span></Button>
                          </a>
                        )
                      })}
                    </div>
                  ) : null}
                </div>
              </div>
            </div>
          </>
        )}
      </div>
      <style jsx>{`
        @keyframes ad-cta-pulse {
          0%,
          100% {
            transform: scale(1);
          }
          50% {
            transform: scale(1.08);
          }
        }
      `}</style>
    </div>
  )
}
