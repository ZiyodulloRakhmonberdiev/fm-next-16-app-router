"use client"

import { useEffect, useMemo, useState } from "react"
import { usePublicAdsQuery } from "@/shared/common/lib/public-ads-query"
import { Button } from "@/shared/common/components/ui/button"
import { ExternalLink, MoreVertical, XIcon } from "lucide-react"
import { toast } from "sonner"
import { cn } from "@/shared/common/lib/utils"
import { Link } from "@/i18n/navigation"

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
  const { data: ads = [] } = usePublicAdsQuery(placement)
  const [adIndex, setAdIndex] = useState(0)
  const [allHidden, setAllHidden] = useState(adsHiddenUntilRefresh)
  const [panelOpen, setPanelOpen] = useState(false)
  const [reasonMode, setReasonMode] = useState<null | "hide" | "report">(null)
  const ad = useMemo(() => ads[adIndex] ?? null, [ads, adIndex])

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

  if (!ad || allHidden) return null

  async function sendFeedback(action: "hide" | "report", reason: string) {
    const res = await fetch("/api/ads/feedback", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ adId: ad._id, action, reason, placement }),
    })
    if (!res.ok) {
      toast.error("So'rov yuborilmadi")
      return
    }
    toast.success("Rahmat, arizangiz yuborildi. Uni ko'rib chiqamiz.")
    if (action === "hide") {
      adsHiddenUntilRefresh = true
      setAllHidden(true)
    }
    setReasonMode(null)
    setPanelOpen(false)
  }

  function copyLink() {
    if (!ad.adUrl) return
    void navigator.clipboard.writeText(ad.adUrl)
    toast.success("Reklama havolasi nusxalandi")
    setPanelOpen(false)
  }

  const mediaKind = detectMediaKind(ad.media)
  const reasons =
    reasonMode === "report"
      ? ["Siyosat", "Firibgarlik", "Noqonuniy"]
      : ["Qiziq emas", "Halaqit qilmoqda", "Harid qildim"]

  return (
    <div className="relative w-full">
      <div className={cn("relative overflow-hidden rounded-xl border bg-card shadow-sm", "h-[210px]")}>
        {panelOpen ? (
          <div className="h-full p-4">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-semibold text-foreground/80">Reklama e&apos;lonlari</p>
                <p className="mt-1 text-xs text-muted-foreground">{ad.siteName}</p>
              </div>
              <Button type="button" variant="ghost" onClick={() => {
                setPanelOpen(false)
                setReasonMode(null)
              }} aria-label="Yopish">
                <XIcon className="size-4" />
              </Button>
            </div>
            <div className="mt-3 flex items-end justify-end gap-3">
              {/* <p className="text-sm font-medium">
                {reasonMode === "report" ? "Nima uchun arz qilmoqchisiz?" : "Nima uchun yashirmoqchisiz?"}
              </p> */}

            </div>
            {reasonMode ? (
              <div className="mt-3 flex gap-4 space-y-2">
                {reasons.map((reason) => (
                  <Button type="button" variant="outline" key={reason} onClick={() => void sendFeedback(reasonMode, reason)}>
                    <span>{reason}</span>
                    {/* <ShieldAlert className="size-4 text-muted-foreground" /> */}
                  </Button>
                ))}
              </div>
            ) : (
              <div className="mt-3 flex gap-4 justify-start items-center space-y-1">
                <Button type="button" variant="outline" className="" onClick={() => setReasonMode("hide")}>
                  <span>Yashirish</span>
                </Button>
                <Button type="button" variant="outline" onClick={() => setReasonMode("report")}>
                  <span>Arz qilish</span>
                </Button>
                {ad.advertiserUrl ? (
                  <Link href={ad.advertiserUrl} target="_blank" rel="noopener noreferrer sponsored nofollow" className="flex items-center gap-2 rounded-md px-2 py-2 text-sm hover:bg-muted">
                    <span>Reklama beruvchi haqida</span>
                    <ExternalLink className="size-4 text-muted-foreground" />
                  </Link>
                ) : null}
                {ad.adInfoUrl ? (
                  <Link href={ad.adInfoUrl} target="_blank" rel="noopener noreferrer sponsored nofollow" className="flex items-center gap-2 rounded-md px-2 py-2 text-sm hover:bg-muted">
                    <span>Reklama haqida</span>
                    <ExternalLink className="size-4 text-muted-foreground" />
                  </Link>
                ) : null}
                {ad.advertiseWithUsUrl ? (
                  <Link href={ad.advertiseWithUsUrl} target="_blank" rel="noopener noreferrer sponsored nofollow" className="flex items-center gap-2 rounded-md px-2 py-2 text-sm hover:bg-muted">
                    <span>Reklama berish uchun</span>
                    <ExternalLink className="size-4 text-muted-foreground" />
                  </Link>
                ) : null}
                <Button type="button" variant="outline" onClick={copyLink}>
                  <span>Nusxa olish</span>
                </Button>
              </div>
            )}
          </div>
        ) : ad.type === "image" ? (
          <div className="relative h-full w-full bg-muted">
            {ad.media ? (
              mediaKind === "video" ? (
                <video src={ad.media} className="absolute inset-0 h-full w-full object-cover" autoPlay muted loop playsInline />
              ) : (
                <img src={ad.media} alt={ad.title ?? "Reklama"} className="absolute inset-0 h-full w-full object-cover" />
              )
            ) : null}
            <Button
              size="icon"
              variant="secondary"
              className="absolute right-2 top-2 z-10 size-7"
              onClick={() => {
                setPanelOpen(true)
                setReasonMode(null)
              }}
              aria-label="Reklama menyusi"
            >
              <MoreVertical className="size-4" />
            </Button>
            {ad.adUrl ? (
              <a href={ad.adUrl} target="_blank" rel="noopener noreferrer sponsored nofollow" className="absolute inset-0" aria-label={ad.title ?? "Reklama"} />
            ) : null}
          </div>
        ) : (
          <div className="grid h-full grid-cols-[42%_58%]">
            <div className="relative h-full bg-muted">
              {ad.media ? (
                ad.adUrl ? (
                  <a href={ad.adUrl} target="_blank" rel="noopener noreferrer sponsored nofollow" className="block h-full w-full">
                    {mediaKind === "video" ? (
                      <video src={ad.media} className="h-full w-full object-cover" autoPlay muted loop playsInline />
                    ) : (
                      <img src={ad.media} alt={ad.title ?? "Reklama"} className="h-full w-full object-cover" />
                    )}
                  </a>
                ) : mediaKind === "video" ? (
                  <video src={ad.media} className="h-full w-full object-cover" autoPlay muted loop playsInline />
                ) : (
                  <img src={ad.media} alt={ad.title ?? "Reklama"} className="h-full w-full object-cover" />
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
                    onClick={() => {
                      setPanelOpen(true)
                      setReasonMode(null)
                    }}
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
                    ad.adUrl ? (
                      <a href={ad.adUrl} target="_blank" rel="noopener noreferrer sponsored nofollow" className="block hover:underline">
                        <p className="line-clamp-2 text-sm text-muted-foreground">{ad.description}</p>
                      </a>
                    ) : (
                      <p className="line-clamp-2 text-sm text-muted-foreground">{ad.description}</p>
                    )
                  ) : null}
                </div>
                {ad.links?.length ? (
                  <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-foreground/80">
                    {ad.links.map((item, index) => (
                      <a key={`${item.href}-${index}`} href={item.href} target="_blank" rel="noopener noreferrer sponsored nofollow" className="hover:underline">
                        {item.label}
                      </a>
                    ))}
                  </div>
                ) : null}
              </div>
              {ad.adUrl ? (
                <div>
                  <a
                    href={ad.adUrl}
                    target="_blank"
                    rel="noopener noreferrer sponsored nofollow"
                    className="inline-flex rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground"
                  >
                    Batafsil
                  </a>
                </div>
              ) : null}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
