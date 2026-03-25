import { randomUUID } from "node:crypto"
import { mkdir, writeFile } from "node:fs/promises"
import path from "node:path"
import { NextRequest } from "next/server"
import { requireAdminSession } from "@/shared/common/lib/require-admin-session"
// import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3"
import { v2 as cloudinary } from "cloudinary"

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

function isCloudinaryConfigured(): boolean {
  return !!(
    process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME &&
    process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY &&
    process.env.CLOUDINARY_API_SECRET
  )
}

// function isContaboConfigured(): boolean {
//   return !!(
//     process.env.CONTABO_ENDPOINT &&
//     process.env.CONTABO_BUCKET &&
//     process.env.CONTABO_ACCESS_KEY &&
//     process.env.CONTABO_SECRET_KEY &&
//     process.env.NEXT_PUBLIC_STORAGE_PUBLIC_URL
//   )
// }

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

    // Production / serverless da fayl tizimi read-only bo‘lishi mumkin,
    // lekin dev/lokalda videolarni baribir saqlab qolish uchun filesystemga fallback qilamiz.
    const isProduction = process.env.NODE_ENV === "production" || !!process.env.VERCEL

    const uploadToFilesystem = async () => {
      const folder = path.join(
        process.cwd(),
        "public",
        "uploads",
        kind === "image" ? "images" : "videos"
      )
      await mkdir(folder, { recursive: true })
      const filenameToWrite = filename
      await writeFile(path.join(folder, filenameToWrite), buffer)
      const url = `/uploads/${kind === "image" ? "images" : "videos"}/${filenameToWrite}`
      return url
    }

    if (isProduction && !isCloudinaryConfigured()) {
      try {
        const url = await uploadToFilesystem()
        return Response.json({ url })
      } catch (err) {
        return Response.json(
          {
            error:
              "Cloudinary sozlanmagan va filesystemga ham saqlash bo‘lmadi. Cloudinary sozlang: NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME, NEXT_PUBLIC_CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET",
          },
          { status: 503 }
        )
      }
    }

    // if (isContaboConfigured()) {
    //   const endpoint = process.env.CONTABO_ENDPOINT!
    //   const bucket = process.env.CONTABO_BUCKET!
    //   const publicBase = process.env.NEXT_PUBLIC_STORAGE_PUBLIC_URL!.replace(/\/$/, "")
    //   const subfolder = kind === "image" ? "images" : "videos"
    //   const key = `uploads/${subfolder}/${filename}`
    //   const client = new S3Client({ endpoint, region, credentials, forcePathStyle: true })
    //   await client.send(new PutObjectCommand({ Bucket, Key: key, Body, ContentType, ACL: "public-read" }))
    //   return Response.json({ url: `${publicBase}/${key}` })
    // }

    if (isCloudinaryConfigured()) {
      try {
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
        const uploadOptions: Record<string, unknown> = {
          resource_type: resourceType,
          public_id: publicId,
        }
        if (kind === "image") {
          uploadOptions.eager = [
            { width: 1200, crop: "scale", quality: "auto", fetch_format: "auto" },
          ]
          uploadOptions.eager_async = false
        }
        type UploadResult = {
          secure_url?: string
          url?: string
          eager?: Array<{ secure_url?: string; url?: string }>
        }
        const result = await new Promise<UploadResult>((resolve, reject) => {
          cloudinary.uploader.upload(dataUri, uploadOptions, (err, res) =>
            err ? reject(err) : resolve(res as UploadResult)
          )
        })
        const url =
          kind === "image" && result?.eager?.[0]?.secure_url
            ? result.eager[0].secure_url
            : result?.secure_url ?? result?.url ?? ""
        if (!url) return Response.json({ error: "Cloudinary javob bermadi" }, { status: 500 })
        return Response.json({ url })
      } catch (err) {
        console.error("[api/uploads] Cloudinary upload failed, fallback to filesystem:", err)
        try {
          const url = await uploadToFilesystem()
          return Response.json({ url })
        } catch (fallbackErr) {
          const message =
            fallbackErr instanceof Error
              ? fallbackErr.message
              : err instanceof Error
                ? err.message
                : "Cloudinary upload va filesystem fallback xatoligi"
          return Response.json({ error: message }, { status: 500 })
        }
      }
    }

    const url = await uploadToFilesystem()
    return Response.json({ url })
  } catch (error) {
    const err = error as { message?: string; error?: { message?: string } }
    const message =
      err?.error?.message ?? err?.message ?? "Upload xatoligi"
    return Response.json({ error: message }, { status: 500 })
  }
}
