import { NextRequest } from "next/server"
import { dbConnect } from "@/shared/common/lib/db"
import { isClientDeliveryEnabled } from "@/shared/common/lib/server-client-delivery"
import { mapTeamDocToClient } from "@/features/team/lib/team-api-map"
import { TeamMemberModel } from "@/features/team/model/team.model"
import { createTeamMemberSchema } from "@/features/team/model/schemas"
import { requireAdminSession } from "@/shared/common/lib/require-admin-session"
import { protectPublicApi } from "@/shared/common/lib/protect-api"
import { CACHE_TIMINGS, publicCacheHeaders } from "@/shared/common/lib/http-cache"

export async function GET(req: NextRequest) {
  const isProtected = await protectPublicApi(req)
  if (isProtected) return isProtected

  const isPublic = new URL(req.url).searchParams.get("public") === "1"
  if (isPublic) {
    const allowed = await isClientDeliveryEnabled("team")
    if (!allowed) return Response.json([])
  }

  await dbConnect()
  const rows = await TeamMemberModel.find()
    .sort({ certificateNumber: 1, createdAt: 1 })
    .lean()
  const mapped = rows.map((r) => mapTeamDocToClient(r))
  if (isPublic) {
    return Response.json(mapped, {
      headers: publicCacheHeaders(CACHE_TIMINGS.team.maxAge, CACHE_TIMINGS.team.stale),
    })
  }
  const unauthorized = await requireAdminSession(["ceo", "administrator"])
  if (unauthorized) return unauthorized
  return Response.json(mapped)
}

export async function POST(req: NextRequest) {
  const unauthorized = await requireAdminSession(["ceo", "administrator"])
  if (unauthorized) return unauthorized

  await dbConnect()
  const json = await req.json()
  const parsed = createTeamMemberSchema.safeParse(json)
  if (!parsed.success) {
    return Response.json(
      { error: "Validation error", issues: parsed.error.flatten() },
      { status: 400 }
    )
  }

  const d = parsed.data
  try {
    const created = await TeamMemberModel.create({
      fullName: d.fullName,
      position: d.position,
      certificateNumber: d.certificateNumber,
      ...(d.image && d.image !== "" ? { image: d.image } : {}),
      ...(d.qrCode && d.qrCode !== "" ? { qrCode: d.qrCode } : {}),
      ...(d.badgeImage && d.badgeImage !== "" ? { badgeImage: d.badgeImage } : {}),
    })
    const plain = created.toObject()
    return Response.json(mapTeamDocToClient(plain), { status: 201 })
  } catch (err) {
    const message = err instanceof Error ? err.message : "Saqlashda xatolik"
    return Response.json({ error: message }, { status: 500 })
  }
}
