import { NextRequest } from "next/server"
import { dbConnect } from "@/shared/common/lib/db"
import { NewsReactionModel } from "@/features/news/model/reaction.model"
import { requireAdminSession } from "@/shared/common/lib/require-admin-session"

export async function GET(req: NextRequest) {
  const unauthorized = await requireAdminSession(["ceo", "administrator", "moderator"])
  if (unauthorized) return unauthorized

  await dbConnect()
  const { searchParams } = new URL(req.url)
  const page = Math.max(1, parseInt(searchParams.get("page") ?? "1", 10))
  const limit = Math.min(50, Math.max(1, parseInt(searchParams.get("limit") ?? "30", 10)))
  const type = searchParams.get("type")
  const q = searchParams.get("q")?.trim()

  const filter: Record<string, unknown> = {}
  if (type && type !== "all") {
    filter.type = type
  }
  if (q) {
    filter.$or = [
      { newsSlug: { $regex: q, $options: "i" } },
      { userName: { $regex: q, $options: "i" } },
    ]
  }

  const total = await NewsReactionModel.countDocuments(filter)
  const totalPages = Math.max(1, Math.ceil(total / limit))
  const skip = (page - 1) * limit

  const rows = await NewsReactionModel.find(filter)
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .lean()

  const data = rows.map((r) => ({
    _id: String(r._id),
    newsSlug: String(r.newsSlug ?? ""),
    userId: r.userId != null ? String(r.userId) : undefined,
    anonId: r.anonId != null ? String(r.anonId) : undefined,
    userName: String(r.userName ?? ""),
    type: r.type,
    createdAt:
      r.createdAt instanceof Date ? r.createdAt.toISOString() : typeof r.createdAt === "string" ? r.createdAt : "",
  }))

  return Response.json({
    data,
    meta: { total, page, limit, totalPages },
    count: total,
  })
}