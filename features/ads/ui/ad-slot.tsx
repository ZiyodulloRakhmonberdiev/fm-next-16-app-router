"use client"

import { useEffect, useMemo, useState } from "react"
import { MoreVertical } from "lucide-react"
import { cn } from "@/shared/common/lib/utils"
import { usePublicAdsQuery } from "@/shared/common/lib/public-ads-query"
import { Button } from "@/shared/common/components/ui/button"
import { usePublicSiteSettingsQuery } from "@/shared/common/lib/public-site-settings-query"
import { useIsMobile } from "@/shared/hooks/use-mobile"
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
  const [mediaIndex, setMediaIndex] = useState(0)
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
  const currentMedia = effectiveMediaList[mediaIndex] ?? effectiveMediaList[0] ?? ""

  const adsExplicitlyDisabled = settings?.clientDelivery?.models?.ads === false

  useEffect(() => {
    if (!ads.length) return
    const safeIndex = adIndex >= ads.length ? 0 : adIndex
    if (safeIndex !== adIndex) setAdIndex(safeIndex)
  }, [ads, adIndex])

  useEffect(() => {
    if (!ads.length || ads.length === 1) return
    const seconds = Math.max(3, Number(ad?.displaySeconds ?? 12))
    const timer = window.setTimeout(() => {
      setAdIndex((prev) => (prev + 1) % ads.length)
    }, seconds * 1000)
    return () => window.clearTimeout(timer)
  }, [ads, adIndex, ad?.displaySeconds])

  useEffect(() => {
    setMediaIndex(0)
  }, [ad?._id])

  useEffect(() => {
    if (effectiveMediaList.length > 0 && mediaIndex >= effectiveMediaList.length) {
      setMediaIndex(0)
    }
  }, [effectiveMediaList.length, mediaIndex])

  // Bir reklama ichida ko'p media: displaySeconds media lar orasida teng taqsimlanadi
  useEffect(() => {
    if (effectiveMediaList.length <= 1) return
    const totalSeconds = Math.max(3, Number(ad?.displaySeconds ?? 12))
    const perMediaMs = (totalSeconds * 1000) / effectiveMediaList.length
    const timer = window.setTimeout(() => {
      setMediaIndex((prev) => (prev + 1) % effectiveMediaList.length)
    }, perMediaMs)
    return () => window.clearTimeout(timer)
  }, [ad?._id, ad?.displaySeconds, mediaIndex, effectiveMediaList.length])

  if (adsExplicitlyDisabled) return null
  const shouldShowPlaceholder = ads.length < 1 || allHidden
  if (shouldShowPlaceholder) {
    return <AdSlotPlaceholder />
  }

  const mediaKind = detectMediaKind(currentMedia)
  const openPanel = () => {
    setPanelOpen(true)
  }
  const closePanel = () => {
    setPanelOpen(false)
  }
  const handleHideSuccess = () => {
    adsHiddenUntilRefresh = true
    setAllHidden(true)
  }

  return (
    <div className="relative w-full">
      <div className={cn("relative w-full overflow-hidden rounded-xl border bg-card shadow-sm aspect-video max-h-[120px] md:max-h-[140px] lg:max-h-[200px]")}>
        <span className="absolute left-2 top-2 z-10 rounded bg-black/60 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider text-white/95" aria-hidden>
          Reklama
        </span>
        {panelOpen ? (
          <AdSlotHide
            ad={ad}
            placement={placement}
            onClose={closePanel}
            onHideSuccess={handleHideSuccess}
          />
        ) : ad.type === "image" ? (
          <div className="relative h-full w-full bg-muted">
            {currentMedia ? (
              mediaKind === "video" ? (
                <video key={currentMedia} src={currentMedia} className="absolute inset-0 h-full w-full object-cover"
 style={{ objectPosition: "center center" }} autoPlay muted loop playsInline />
              ) : (
                <img key={currentMedia} src={currentMedia} alt={ad.title ?? "Reklama"} className="absolute inset-0 h-full w-full object-cover"
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
            {ad.adUrl ? (
              <a href={ad.adUrl} target="_blank" rel="noopener noreferrer sponsored nofollow" className="absolute inset-0" aria-label={ad.title ?? "Reklama"} />
            ) : null}
          </div>
        ) : (
          <>
            {/* Mobil: faqat media (content yashirin) */}
            <div className="relative h-full w-full bg-muted md:hidden">
              {currentMedia ? (
                mediaKind === "video" ? (
                  <video key={currentMedia} src={currentMedia} className="absolute inset-0 h-full w-full object-cover"
 style={{ objectPosition: "center center" }} autoPlay muted loop playsInline />
                ) : (
                  <img key={currentMedia} src={currentMedia} alt={ad.title ?? "Reklama"} className="absolute inset-0 h-full w-full object-cover"
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
              {ad.adUrl ? (
                <a href={ad.adUrl} target="_blank" rel="noopener noreferrer sponsored nofollow" className="absolute inset-0" aria-label={ad.title ?? "Reklama"} />
              ) : null}
            </div>
            {/* Desktop: media + content */}
            <div className="hidden h-full grid-cols-[42%_58%] md:grid">
            <div className="relative h-full bg-muted">
              {currentMedia ? (
                ad.adUrl ? (
                  <a href={ad.adUrl} target="_blank" rel="noopener noreferrer sponsored nofollow" className="block h-full w-full">
                    {mediaKind === "video" ? (
                      <video key={currentMedia} src={currentMedia} className="h-full w-full object-cover"
 style={{ objectPosition: "center center" }} autoPlay muted loop playsInline />
                    ) : (
                      <img key={currentMedia} src={currentMedia} alt={ad.title ?? "Reklama"} className="h-full w-full object-cover"
 style={{ objectPosition: "center center" }} />
                    )}
                  </a>
                ) : mediaKind === "video" ? (
                  <video key={currentMedia} src={currentMedia} className="h-full w-full object-cover"
 style={{ objectPosition: "center center" }} autoPlay muted loop playsInline />
                ) : (
                  <img key={currentMedia} src={currentMedia} alt={ad.title ?? "Reklama"} className="h-full w-full object-cover"
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
                  {ad.adUrl ? (
                    <a href={ad.adUrl} target="_blank" rel="noopener noreferrer sponsored nofollow" className="block hover:underline">
                      <h3 className="line-clamp-2 text-lg font-semibold leading-tight">{ad.title}</h3>
                    </a>
                  ) : (
                    <h3 className="line-clamp-2 text-lg font-semibold leading-tight">{ad.title}</h3>
                  )}
                  {ad.description ? (
                    <div className="hidden md:block">
                      {ad.adUrl ? (
                        <a href={ad.adUrl} target="_blank" rel="noopener noreferrer sponsored nofollow" className="block hover:underline">
                          <p className="line-clamp-2 text-sm text-muted-foreground">{ad.description}</p>
                        </a>
                      ) : (
                        <p className="line-clamp-2 text-sm text-muted-foreground">{ad.description}</p>
                      )}
                    </div>
                  ) : null}
                </div>
                {ad.links?.length ? (
                  <div className="hidden flex-wrap gap-x-4 gap-y-1 text-sm text-foreground/80 md:flex">
                    {ad.links.map((item, index) => (
                      <a key={`${item.href}-${index}`} href={item.href} target="_blank" rel="noopener noreferrer sponsored nofollow" className="hover:underline">
                        {item.label}
                      </a>
                    ))}
                  </div>
                ) : null}
              </div>
            </div>
          </div>
          </>
        )}
      </div>
    </div>
  )
}
