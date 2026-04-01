type TitleMap = {
  uz?: string
  uzb?: string
  ru?: string
  en?: string
}

export type NewsMediaFlags = {
  hasText: boolean
  hasImage: boolean
  hasVideo: boolean
  hasAudio: boolean
}

export function computeNewsMediaFlags(input: {
  title?: TitleMap | null
  images?: unknown
  videoUrl?: unknown
  audioUrl?: unknown
}): NewsMediaFlags {
  const hasText = typeof input.title?.uz === "string" && input.title.uz.trim() !== ""
  const hasImage =
    Array.isArray(input.images) &&
    input.images.some((src) => typeof src === "string" && src.trim() !== "")
  const hasVideo = typeof input.videoUrl === "string" && input.videoUrl.trim() !== ""
  const hasAudio = typeof input.audioUrl === "string" && input.audioUrl.trim() !== ""

  return { hasText, hasImage, hasVideo, hasAudio }
}
