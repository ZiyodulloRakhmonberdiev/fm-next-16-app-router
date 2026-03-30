import { NextRequest } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/shared/common/lib/auth-options"
import { dbConnect } from "@/shared/common/lib/db"
import { SavedNewsModel } from "@/features/news/model/saved-news.model"
import { NewsModel } from "@/features/news/model/news.model"

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return Response.json({ error: "Unauthorized" }, { status: 401 })
  const { searchParams } = new URL(req.url)
  const page = Math.max(1, Number(searchParams.get("page") ?? 1))
  const limit = Math.min(30, Math.max(1, Number(searchParams.get("limit") ?? 30)))
  const skip = (page - 1) * limit
  await dbConnect()
  const [rows, total] = await Promise.all([
    SavedNewsModel.find({ userId: session.user.id }).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
    SavedNewsModel.countDocuments({ userId: session.user.id }),
  ])
  const ids = Array.from(new Set(rows.map((r) => r.newsId).filter(Boolean) as string[]))
  const slugsLegacy = Array.from(new Set(rows.map((r) => r.newsSlug).filter(Boolean) as string[]))
  const [byId, bySlug] = await Promise.all([
    ids.length > 0
      ? NewsModel.find({ _id: { $in: ids }, status: "published", ad: { $ne: true }, stats: { $ne: true } })
          .select(
            "slug title description images publishedAt videoUrl videoSource categorySlug tagSlugs author minutes views"
          )
          .lean()
      : [],
    slugsLegacy.length > 0
      ? NewsModel.find({ slug: { $in: slugsLegacy }, status: "published", ad: { $ne: true }, stats: { $ne: true } })
          .select(
            "slug title description images publishedAt videoUrl videoSource categorySlug tagSlugs author minutes views"
          )
          .lean()
      : [],
  ])
  const newsById = new Map(byId.map((n) => [String((n as { _id: unknown })._id), n]))
  const newsBySlug = new Map(bySlug.map((n) => [n.slug, n]))

  return Response.json({
    data: rows.map((row) => {
      const news =
        (row.newsId && newsById.get(row.newsId)) ??
        (row.newsSlug && newsBySlug.get(row.newsSlug)) ??
        null
      return { ...row, news }
    }),
    meta: { page, limit, total, totalPages: Math.max(1, Math.ceil(total / limit)) },
  })
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return Response.json({ error: "Unauthorized" }, { status: 401 })
  const body = (await req.json().catch(() => null)) as { newsSlug?: string; newsId?: string } | null
  let newsId = body?.newsId?.trim()
  const newsSlug = body?.newsSlug?.trim()
  if (!newsId && newsSlug) {
    await dbConnect()
    const news = await NewsModel.findOne({ slug: newsSlug, status: "published", ad: { $ne: true }, stats: { $ne: true } }).select("_id slug").lean()
    if (news && (news as { _id?: unknown })._id != null) {
      newsId = String((news as { _id: unknown })._id)
    }
  }
  if (!newsId) {
    return Response.json({ error: "newsId yoki newsSlug talab qilinadi" }, { status: 400 })
  }
  await dbConnect()
  const existing = await SavedNewsModel.findOne({ userId: session.user.id, newsId })
  if (existing) {
    await existing.deleteOne()
    return Response.json({ ok: true, saved: false })
  }
  let slugForDoc = newsSlug
  if (!slugForDoc) {
    const news = await NewsModel.findById(newsId).select("slug status ad").lean()
    if (news && news.status === "published" && news.ad !== true && news.stats !== true) slugForDoc = news.slug
  }
  if (!slugForDoc) {
    return Response.json({ error: "Yangilik topilmadi yoki saqlab bo'lmaydi" }, { status: 404 })
  }
  await SavedNewsModel.create({
    userId: session.user.id,
    newsId,
    ...(slugForDoc ? { newsSlug: slugForDoc } : {}),
  })
  return Response.json({ ok: true, saved: true })
}