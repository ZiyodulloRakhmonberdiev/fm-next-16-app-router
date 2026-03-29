/**
 * Client faqat `/api/uploads` ga yuboradi.
 *
 * Server tomonda media saqlash Contabo object storage (S3 compatible) orqali amalga oshiriladi.
 * Cloudinary faqat optional fallback sifatida qoldirilgan.
 */
import { optimizeImage } from "@/shared/common/lib/image-optimizer"

// Direct Cloudinary upload yo'li hozircha ishlatilmaydi.
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
  if (!data?.secure_url) throw new Error("Cloudinary javobida URL yo'q")
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

export async function uploadFileViaPresignedUrl(
  file: File,
  kind: "image" | "video" | "audio"
): Promise<string> {
  let fileToUpload = file
  if (kind === "image") {
    try {
      fileToUpload = await optimizeImage(file)
    } catch (err) {
      console.warn("Rasm optimallashtirishda xato, original yuklanmoqda:", err)
    }
  }

  const res1 = await fetch("/api/uploads/presigned", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ filename: fileToUpload.name, kind }),
  })
  const data1 = await res1.json()
  if (!res1.ok || !data1.presignedUrl) {
    throw new Error(data1?.error || "Yuklash uchun ruxsat (presigned URL) olib bo'lmadi")
  }

  const res2 = await fetch(data1.presignedUrl, {
    method: "PUT",
    headers: {
      "Content-Type":
        fileToUpload.type ||
        (kind === "image" ? "image/jpeg" : kind === "video" ? "video/mp4" : "audio/mpeg"),
    },
    body: fileToUpload,
  })

  if (!res2.ok) {
    throw new Error("S3 ga to'g'ridan-to'g'ri yuklash bekor qilindi / xatolik berdi")
  }

  return data1.publicUrl
}
