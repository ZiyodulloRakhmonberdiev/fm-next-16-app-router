import { randomUUID } from "node:crypto"
import { mkdir, writeFile } from "node:fs/promises"
import path from "node:path"
import { NextRequest } from "next/server"
import { requireAdminSession } from "@/shared/common/lib/require-admin-session"
import { v2 as cloudinary } from "cloudinary"

const IMAGE_EXTENSIONS = new Set([".jpg", ".jpeg", ".png", ".webp", ".gif", ".svg"])
const VIDEO_EXTENSIONS = new Set([".mp4", ".webm", ".ogg", ".mov", ".m4v"])

const EXT_TO_MIME: Record<string, string> = {
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".webp": "image/webp",
  ".gif": "image/gif",
  ".svg": "image/svg+xml",
  ".mp4": "video/mp4",
  ".webm": "video/webm",
  ".ogg": "video/ogg",
  ".mov": "video/quicktime",
  ".m4v": "video/x-m4v",
}

function sanitizeBaseName(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9-_]/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
}

function isCloudinaryConfigured(): boolean {
  return !!(
    process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME &&
    process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY &&
    process.env.CLOUDINARY_API_SECRET
  )
}

export async function POST(req: NextRequest) {
  const unauthorized = await requireAdminSession(['ceo', 'administrator', 'moderator', 'ads_manager'])
  if (unauthorized) return unauthorized

  try {
    const formData = await req.formData()
    const file = formData.get("file")
    const kind = String(formData.get("kind") ?? "")

    if (!(file instanceof File)) {
      return Response.json({ error: "Fayl topilmadi" }, { status: 400 })
    }
    if (kind !== "image" && kind !== "video") {
      return Response.json({ error: "Noto'g'ri media turi" }, { status: 400 })
    }

    const ext = path.extname(file.name || "").toLowerCase()
    const allowed = kind === "image" ? IMAGE_EXTENSIONS : VIDEO_EXTENSIONS
    if (!allowed.has(ext)) {
      return Response.json({ error: "Fayl turi qo'llab-quvvatlanmaydi" }, { status: 400 })
    }

    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    const base = sanitizeBaseName(path.basename(file.name, ext)) || "media"
    const filename = `${base}-${randomUUID()}${ext}`

    if (isCloudinaryConfigured()) {
      cloudinary.config({
        cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
        api_key: process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY,
        api_secret: process.env.CLOUDINARY_API_SECRET,
      })
      const mime = EXT_TO_MIME[ext] || (kind === "image" ? "image/jpeg" : "video/mp4")
      const dataUri = `data:${mime};base64,${buffer.toString("base64")}`
      const folder = process.env.CLOUDINARY_UPLOAD_FOLDER?.replace(/\/$/, "") || "uploads"
      const uniqueId = randomUUID()
      const publicId = `${folder}/${kind === "image" ? "images" : "videos"}/${base}-${uniqueId}`

      const resourceType = kind === "image" ? "image" : "video"
      const result = await new Promise<{ secure_url?: string; url?: string }>((resolve, reject) => {
        cloudinary.uploader.upload(
          dataUri,
          {
            resource_type: resourceType,
            public_id: publicId,
          },
          (err, res) => (err ? reject(err) : resolve(res as { secure_url?: string; url?: string }))
        )
      })
      const url = result?.secure_url ?? result?.url ?? ""
      if (!url) return Response.json({ error: "Cloudinary javob bermadi" }, { status: 500 })
      return Response.json({ url })
    }

    const folder = path.join(process.cwd(), "public", "uploads", kind === "image" ? "images" : "videos")
    await mkdir(folder, { recursive: true })
    const fullPath = path.join(folder, filename)
    await writeFile(fullPath, buffer)
    const url = `/uploads/${kind === "image" ? "images" : "videos"}/${filename}`
    return Response.json({ url })
  } catch (error) {
    const err = error as { message?: string; error?: { message?: string } }
    const message =
      err?.error?.message ?? err?.message ?? "Upload xatoligi"
    return Response.json({ error: message }, { status: 500 })
  }
}
