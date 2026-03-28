/**
 * Cloudinary video poster helper.
 */

export function getCloudinaryVideoPosterUrl(videoUrl: string | undefined | null): string {
  const u = videoUrl?.trim()
  if (!u) return ""
  if (!/^https?:\/\/res\.cloudinary\.com\/[^/]+\/video\/upload\//i.test(u)) return ""
  const withSo = u.replace(
    /^(https?:\/\/res\.cloudinary\.com\/[^/]+\/video\/upload\/)(.*)$/i,
    "$1so_0/$2"
  )
  return withSo.replace(/\.(mp4|webm|mov|ogg|m4v)$/i, ".jpg")
}

export function isCloudinaryVideoUrl(url: string | undefined | null): boolean {
  return Boolean(
    url?.trim() &&
      /^https?:\/\/res\.cloudinary\.com\/[^/]+\/video\/upload\//i.test(url.trim())
  )
}
