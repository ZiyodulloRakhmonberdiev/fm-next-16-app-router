import { NextRequest } from "next/server"
import { dbConnect } from "@/shared/common/lib/db"
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
  const updated = await TeamMemberModel.findByIdAndUpdate(id, parsed.data, {
    new: true,
  }).lean()
  if (!updated) {
    return Response.json({ error: "Topilmadi" }, { status: 404 })
  }
  return Response.json(updated)
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const unauthorized = await requireAdminSession(["ceo", "administrator"])
  if (unauthorized) return unauthorized

  await dbConnect()
  const id = (await params).id
  const deleted = await TeamMemberModel.findByIdAndDelete(id).lean()
  if (!deleted) {
    return Response.json({ error: "Topilmadi" }, { status: 404 })
  }
  return Response.json({ ok: true })
}