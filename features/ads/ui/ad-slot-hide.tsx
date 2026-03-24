"use client"

import { useState } from "react"
import { Button } from "@/shared/common/components/ui/button"
import { AlertTriangleIcon, ArrowUpRight, ClipboardIcon, CopyIcon, ExternalLink, EyeOffIcon, Info, LinkIcon, Megaphone, MoveUpRight, Wallet, XIcon } from "lucide-react"
import { toast } from "sonner"
import { toAbsoluteExternalHref } from "../lib/external-href"

type Placement = "header_top_full" | "sidebar_widget" | "home_bottom_full" | "article_bottom_full"

type AdSlotHideProps = {
  ad: {
    _id: string
    siteName?: string
    adUrl?: string
    advertiserUrl?: string
    adInfoUrl?: string
    advertiseWithUsUrl?: string
  }
  placement: Placement
  onClose: () => void
  /** Yashirish yoki arz muvaffaqiyatli yuborilganda — reklama sloti butunlay yopiladi */
  onAdSectionClosed?: () => void
}

const HIDE_REASONS = ["Qiziq emas", "Halaqit qilmoqda", "Harid qildim"]
const REPORT_REASONS = ["Siyosiy", "Firibgarlik", "Noqonuniy mahsulot", "Tasvirda muammo bor"]

export function AdSlotHide({ ad, placement, onClose, onAdSectionClosed }: AdSlotHideProps) {
  const [reasonMode, setReasonMode] = useState<null | "hide" | "report">(null)

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
    if (action === "hide" || action === "report") {
      onAdSectionClosed?.()
    }
    setReasonMode(null)
    onClose()
  }

  function copyLink() {
    const url = toAbsoluteExternalHref(ad.adUrl)
    if (!url) return
    void navigator.clipboard.writeText(url)
    toast.success("Reklama havolasi nusxalandi")
    onClose()
  }

  const reasons = reasonMode === "report" ? REPORT_REASONS : HIDE_REASONS
  const advertiserHref = toAbsoluteExternalHref(ad.advertiserUrl)
  const adInfoHref = toAbsoluteExternalHref(ad.adInfoUrl)
  const advertiseWithUsHref = toAbsoluteExternalHref(ad.advertiseWithUsUrl)

  return (
    <div className="h-full p-4">
      <div className="flex items-start justify-between">
        <div>
          {/* <p className="text-sm font-semibold text-foreground/80">Reklama e'lonlari</p> */}
          {/* <p className="mt-1 text-xs text-muted-foreground">{ad.siteName}</p> */}
        </div>
        <Button type="button" variant="ghost" onClick={onClose} aria-label="Yopish">
          <XIcon className="size-4" />
        </Button>
      </div>
      <div className="mt-3 flex items-end justify-end gap-3" />
      {reasonMode ? (
        <div className="mt-3 flex flex-nowrap overflow-x-auto gap-2 items-center">
          <p className="text-sm font-bold whitespace-nowrap text-foreground/80">Sababini bildiring</p>
          {reasons.map((reason) => (
            <Button
              type="button"
              variant="secondary"
              key={reason}
              asChild
              onClick={() => void sendFeedback(reasonMode, reason)}
              className="p-2 rounded-xs py-1.5 h-auto text-xs "
            >
              <span>{reason}</span>
            </Button>
          ))}
        </div>
      ) : (
        <div className="mt-3 flex flex-nowrap overflow-x-auto gap-2 items-center">
          <p className="text-sm font-bold text-foreground/60">Reklama</p>
          <Button type="button" variant="secondary" onClick={() => setReasonMode("hide")} className="text-xs p-2 rounded-xs py-1.5 h-auto">
            <EyeOffIcon className="size-4" />
            <span>Yashirish</span>
          </Button>
          <Button type="button" variant="secondary" className="text-xs p-2 rounded-xs py-1.5 h-auto" onClick={() => setReasonMode("report")}>
            <AlertTriangleIcon className="size-4" />
            <span>Arz qilish</span>
          </Button>
          {advertiserHref ? (
            <Button asChild variant="secondary" className="text-xs p-2 rounded-xs py-1.5 h-auto">
              <a href={advertiserHref} target="_blank" rel="noopener noreferrer sponsored nofollow">
                <Info className="size-4" />
                <span>Reklama beruvchi haqida</span>
                <ArrowUpRight className="size-4 text-muted-foreground" />
              </a>
            </Button>
          ) : null}
          {adInfoHref ? (
            <Button asChild variant="secondary" className="text-xs p-2 rounded-xs py-1.5 h-auto">
              <a href={adInfoHref} target="_blank" rel="noopener noreferrer sponsored nofollow">
                <Megaphone className="size-4" />
                <span>Reklama haqida</span>
                <ArrowUpRight className="size-4 text-muted-foreground" />
              </a>
            </Button>
          ) : null}
          {advertiseWithUsHref ? (
            <Button asChild variant="secondary" className="text-xs p-2 rounded-xs py-1.5 h-auto">
              <a href={advertiseWithUsHref} target="_blank" rel="noopener noreferrer sponsored nofollow">
                <Wallet className="size-4" />
                <span>Reklama berish uchun</span>
                <ArrowUpRight className="size-4 text-muted-foreground" />
              </a>
            </Button>
          ) : null}
          <Button type="button" variant="secondary" className="text-xs p-2 rounded-xs py-1.5 h-auto" onClick={copyLink}>
            <LinkIcon className="size-4" />
            <span>Nusxa olish</span>
          </Button>
        </div>
      )}
    </div>
  )
}
