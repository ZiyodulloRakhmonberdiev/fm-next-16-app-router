"use client"

import Image from "next/image"
import { getYoutubeEmbedUrl } from "@/features/news/lib/youtube"
import { getCardImageSrc, getPublicVideoSrc } from "./news-listing-utils"

type VideoCardMediaPreviewProps = {
  title: string
  item: {
    images?: string[]
    videoUrl?: string | null
    videoSource?: string | null
  }
}

export function VideoCardMediaPreview({ title, item }: VideoCardMediaPreviewProps) {
  const poster = getCardImageSrc(item)
  const raw = item.videoUrl?.trim() ?? ""
  const videoSrc =
    !poster && raw && !getYoutubeEmbedUrl(raw) ? getPublicVideoSrc(raw) : ""

  if (poster) {
    return (
      <Image
        src={poster}
        alt={title}
        fill
        sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
        className="object-cover transition-transform duration-300 group-hover:scale-[1.03]"
      />
    )
  }

  if (videoSrc) {
    return (
      <video
        src={videoSrc}
        muted
        playsInline
        preload="metadata"
        className="absolute inset-0 h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
        aria-hidden
        onLoadedMetadata={(e) => {
          try {
            const el = e.currentTarget
            if (el.duration && Number.isFinite(el.duration)) el.currentTime = 0.05
          } catch {
            /* noop */
          }
        }}
      />
    )
  }

  return <div className="absolute inset-0 bg-muted" aria-hidden />
}
