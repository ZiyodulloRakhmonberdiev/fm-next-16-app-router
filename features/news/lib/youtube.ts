/**
 * YouTube URL dan embed URL yoki video ID olish.
 * Qo‘llab-quvvatlanadi: watch?v=, youtu.be/, embed/
 */
export function getYoutubeVideoId(url: string): string | null {
  if (!url?.trim()) return null
  const u = url.trim()
  const watchMatch = u.match(/(?:youtube\.com\/watch\?v=)([a-zA-Z0-9_-]{11})/)
  if (watchMatch) return watchMatch[1]
  const shortMatch = u.match(/(?:youtu\.be\/)([a-zA-Z0-9_-]{11})/)
  if (shortMatch) return shortMatch[1]
  const embedMatch = u.match(/(?:youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/)
  if (embedMatch) return embedMatch[1]
  return null
}

export function getYoutubeEmbedUrl(url: string): string | null {
  const id = getYoutubeVideoId(url)
  return id ? `https://www.youtube.com/embed/${id}` : null
}

/** YouTube video uchun thumbnail rasm URL (hqdefault). */
export function getYoutubeThumbnailUrl(url: string | undefined | null): string {
  const id = getYoutubeVideoId(url ?? "")
  return id ? `https://img.youtube.com/vi/${id}/hqdefault.jpg` : ""
}
