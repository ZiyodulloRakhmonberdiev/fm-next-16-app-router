import { NextRequest } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/shared/common/lib/auth-options"
import { dbConnect } from "@/shared/common/lib/db"
import { NewsCommentModel } from "@/features/news/model/comment.model"
import { normalizeRole } from "@/shared/common/lib/rbac"

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return Response.json({ error: "Unauthorized" }, { status: 401 })

  await dbConnect()
  const comment = await NewsCommentModel.findById((await params).id)
  if (!comment) return Response.json({ error: "Izoh topilmadi" }, { status: 404 })

  const role = normalizeRole(session.user.role)
  const canDeleteAsStaff = role === "ceo" || role === "administrator" || role === "moderator"
  if (!canDeleteAsStaff && comment.userId !== session.user.id) {
    return Response.json({ error: "Forbidden" }, { status: 403 })
  }

  await comment.deleteOne()
  return Response.json({ ok: true })
}