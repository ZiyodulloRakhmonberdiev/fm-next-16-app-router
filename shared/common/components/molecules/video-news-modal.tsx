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
import { getYoutubeEmbedUrl } from "@/shared/common/lib/youtube"
import { getCloudinaryVideoPosterUrl } from "@/shared/common/lib/cloudinary"
import { getYoutubeThumbnailUrl } from "@/shared/common/lib/youtube"
import { useTranslations } from "next-intl"

function getSafeImageSrc(raw?: string): string {
  if (!raw?.trim()) return ""
  return raw.startsWith("http") || raw.startsWith("/") ? raw : `/uploads/images/${raw}`
}

function getVideoPoster(item: NewsItem): string {
  const img = getSafeImageSrc(item.images?.[0])
  if (img) return img
  if (getYoutubeEmbedUrl(item.videoUrl ?? "")) return getYoutubeThumbnailUrl(item.videoUrl) || ""
  return getCloudinaryVideoPosterUrl(item.videoUrl) || ""
}

function getVideoSrc(url?: string | null): string {
  const u = url?.trim()
  if (!u) return ""
  return u.startsWith("http") || u.startsWith("/") ? u : `/${u}`
}

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
      <DialogContent className="max-w-[100vw - 2rem]  w-full p-0 overflow-hidden mx-auto my-4 sm:mx-auto sm:my-6">
        {hasVideo && item && (() => {
          const youtubeEmbed = getYoutubeEmbedUrl(item.videoUrl ?? "")
          return (
          <>
            <div className="relative aspect-video w-full bg-muted">
              {youtubeEmbed ? (
                <iframe
                  src={youtubeEmbed}
                  title={item.title}
                  className="absolute inset-0 h-full w-full"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              ) : (
                <video
                  key={item.videoUrl}
                  src={getVideoSrc(item.videoUrl)}
                  controls
                  controlsList="nodownload"
                  disablePictureInPicture
                  onContextMenu={(e) => e.preventDefault()}
                  className="h-full w-full object-contain"
                  poster={getVideoPoster(item) || undefined}
                >
                  {t("your_browser_does_not_support_the_video_tag")}
                </video>
              )}
            </div>
            <div className="space-y-3 p-4">
              <DialogHeader>
                <DialogTitle className="text-start line-clamp-2 md:line-clamp-3">{item.title}</DialogTitle>
                {item.description && (
                  <DialogDescription className="mt-1 text-start line-clamp-2 md:line-clamp-3">
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
          )
        })()}
      </DialogContent>
    </Dialog>
  )
}

