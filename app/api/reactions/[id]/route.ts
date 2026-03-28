import { NextRequest } from "next/server"
import { dbConnect } from "@/shared/common/lib/db"
import { requireAdminSession } from "@/shared/server/require-admin-session"
import { NewsReactionModel } from "@/features/news/model/reaction.model"

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const unauthorized = await requireAdminSession(["ceo", "administrator", "moderator"])
  if (unauthorized) return unauthorized

  await dbConnect()
  const id = (await params).id
  const deleted = await NewsReactionModel.findByIdAndDelete(id)
  if (!deleted) {
    return Response.json({ error: "Reaksiya topilmadi" }, { status: 404 })
  }
  return Response.json({ ok: true })
}

