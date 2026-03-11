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
  const slugs = Array.from(new Set(rows.map((item) => item.newsSlug)))
  const newsList = slugs.length
    ? await NewsModel.find({ slug: { $in: slugs }, status: "published" })
      .select("slug title images publishedAt")
      .lean()
    : []
  const newsMap = new Map(newsList.map((n) => [n.slug, n]))

  return Response.json({
    data: rows.map((row) => ({ ...row, news: newsMap.get(row.newsSlug) })),
    meta: { page, limit, total, totalPages: Math.max(1, Math.ceil(total / limit)) },
  })
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return Response.json({ error: "Unauthorized" }, { status: 401 })
  const body = (await req.json().catch(() => null)) as { newsSlug?: string } | null
  const newsSlug = body?.newsSlug?.trim()
  if (!newsSlug) {
    return Response.json({ error: "Noto'g'ri payload" }, { status: 400 })
  }
  await dbConnect()
  const existing = await SavedNewsModel.findOne({ userId: session.user.id, newsSlug })
  if (existing) {
    await existing.deleteOne()
    return Response.json({ ok: true, saved: false })
  }
  await SavedNewsModel.create({ userId: session.user.id, newsSlug })
  return Response.json({ ok: true, saved: true })
}
