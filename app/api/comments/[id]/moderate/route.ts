import { NextRequest } from "next/server"
import { dbConnect } from "@/shared/common/lib/db"
import { NewsCommentModel } from "@/features/news/model/comment.model"
import { requireAdminSession } from "@/shared/common/lib/require-admin-session"

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const unauthorized = await requireAdminSession(["ceo", "administrator", "moderator"])
  if (unauthorized) return unauthorized

  const body = (await req.json().catch(() => null)) as { status?: "confirmed" | "rejected" } | null
  if (!body?.status || !["confirmed", "rejected"].includes(body.status)) {
    return Response.json({ error: "Noto'g'ri status" }, { status: 400 })
  }

  await dbConnect()
  const updated = await NewsCommentModel.findByIdAndUpdate(
    (await params).id,
    {
      status: body.status,
      confirmedAt: body.status === "confirmed" ? new Date() : undefined,
    },
    { new: true }
  ).lean()
  if (!updated) return Response.json({ error: "Izoh topilmadi" }, { status: 404 })
  return Response.json(updated)
}