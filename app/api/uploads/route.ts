import { randomUUID } from "node:crypto"
import { mkdir, writeFile } from "node:fs/promises"
import path from "node:path"
import { NextRequest } from "next/server"
import { requireAdminSession } from "@/shared/server/require-admin-session"
import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3"

/** Vercel: uzoq video yuklash (sekundlar) */
export const maxDuration = 300

// Contabo (comment): pnpm run contabo:public

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

function isContaboConfigured(): boolean {
  return !!(
    process.env.CONTABO_ENDPOINT &&
    process.env.CONTABO_BUCKET &&
    process.env.CONTABO_ACCESS_KEY &&
    process.env.CONTABO_SECRET_KEY &&
    process.env.NEXT_PUBLIC_STORAGE_PUBLIC_URL
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

    const uploadToContabo = async () => {
      if (!isContaboConfigured()) {
        throw new Error("Contabo sozlanmagan")
      }

      const endpoint = process.env.CONTABO_ENDPOINT!
      const bucket = process.env.CONTABO_BUCKET!
      const accessKey = process.env.CONTABO_ACCESS_KEY!
      const secretKey = process.env.CONTABO_SECRET_KEY!
      const publicBase = process.env.NEXT_PUBLIC_STORAGE_PUBLIC_URL!.replace(/\/$/, "")

      const subfolder = kind === "image" ? "images" : "videos"
      // scripts/contabo-set-public-policy.mjs: uploads/* uchun public read policy
      const key = `uploads/${subfolder}/${filename}`

      const contentType = EXT_TO_MIME[ext] || (kind === "image" ? "image/jpeg" : "video/mp4")

      const region = process.env.CONTABO_REGION || "eu2"
      const client = new S3Client({
        endpoint,
        region,
        credentials: { accessKeyId: accessKey, secretAccessKey: secretKey },
        forcePathStyle: true,
      })

      await client.send(
        new PutObjectCommand({
          Bucket: bucket,
          Key: key,
          Body: buffer,
          ContentType: contentType,
          // public policy uploads/* uchun already berilgan; lekin ba'zan ACL ham kerak bo'ladi.
          ACL: "public-read",
        })
      )

      return `${publicBase}/${key}`
    }

    // Contabo faqat (fallback o‘chirilgan)
    if (!isContaboConfigured()) {
      return Response.json(
        {
          error:
            "Contabo sozlanmagan. CONTABO_ENDPOINT, CONTABO_BUCKET, CONTABO_ACCESS_KEY, CONTABO_SECRET_KEY va NEXT_PUBLIC_STORAGE_PUBLIC_URL .env.local da bo‘lishi kerak.",
        },
        { status: 503 }
      )
    }

    const url = await uploadToContabo()
    return Response.json({ url })
  } catch (error) {
    const err = error as { message?: string; error?: { message?: string } }
    const message =
      err?.error?.message ?? err?.message ?? "Upload xatoligi"
    return Response.json({ error: message }, { status: 500 })
  }
}
