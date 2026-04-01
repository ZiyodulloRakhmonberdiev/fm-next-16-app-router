import { NextRequest } from "next/server"
import { dbConnect } from "@/shared/common/lib/db"
import { isClientDeliveryEnabled } from "@/shared/server/server-client-delivery"
import { AdModel } from "@/features/ads/model/ads.model"
import { createAdSchema } from "@/features/ads/model/schemas"
import { requireAdminSession } from "@/shared/server/require-admin-session"
import { protectPublicApi } from "@/shared/server/protect-api"
import { CACHE_TIMINGS, publicCacheHeaders } from "@/shared/common/lib/http-cache"

export async function GET(req: NextRequest) {
  const isProtected = await protectPublicApi(req)
  if (isProtected) return isProtected

  const { searchParams } = new URL(req.url)
  const isPublic = searchParams.get("public") === "1"
  const placement = searchParams.get("placement")

  if (isPublic) {
    const allowed = await isClientDeliveryEnabled("ads")
    if (!allowed) return Response.json([])
  }

  await dbConnect()
  if (isPublic) {
    const now = new Date()
    const filter: Record<string, unknown> = {
      active: true,
      $and: [
        { $or: [{ startAt: { $exists: false } }, { startAt: null }, { startAt: { $lte: now } }] },
        { $or: [{ endAt: { $exists: false } }, { endAt: null }, { endAt: { $gte: now } }] },
      ],
    }
    if (placement) {
      filter.$or = [{ placements: placement }, { placement }]
    }
    // Hozircha priority ishlatilmaydi, oddiy tartib: oxirgisi birinchi.
    const ads = await AdModel.find(filter).sort({ createdAt: -1 }).lean()
    return Response.json(ads, {
      headers: publicCacheHeaders(CACHE_TIMINGS.ads.maxAge, CACHE_TIMINGS.ads.stale),
    })
  }

  const unauthorized = await requireAdminSession(["ceo", "administrator", "ads_manager"])
  if (unauthorized) return unauthorized

  const filter: Record<string, unknown> = {}
  if (placement) {
    filter.$or = [{ placements: placement }, { placement }]
  }
  const ads = await AdModel.find(filter).sort({ createdAt: -1 }).lean()
  return Response.json(ads)
}

export async function POST(req: NextRequest) {
  const unauthorized = await requireAdminSession(["ceo", "administrator", "ads_manager"])
  if (unauthorized) return unauthorized

  await dbConnect()
  let json: unknown
  try {
    json = await req.json()
  } catch {
    return Response.json({ error: "JSON o'qib bo'lmadi", issues: { fieldErrors: {}, formErrors: ["Body JSON bo'lishi kerak"] } }, { status: 400 })
  }
  const parsed = createAdSchema.safeParse(json)
  if (!parsed.success) {
    const issues = parsed.error.flatten()
    const msg = Object.values(issues.fieldErrors).flat().join("; ") || issues.formErrors?.join("; ") || "Validatsiya xatosi"
    return Response.json({ error: msg, issues }, { status: 400 })
  }
  try {
    const ad = await AdModel.create({
      ...parsed.data,
      media: parsed.data.media?.length ? parsed.data.media : undefined,
      mediaMobile: parsed.data.mediaMobile?.length ? parsed.data.mediaMobile : undefined,
      logo: parsed.data.logo || undefined,
      description: parsed.data.description || undefined,
      adUrl: parsed.data.adUrl || undefined,
      advertiserUrl: parsed.data.advertiserUrl || undefined,
      adInfoUrl: parsed.data.adInfoUrl || undefined,
      advertiseWithUsUrl: parsed.data.advertiseWithUsUrl || undefined,
      links: parsed.data.links ?? [],
    })
    return Response.json(ad, { status: 201 })
  } catch (err) {
    const message = err instanceof Error ? err.message : "Reklama yaratib bo'lmadi"
    return Response.json({ error: message, issues: { fieldErrors: {}, formErrors: [message] } }, { status: 500 })
  }
}
