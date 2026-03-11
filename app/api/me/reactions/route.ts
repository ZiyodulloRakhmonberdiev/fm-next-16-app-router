import { NextRequest } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/shared/common/lib/auth-options"
import { dbConnect } from "@/shared/common/lib/db"
import { NewsReactionModel } from "@/features/news/model/reaction.model"
import { NewsModel } from "@/features/news/model/news.model"

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return Response.json({ error: "Unauthorized" }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const page = Math.max(1, Number(searchParams.get("page") ?? 1))
  const limit = Math.min(30, Math.max(1, Number(searchParams.get("limit") ?? 30)))
  const skip = (page - 1) * limit

  await dbConnect()
  const [reactions, total] = await Promise.all([
    NewsReactionModel.find({ userId: session.user.id }).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
    NewsReactionModel.countDocuments({ userId: session.user.id }),
  ])
  const slugs = Array.from(new Set(reactions.map((item) => item.newsSlug)))
  const newsList = slugs.length ? await NewsModel.find({ slug: { $in: slugs } }).select("slug title").lean() : []
  const newsMap = new Map(newsList.map((n) => [n.slug, n.title]))

  return Response.json({
    data: reactions.map((item) => ({ ...item, newsTitle: newsMap.get(item.newsSlug) })),
    meta: { page, limit, total, totalPages: Math.max(1, Math.ceil(total / limit)) },
  })
}
