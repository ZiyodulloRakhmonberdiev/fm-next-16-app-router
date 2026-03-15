import { NextRequest } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/shared/common/lib/auth-options"
import { dbConnect } from "@/shared/common/lib/db"
import { NewsReactionModel } from "@/features/news/model/reaction.model"
import { NewsModel } from "@/features/news/model/news.model"

const REACTIONS = ["like", "love", "laugh", "sad", "angry"] as const
type ReactionType = (typeof REACTIONS)[number]

const newsFilter = (id: string) => ({
  $or: [{ newsId: id }, { newsSlug: id }],
})

let oldIndexDropped = false
async function dropOldReactionIndex() {
  if (oldIndexDropped) return
  oldIndexDropped = true
  try {
    await NewsReactionModel.collection.dropIndex("newsSlug_1_userId_1")
  } catch {
    // index may not exist
  }
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  await dbConnect()
  const session = await getServerSession(authOptions)
  const userId = session?.user?.id
  const anonId = new URL(req.url).searchParams.get("anonId")?.trim()
  const id = (await params).id

  const rows = await NewsReactionModel.find(newsFilter(id)).lean()
  const counts: Record<ReactionType, number> = {
    like: 0,
    love: 0,
    laugh: 0,
    sad: 0,
    angry: 0,
  }
  let myReaction: ReactionType | null = null
  for (const row of rows) {
    if (REACTIONS.includes(row.type as ReactionType)) {
      counts[row.type as ReactionType] += 1
    }
    if (userId && row.userId === userId) myReaction = row.type as ReactionType
    if (!userId && anonId && row.anonId === anonId) myReaction = row.type as ReactionType
  }

  return Response.json({ counts, myReaction })
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const body = (await req.json().catch(() => null)) as { type?: ReactionType } | null
  const type = body?.type
  if (!type || !REACTIONS.includes(type)) {
    return Response.json({ error: "Noto'g'ri reaction turi" }, { status: 400 })
  }
  const session = await getServerSession(authOptions)
  const anonId = req.headers.get("x-anon-id")?.trim()
  const isAuthed = Boolean(session?.user?.id)
  if (!isAuthed && !anonId) {
    return Response.json({ error: "Anon ID talab qilinadi" }, { status: 400 })
  }
  await dbConnect()
  await dropOldReactionIndex()
  const idParam = (await params).id
  const news = (await NewsModel.findById(idParam).select("slug").lean()) ?? (await NewsModel.findOne({ slug: idParam }).select("slug").lean())
  if (!news) return Response.json({ error: "Yangilik topilmadi" }, { status: 404 })
  const newsSlug = news.slug
  const newsId = (news as { _id?: unknown })._id != null ? String((news as { _id?: unknown })._id) : idParam

  const userKey = isAuthed ? `user:${session!.user!.id}` : `anon:${anonId}`
  const userReactionFilter = {
    $or: [
      { newsSlug, userKey },
      { newsId: String(newsId), userKey },
    ],
  }
  const current = await NewsReactionModel.findOne(userReactionFilter).lean()

  if (current && current.type === type) {
    await NewsReactionModel.deleteOne({ _id: current._id })
    return Response.json({ ok: true, removed: true })
  }

  const updatePayload = {
    newsSlug,
    newsId: String(newsId),
    userKey,
    type,
    ...(isAuthed
      ? {
          userId: session!.user!.id,
          userName: session!.user!.name || session!.user!.login || "User",
        }
      : {
          userId: `anon:${anonId}`,
          anonId,
          userName: "Guest",
        }),
  }

  if (current) {
    const updated = await NewsReactionModel.findByIdAndUpdate(
      current._id,
      { $set: updatePayload },
      { new: true }
    ).lean()
    return Response.json(updated)
  }

  try {
    const created = await NewsReactionModel.create(updatePayload)
    const plain = created.toObject ? created.toObject() : (created as unknown as Record<string, unknown>)
    return Response.json(plain, { status: 201 })
  } catch (err: unknown) {
    const e = err as Error & { code?: number }
    if (e.code === 11000) {
      const bySlug = await NewsReactionModel.findOne({ newsSlug, userKey }).lean()
      if (bySlug) {
        const updated = await NewsReactionModel.findByIdAndUpdate(
          bySlug._id,
          { $set: updatePayload },
          { new: true }
        ).lean()
        return Response.json(updated)
      }
      if (isAuthed && session?.user?.id) {
        const byUserId = await NewsReactionModel.findOne({
          newsSlug,
          userId: session.user.id,
        }).lean()
        if (byUserId) {
          const updated = await NewsReactionModel.findByIdAndUpdate(
            byUserId._id,
            { $set: updatePayload },
            { new: true }
          ).lean()
          return Response.json(updated)
        }
      }
    }
    const message = e.message ?? "Reaksiya saqlanmadi"
    return Response.json({ error: message }, { status: 500 })
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions)
  const anonId = req.headers.get("x-anon-id")?.trim()
  if (!session?.user?.id && !anonId) return Response.json({ error: "Unauthorized" }, { status: 401 })
  await dbConnect()
  const id = (await params).id
  const baseFilter = newsFilter(id)
  const filter = session?.user?.id
    ? { ...baseFilter, userKey: `user:${session.user.id}` }
    : { ...baseFilter, userKey: `anon:${anonId}` }
  await NewsReactionModel.findOneAndDelete(filter)
  return Response.json({ ok: true })
}