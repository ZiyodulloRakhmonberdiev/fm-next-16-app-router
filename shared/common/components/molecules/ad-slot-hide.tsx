"use client"

import { useState } from "react"
import { Button } from "@/shared/common/components/ui/button"
import { ExternalLink, XIcon } from "lucide-react"
import { toast } from "sonner"
import { Link } from "@/i18n/navigation"

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
  onHideSuccess?: () => void
}

const HIDE_REASONS = ["Qiziq emas", "Halaqit qilmoqda", "Harid qildim"]
const REPORT_REASONS = ["Siyosat", "Firibgarlik", "Noqonuniy"]

export function AdSlotHide({ ad, placement, onClose, onHideSuccess }: AdSlotHideProps) {
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
    if (action === "hide") {
      onHideSuccess?.()
    }
    setReasonMode(null)
    onClose()
  }

  function copyLink() {
    if (!ad.adUrl) return
    void navigator.clipboard.writeText(ad.adUrl)
    toast.success("Reklama havolasi nusxalandi")
    onClose()
  }

  const reasons = reasonMode === "report" ? REPORT_REASONS : HIDE_REASONS

  return (
    <div className="h-full p-4">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-semibold text-foreground/80">Reklama e&apos;lonlari</p>
          <p className="mt-1 text-xs text-muted-foreground">{ad.siteName}</p>
        </div>
        <Button type="button" variant="ghost" onClick={onClose} aria-label="Yopish">
          <XIcon className="size-4" />
        </Button>
      </div>
      <div className="mt-3 flex items-end justify-end gap-3" />
      {reasonMode ? (
        <div className="mt-3 flex flex-wrap gap-2">
          {reasons.map((reason) => (
            <Button
              type="button"
              variant="outline"
              key={reason}
              onClick={() => void sendFeedback(reasonMode, reason)}
            >
              <span>{reason}</span>
            </Button>
          ))}
        </div>
      ) : (
        <div className="mt-3 flex flex-wrap gap-2 items-center">
          <Button type="button" variant="outline" onClick={() => setReasonMode("hide")}>
            <span>Yashirish</span>
          </Button>
          <Button type="button" variant="outline" onClick={() => setReasonMode("report")}>
            <span>Arz qilish</span>
          </Button>
          {ad.advertiserUrl ? (
            <Link
              href={ad.advertiserUrl}
              target="_blank"
              rel="noopener noreferrer sponsored nofollow"
              className="flex items-center gap-2 rounded-md px-2 py-2 text-sm hover:bg-muted"
            >
              <span>Reklama beruvchi haqida</span>
              <ExternalLink className="size-4 text-muted-foreground" />
            </Link>
          ) : null}
          {ad.adInfoUrl ? (
            <Link
              href={ad.adInfoUrl}
              target="_blank"
              rel="noopener noreferrer sponsored nofollow"
              className="flex items-center gap-2 rounded-md px-2 py-2 text-sm hover:bg-muted"
            >
              <span>Reklama haqida</span>
              <ExternalLink className="size-4 text-muted-foreground" />
            </Link>
          ) : null}
          {ad.advertiseWithUsUrl ? (
            <Link
              href={ad.advertiseWithUsUrl}
              target="_blank"
              rel="noopener noreferrer sponsored nofollow"
              className="flex items-center gap-2 rounded-md px-2 py-2 text-sm hover:bg-muted"
            >
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
  )
}
