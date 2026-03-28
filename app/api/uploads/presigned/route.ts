import { randomUUID } from "node:crypto"
import path from "node:path"
import { NextRequest } from "next/server"
import { requireAdminSession } from "@/shared/server/require-admin-session"
import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3"
import { getSignedUrl } from "@aws-sdk/s3-request-presigner"

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
  return name.toLowerCase().replace(/[^a-z0-9-_]/g, "-").replace(/-+/g, "-").replace(/^-|-$/g, "")
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
    const json = await req.json()
    const { filename, kind } = json

    if (!filename || typeof filename !== "string") {
      return Response.json({ error: "Fayl nomi topilmadi" }, { status: 400 })
    }
    if (kind !== "image" && kind !== "video") {
      return Response.json({ error: "Noto'g'ri media turi" }, { status: 400 })
    }

    const ext = path.extname(filename).toLowerCase()
    const allowed = kind === "image" ? IMAGE_EXTENSIONS : VIDEO_EXTENSIONS
    if (!allowed.has(ext)) {
      return Response.json({ error: "Fayl turi qo'llab-quvvatlanmaydi" }, { status: 400 })
    }

    if (!isContaboConfigured()) {
      return Response.json({ error: "Contabo sozlanmagan" }, { status: 503 })
    }

    const base = sanitizeBaseName(path.basename(filename, ext)) || "media"
    const newFilename = `${base}-${randomUUID()}${ext}`

    const endpoint = process.env.CONTABO_ENDPOINT!
    const bucket = process.env.CONTABO_BUCKET!
    const accessKey = process.env.CONTABO_ACCESS_KEY!
    const secretKey = process.env.CONTABO_SECRET_KEY!
    const publicBase = process.env.NEXT_PUBLIC_STORAGE_PUBLIC_URL!.replace(/\/$/, "")

    const subfolder = kind === "image" ? "images" : "videos"
    const key = `uploads/${subfolder}/${newFilename}`
    const contentType = EXT_TO_MIME[ext] || (kind === "image" ? "image/jpeg" : "video/mp4")

    const region = process.env.CONTABO_REGION || "eu2"
    const client = new S3Client({
      endpoint,
      region,
      credentials: { accessKeyId: accessKey, secretAccessKey: secretKey },
      forcePathStyle: true,
    })

    const command = new PutObjectCommand({
      Bucket: bucket,
      Key: key,
      ContentType: contentType,
      ACL: "public-read",
    })

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const presignedUrl = await getSignedUrl(client as any, command as any, { expiresIn: 3600 })
    const publicUrl = `${publicBase}/${key}`

    return Response.json({ presignedUrl, publicUrl, key })
  } catch (error) {
    const err = error as { message?: string }
    return Response.json({ error: err.message ?? "Presign xatoligi" }, { status: 500 })
  }
}
