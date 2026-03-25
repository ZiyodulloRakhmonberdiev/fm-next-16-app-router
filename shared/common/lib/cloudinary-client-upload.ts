/**
 * Client faqat `/api/uploads` ga yuboradi.
 *
 * Server tomonda media saqlash Contabo object storage (S3 compatible) orqali amalga oshiriladi.
 * Cloudinary faqat optional fallback sifatida qoldirilgan.
 */

// Direct Cloudinary upload yo‘li hozircha ishlatilmaydi.
export function isCloudinaryDirectVideoUploadConfigured(): boolean {
  return false
}

export async function uploadVideoToCloudinaryDirect(file: File): Promise<string> {
  const cloud = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME?.trim()
  const preset = process.env.NEXT_PUBLIC_CLOUDINARY_VIDEO_UPLOAD_PRESET?.trim()
  if (!cloud || !preset) {
    throw new Error("Cloudinary video preset sozlanmagan")
  }
  const fd = new FormData()
  fd.append("file", file)
  fd.append("upload_preset", preset)
  const res = await fetch(
    `https://api.cloudinary.com/v1_1/${encodeURIComponent(cloud)}/video/upload`,
    { method: "POST", body: fd }
  )
  const data = (await res.json().catch(() => null)) as {
    secure_url?: string
    error?: { message?: string }
  } | null
  if (!res.ok) {
    const msg =
      typeof data?.error?.message === "string"
        ? data.error.message
        : "Cloudinary video yuklash xatoligi"
    throw new Error(msg)
  }
  if (!data?.secure_url) throw new Error("Cloudinary javobida URL yo‘q")
  return data.secure_url
}

export async function uploadVideoViaApiOrCloudinary(
  file: File,
  options?: { credentials?: RequestCredentials }
): Promise<string> {
  const formData = new FormData()
  formData.append("file", file)
  formData.append("kind", "video")
  const res = await fetch("/api/uploads", {
    method: "POST",
    credentials: options?.credentials ?? "include",
    body: formData,
  })
  const data = (await res.json().catch(() => null)) as { url?: string; error?: string } | null
  if (!res.ok || !data?.url) {
    throw new Error(data?.error ?? "Video yuklash xatoligi")
  }
  return data.url
}
