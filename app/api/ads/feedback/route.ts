import { NextRequest } from "next/server"
import { dbConnect } from "@/shared/common/lib/db"
import { AdFeedbackModel } from "@/features/ads/model/ad-feedback.model"

export async function POST(req: NextRequest) {
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
