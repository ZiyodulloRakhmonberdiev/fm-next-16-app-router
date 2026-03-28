import { NextRequest } from "next/server"
import { mapSlugsToNewsTitles } from "@/features/news/lib/admin-news-titles"
import { dbConnect } from "@/shared/common/lib/db"
import { NewsCommentModel } from "@/features/news/model/comment.model"
import { requireAdminSession } from "@/shared/server/require-admin-session"
import { protectPublicApi } from "@/shared/server/protect-api"

export async function GET(req: NextRequest) {
  const unauthorized = await requireAdminSession(["ceo", "administrator", "moderator"])
  if (unauthorized) return unauthorized

  await dbConnect()
  const { searchParams } = new URL(req.url)
  if (searchParams.get("counts") === "1") {
    const [pending, confirmed, rejected] = await Promise.all([
      NewsCommentModel.countDocuments({ status: "pending" }),
      NewsCommentModel.countDocuments({ status: { $in: ["confirmed", "approved"] } }),
      NewsCommentModel.countDocuments({ status: "rejected" }),
    ])
    return Response.json({ pending, confirmed, rejected })
  }

  const status = searchParams.get("status")
  const filter: Record<string, unknown> = {}
  if (status === "confirmed") {
    filter.status = { $in: ["confirmed", "approved"] }
  } else if (status) {
    filter.status = status
  }
  const rows = await NewsCommentModel.find(filter).sort({ createdAt: -1 }).lean()
  const titleMap = await mapSlugsToNewsTitles(
    rows.map((r) => String((r as { newsSlug?: string }).newsSlug ?? ""))
  )
  const data = rows.map((r) => {
    const rec = r as {
      _id: unknown
      newsSlug?: string
      [key: string]: unknown
    }
    const newsSlug = String(rec.newsSlug ?? "")
    return {
      ...rec,
      _id: String(rec._id),
      newsSlug,
      newsTitle: titleMap.get(newsSlug) ?? "",
    }
  })
  return Response.json(data)
}