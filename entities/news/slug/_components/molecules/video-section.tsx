"use client"

import * as React from "react"
import { getYoutubeEmbedUrl, getYoutubeThumbnailUrl } from "@/features/news/lib/youtube"
import { getCloudinaryVideoPosterUrl } from "@/shared/infra/cloudinary"

type VideoSectionProps = {
  videoUrl?: string | null
  title: string
  images?: string[]
  videoCaption?: string
  unsupportedText: string
}

const getSafeImageSrc = (raw?: string) => {
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

const getVideoSrc = (url?: string | null) => {
  const u = url?.trim()
  if (!u) return ""
  if (u.startsWith("http://") || u.startsWith("https://")) return u
  if (u.startsWith("/")) return u
  return `/${u}`
}

export function VideoSection({ videoUrl, title, images, videoCaption, unsupportedText }: VideoSectionProps) {
  const hasVideo = Boolean(videoUrl?.trim())
  if (!hasVideo) return null

  const youtubeEmbed = getYoutubeEmbedUrl(videoUrl ?? "")
  const videoPoster =
    getSafeImageSrc(images?.[0]) ||
    (getYoutubeEmbedUrl(videoUrl ?? "")
      ? getYoutubeThumbnailUrl(videoUrl)
      : getCloudinaryVideoPosterUrl(videoUrl)) ||
    undefined

  return (
    <div className="mb-6">
      <div className="relative aspect-video w-full overflow-hidden rounded-lg bg-muted">
        {youtubeEmbed ? (
          <iframe
            src={youtubeEmbed}
            title={title}
            className="absolute inset-0 h-full w-full"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        ) : (
          <video
            key={videoUrl ?? "video"}
            src={getVideoSrc(videoUrl)}
            controls
            controlsList="nodownload"
            disablePictureInPicture
            onContextMenu={(e) => e.preventDefault()}
            className="h-full w-full object-cover"
            poster={videoPoster}
          >
            {unsupportedText}
          </video>
        )}
      </div>
      {videoCaption ? (
        <p className="px-2 py-1 text-xs mt-1">
          {videoCaption}
        </p>
      ) : null}
    </div>
  )
}
