import { NextRequest } from "next/server"
import { dbConnect } from "@/shared/common/lib/db"
import { mapTeamDocToClient } from "@/features/team/lib/team-api-map"
import { TeamMemberModel } from "@/features/team/model/team.model"
import { updateTeamMemberSchema } from "@/features/team/model/schemas"
import { requireAdminSession } from "@/shared/common/lib/require-admin-session"

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const unauthorized = await requireAdminSession(["ceo", "administrator"])
  if (unauthorized) return unauthorized

  await dbConnect()
  const id = (await params).id
  const json = await req.json()
  const parsed = updateTeamMemberSchema.safeParse(json)
  if (!parsed.success) {
    return Response.json(
      { error: "Validation error", issues: parsed.error.flatten() },
      { status: 400 }
    )
  }

  const $set = Object.fromEntries(
    Object.entries(parsed.data).filter(([, v]) => v !== undefined)
  ) as Record<string, unknown>
  if (Object.keys($set).length === 0) {
    return Response.json({ error: "Yangilanadigan maydon yo'q" }, { status: 400 })
  }

  const updateDoc: { $set: Record<string, unknown>; $unset?: Record<string, string> } = {
    $set,
  }
  if (Object.prototype.hasOwnProperty.call($set, "certificateNumber")) {
    updateDoc.$unset = { order: "" }
  }

  try {
    const updated = await TeamMemberModel.findOneAndUpdate(
      { _id: id },
      updateDoc,
      { new: true, runValidators: true }
    ).lean()
    if (!updated) {
      return Response.json({ error: "Topilmadi" }, { status: 404 })
    }
    return Response.json(mapTeamDocToClient(updated))
  } catch (err) {
    const message = err instanceof Error ? err.message : "Yangilashda xatolik"
    return Response.json({ error: message }, { status: 500 })
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const unauthorized = await requireAdminSession(["ceo", "administrator"])
  if (unauthorized) return unauthorized

  await dbConnect()
  const id = (await params).id
  const deleted = await TeamMemberModel.findOneAndDelete({ _id: id }).lean()
  if (!deleted) {
    return Response.json({ error: "Topilmadi" }, { status: 404 })
  }
  return Response.json({ ok: true })
}
