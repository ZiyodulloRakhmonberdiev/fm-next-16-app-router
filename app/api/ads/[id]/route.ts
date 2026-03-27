import { NextRequest } from "next/server"
import { dbConnect } from "@/shared/common/lib/db"
import { AdModel } from "@/features/ads/model/ads.model"
import { createAdSchema, createAdSchemaInput } from "@/features/ads/model/schemas"
import { requireAdminSession } from "@/shared/common/lib/require-admin-session"

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const unauthorized = await requireAdminSession(["ceo", "administrator", "ads_manager"])
  if (unauthorized) return unauthorized

  await dbConnect()
  const parsed = createAdSchema.safeParse(await req.json())
  if (!parsed.success) {
    const issues = parsed.error.flatten()
    const msg = Object.values(issues.fieldErrors).flat().join("; ") || issues.formErrors?.join("; ") || "Validatsiya xatosi"
    return Response.json({ error: msg, issues }, { status: 400 })
  }
  const { type, placements, placement, siteName, title, active, priority, displaySeconds } = parsed.data
  const links = parsed.data.links ?? []
  const update: Record<string, unknown> = {
    type,
    placements,
    placement,
    siteName,
    title,
    description: parsed.data.description || undefined,
    logo: parsed.data.logo || undefined,
    media: parsed.data.media?.length ? parsed.data.media : undefined,
    mediaMobile: parsed.data.mediaMobile?.length ? parsed.data.mediaMobile : undefined,
    adUrl: parsed.data.adUrl || undefined,
    advertiserUrl: parsed.data.advertiserUrl || undefined,
    adInfoUrl: parsed.data.adInfoUrl || undefined,
    advertiseWithUsUrl: parsed.data.advertiseWithUsUrl || undefined,
    active,
    priority,
    displaySeconds,
    links,
  }
  const updated = await AdModel.findByIdAndUpdate((await params).id, { $set: update }, { new: true, runValidators: true }).lean()
  if (!updated) return Response.json({ error: "Reklama topilmadi" }, { status: 404 })
  return Response.json(updated)
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const unauthorized = await requireAdminSession(["ceo", "administrator", "ads_manager"])
  if (unauthorized) return unauthorized

  await dbConnect()
  const parsed = createAdSchemaInput.partial().safeParse(await req.json())
  if (!parsed.success) {
    return Response.json({ error: "Validation error", issues: parsed.error.flatten() }, { status: 400 })
  }
  const payload = { ...parsed.data } as Record<string, unknown>
  if (!Array.isArray(payload.placements) && typeof payload.placement === "string") {
    payload.placements = [payload.placement]
  }
  if (Array.isArray(payload.placements) && payload.placements.length > 0) {
    payload.placement = String(payload.placements[0])
  }
  if (payload.media === "") payload.media = undefined
  if (payload.logo === "") payload.logo = undefined
  if (payload.description === "") payload.description = undefined
  if (payload.adUrl === "") payload.adUrl = undefined
  if (payload.advertiserUrl === "") payload.advertiserUrl = undefined
  if (payload.adInfoUrl === "") payload.adInfoUrl = undefined
  if (payload.advertiseWithUsUrl === "") payload.advertiseWithUsUrl = undefined

  const updated = await AdModel.findByIdAndUpdate((await params).id, payload, {
    new: true,
    runValidators: true,
  }).lean()
  if (!updated) return Response.json({ error: "Reklama topilmadi" }, { status: 404 })
  return Response.json(updated)
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const unauthorized = await requireAdminSession(["ceo", "administrator", "ads_manager"])
  if (unauthorized) return unauthorized

  await dbConnect()
  const deleted = await AdModel.findByIdAndDelete((await params).id).lean()
  if (!deleted) return Response.json({ error: "Reklama topilmadi" }, { status: 404 })
  return Response.json({ ok: true })
}
