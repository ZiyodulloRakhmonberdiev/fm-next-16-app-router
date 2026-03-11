import { NextRequest } from "next/server"
import { dbConnect } from "@/shared/common/lib/db"
import { AdModel } from "@/features/ads/model/ads.model"
import { createAdSchema } from "@/features/ads/model/schemas"
import { requireAdminSession } from "@/shared/common/lib/require-admin-session"

export async function GET(req: NextRequest) {
  await dbConnect()
  const { searchParams } = new URL(req.url)
  const isPublic = searchParams.get("public") === "1"
  const placement = searchParams.get("placement")

  if (isPublic) {
    const now = new Date()
    const filter: Record<string, unknown> = {
      active: true,
      $and: [
        { $or: [{ startAt: { $exists: false } }, { startAt: null }, { startAt: { $lte: now } }] },
        { $or: [{ endAt: { $exists: false } }, { endAt: null }, { endAt: { $gte: now } }] },
      ],
    }
    if (placement) filter.placement = placement
    const ads = await AdModel.find(filter).sort({ priority: -1, createdAt: -1 }).lean()
    return Response.json(ads)
  }

  const unauthorized = await requireAdminSession(["ceo", "administrator", "ads_manager"])
  if (unauthorized) return unauthorized

  const filter: Record<string, unknown> = {}
  if (placement) filter.placement = placement
  const ads = await AdModel.find(filter).sort({ createdAt: -1 }).lean()
  return Response.json(ads)
}

export async function POST(req: NextRequest) {
  const unauthorized = await requireAdminSession(["ceo", "administrator", "ads_manager"])
  if (unauthorized) return unauthorized

  await dbConnect()
  const json = await req.json()
  const parsed = createAdSchema.safeParse(json)
  if (!parsed.success) {
    return Response.json({ error: "Validation error", issues: parsed.error.flatten() }, { status: 400 })
  }
  const ad = await AdModel.create({
    ...parsed.data,
    media: parsed.data.media || undefined,
    logo: parsed.data.logo || undefined,
    description: parsed.data.description || undefined,
    adUrl: parsed.data.adUrl || undefined,
    advertiserUrl: parsed.data.advertiserUrl || undefined,
    adInfoUrl: parsed.data.adInfoUrl || undefined,
    advertiseWithUsUrl: parsed.data.advertiseWithUsUrl || undefined,
    links: (parsed.data.links ?? []).filter((item) => item.label.trim() && item.href.trim()),
  })
  return Response.json(ad, { status: 201 })
}
