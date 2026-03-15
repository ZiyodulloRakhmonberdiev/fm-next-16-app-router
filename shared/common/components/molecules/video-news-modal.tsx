"use client"

import * as React from "react"
import { Button } from "@/shared/common/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/shared/common/components/ui/dialog"
import { Link } from "@/i18n/navigation"
import type { NewsItem } from "@/features/news/model"
import { getMediaUrl } from "@/shared/common/lib/media-url"
import { getYoutubeEmbedUrl } from "@/shared/common/lib/youtube"
import { useTranslations } from "next-intl"

type VideoNewsModalProps = {
  item: NewsItem | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export default function VideoNewsModal({ item, open, onOpenChange }: VideoNewsModalProps) {
  const t = useTranslations("common")
  const hasVideo = !!(item && item.videoSource && item.videoUrl)

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        onOpenChange(next)
      }}
    >
      <DialogContent className="max-w-3xl w-full p-0 overflow-hidden">
        {hasVideo && item && (
          <>
            <div className="relative aspect-video w-full bg-muted">
              {item.videoSource === "youtube" ? (
                (() => {
                  const embedUrl = getYoutubeEmbedUrl(item.videoUrl!)
                  if (!embedUrl) return null
                  return (
                    <iframe
                      src={embedUrl}
                      title={item.title}
                      className="absolute inset-0 h-full w-full"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    />
                  )
                })()
              ) : (
                <video
                  src={getMediaUrl(item.videoUrl!)}
                  controls
                  controlsList="nodownload"
                  disablePictureInPicture
                  onContextMenu={(e) => e.preventDefault()}
                  className="h-full w-full object-contain"
                  poster={getMediaUrl(item.images?.[0]) || undefined}
                >
                  {t("your_browser_does_not_support_the_video_tag")}
                </video>
              )}
            </div>
            <div className="space-y-3 p-4">
              <DialogHeader>
                <DialogTitle className="text-start">{item.title}</DialogTitle>
                {item.description && (
                  <DialogDescription className="mt-1 text-start">
                    {item.description}
                  </DialogDescription>
                )}
              </DialogHeader>
              <div className="flex justify-start">
                <Button asChild>
                  <Link href={`/news/${item.slug}`}>{t("read_article")}</Link>
                </Button>
              </div>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}

