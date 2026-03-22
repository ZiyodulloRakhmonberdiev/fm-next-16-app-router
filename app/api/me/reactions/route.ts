import { NextRequest } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/shared/common/lib/auth-options"
import { dbConnect } from "@/shared/common/lib/db"
import { NewsReactionModel, type ReactionType } from "@/features/news/model/reaction.model"
import { NewsModel } from "@/features/news/model/news.model"

const REACTION_TYPES: ReactionType[] = ["like", "love", "laugh", "sad", "angry"]

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return Response.json({ error: "Unauthorized" }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const page = Math.max(1, Number(searchParams.get("page") ?? 1))
  const limit = Math.min(50, Math.max(1, Number(searchParams.get("limit") ?? 50)))
  const skip = (page - 1) * limit

  const typeParam = searchParams.get("type")
  const typeFilter =
    typeParam && REACTION_TYPES.includes(typeParam as ReactionType)
      ? (typeParam as ReactionType)
      : undefined

  const filter: Record<string, unknown> = { userId: session.user.id }
  if (typeFilter) filter.type = typeFilter

  await dbConnect()
  const [reactions, total] = await Promise.all([
    NewsReactionModel.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
    NewsReactionModel.countDocuments(filter),
  ])
  const slugs = Array.from(new Set(reactions.map((item) => item.newsSlug)))
  const newsList = slugs.length ? await NewsModel.find({ slug: { $in: slugs } }).select("slug title").lean() : []
  const newsMap = new Map(newsList.map((n) => [n.slug, n.title]))

  return Response.json({
    data: reactions.map((item) => ({ ...item, newsTitle: newsMap.get(item.newsSlug) })),
    meta: { page, limit, total, totalPages: Math.max(1, Math.ceil(total / limit)) },
  })
}