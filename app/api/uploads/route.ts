import { randomUUID } from "node:crypto"
import { mkdir, writeFile } from "node:fs/promises"
import path from "node:path"
import { NextRequest } from "next/server"
import { requireAdminSession } from "@/shared/common/lib/require-admin-session"

const IMAGE_EXTENSIONS = new Set([".jpg", ".jpeg", ".png", ".webp", ".gif", ".svg"])
const VIDEO_EXTENSIONS = new Set([".mp4", ".webm", ".ogg", ".mov", ".m4v"])

function sanitizeBaseName(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9-_]/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
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

    const apiBase = process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "")

    if (apiBase) {
      const vpsFormData = new FormData()
      vpsFormData.set("file", file)
      vpsFormData.set("kind", kind)
      const headers: HeadersInit = {}
      const secret = process.env.UPLOAD_VPS_SECRET
      if (secret) headers["X-Upload-Secret"] = secret
      const res = await fetch(`${apiBase}/api/uploads`, {
        method: "POST",
        headers,
        body: vpsFormData,
      })
      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        const msg = (err as { error?: string })?.error || `VPS upload: ${res.status}`
        const userMsg =
          res.status === 401
            ? "VPS ruxsat rad etdi. .env da UPLOAD_VPS_SECRET va VPS da UPLOAD_SECRET bir xil bo‘lishi kerak."
            : msg
        return Response.json({ error: userMsg }, { status: res.status })
      }
      const data = (await res.json()) as { url?: string }
      const pathUrl = data?.url ?? ""
      const fullUrl = pathUrl.startsWith("http") ? pathUrl : apiBase + (pathUrl.startsWith("/") ? pathUrl : `/${pathUrl}`)
      return Response.json({ url: fullUrl })
    }

    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    const base = sanitizeBaseName(path.basename(file.name, ext)) || "media"
    const filename = `${base}-${randomUUID()}${ext}`

    const folder = path.join(process.cwd(), "public", "uploads", kind === "image" ? "images" : "videos")
    await mkdir(folder, { recursive: true })
    const fullPath = path.join(folder, filename)
    await writeFile(fullPath, buffer)
    const url = `/uploads/${kind === "image" ? "images" : "videos"}/${filename}`
    return Response.json({ url })
  } catch (error) {
    const message = error instanceof Error ? error.message : "Upload xatoligi"
    return Response.json({ error: message }, { status: 500 })
  }
}
