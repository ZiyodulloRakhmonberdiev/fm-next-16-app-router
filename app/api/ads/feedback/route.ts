import { NextRequest } from "next/server"
import { dbConnect } from "@/shared/common/lib/db"
import { AdFeedbackModel } from "@/features/ads/model/ad-feedback.model"
import { AdModel } from "@/features/ads/model/ads.model"
import { requireAdminSession } from "@/shared/server/require-admin-session"
import { protectPublicApi } from "@/shared/server/protect-api"

function mergeUniquePlacements(
  feedbackPlacements: unknown[],
  adPlacementsArray: unknown[],
  adPlacementLegacy: unknown[]
): string[] {
  const set = new Set<string>()
  for (const p of feedbackPlacements) {
    if (typeof p === "string" && p.length > 0) set.add(p)
  }
  for (const p of adPlacementsArray) {
    if (typeof p === "string" && p.length > 0) set.add(p)
  }
  for (const p of adPlacementLegacy) {
    if (typeof p === "string" && p.length > 0) set.add(p)
  }
  return [...set].sort((a, b) => a.localeCompare(b))
}

const FEEDBACK_PAGE_LIMIT = 500

export async function GET(req: NextRequest) {
  const unauthorized = await requireAdminSession(["ceo", "administrator", "ads_manager"])
  if (unauthorized) return unauthorized

  const { searchParams } = new URL(req.url)
  if (searchParams.get("countOnly") === "1") {
    await dbConnect()
    const count = await AdFeedbackModel.countDocuments({})
    return Response.json({ count })
  }

  const action = searchParams.get("action")
  const reason = searchParams.get("reason")?.trim()
  const placement = searchParams.get("placement")?.trim()
  const adId = searchParams.get("adId")?.trim()

  await dbConnect()

  const filter: Record<string, unknown> = {}
  if (action === "hide" || action === "report") {
    filter.action = action
  }
  if (reason) {
    filter.reason = reason
  }
  if (placement) {
    filter.placement = placement
  }
  if (adId) {
    filter.adId = adId
  }

  const [items, allReasons, feedbackPlacements, adPlacementsFromArray, adPlacementsLegacy, allAdIds] =
    await Promise.all([
      AdFeedbackModel.find(filter)
        .sort({ createdAt: -1 })
        .limit(FEEDBACK_PAGE_LIMIT)
        .lean(),
      AdFeedbackModel.distinct("reason"),
      AdFeedbackModel.distinct("placement"),
      AdModel.distinct("placements", { active: true }),
      AdModel.distinct("placement", {
        active: true,
        placement: { $exists: true, $nin: [null, ""] },
      }),
      AdFeedbackModel.distinct("adId"),
    ])

  const byAction: Record<string, number> = {}
  const byReason: Record<string, number> = {}
  for (const row of items) {
    const a = row.action as string
    byAction[a] = (byAction[a] ?? 0) + 1
    const r = row.reason as string
    byReason[r] = (byReason[r] ?? 0) + 1
  }

  const reasonsSorted = (allReasons as string[]).filter(Boolean).sort((x, y) => x.localeCompare(y))
  const placementsSorted = mergeUniquePlacements(
    feedbackPlacements,
    adPlacementsFromArray,
    adPlacementsLegacy
  )
  const adIdsSorted = (allAdIds as string[])
    .filter((id): id is string => typeof id === "string" && id.length > 0)
    .sort((x, y) => x.localeCompare(y))

  return Response.json({
    items,
    summary: {
      total: items.length,
      byAction,
      byReason,
    },
    meta: {
      reasons: reasonsSorted,
      placements: placementsSorted,
      adIds: adIdsSorted,
    },
  })
}

export async function POST(req: NextRequest) {
  const isProtected = await protectPublicApi(req)
  if (isProtected) return isProtected

  const body = (await req.json().catch(() => null)) as
    | { adId?: string; action?: "hide" | "report"; reason?: string; placement?: string }
    | null
  const adId = body?.adId?.trim()
  const action = body?.action
  const reason = body?.reason?.trim()

  if (!adId || !action || !reason) {
    return Response.json({ error: "Noto'g'ri payload" }, { status: 400 })
  }

  await dbConnect()
  await AdFeedbackModel.create({
    adId,
    action,
    reason,
    placement: body?.placement,
  })

  return Response.json({ ok: true })
}
