import { NextRequest } from "next/server"
import { dbConnect } from "@/shared/common/lib/db"
import { NewsCommentModel } from "@/features/news/model/comment.model"
import { requireAdminSession } from "@/shared/common/lib/require-admin-session"

export async function GET(req: NextRequest) {
  const unauthorized = await requireAdminSession(["ceo", "administrator", "moderator"])
  if (unauthorized) return unauthorized

  await dbConnect()
  const status = new URL(req.url).searchParams.get("status")
  const filter: Record<string, unknown> = {}
  if (status === "confirmed") {
    filter.status = { $in: ["confirmed", "approved"] }
  } else if (status) {
    filter.status = status
  }
  const rows = await NewsCommentModel.find(filter).sort({ createdAt: -1 }).lean()
  return Response.json(rows)
}
