import { NextRequest } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/shared/common/lib/auth-options"
import { dbConnect } from "@/shared/common/lib/db"
import { NewsReactionModel } from "@/features/news/model/reaction.model"

const REACTIONS = ["like", "love", "laugh", "sad", "angry"] as const
type ReactionType = (typeof REACTIONS)[number]

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  await dbConnect()
  const session = await getServerSession(authOptions)
  const userId = session?.user?.id
  const anonId = new URL(req.url).searchParams.get("anonId")?.trim()
  const slug = (await params).id

  const rows = await NewsReactionModel.find({ newsSlug: slug }).lean()
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
  const slug = (await params).id
  const userKey = isAuthed ? `user:${session!.user!.id}` : `anon:${anonId}`
  const current = await NewsReactionModel.findOne({ newsSlug: slug, userKey }).lean()
  if (current && current.type === type) {
    await NewsReactionModel.deleteOne({ _id: current._id })
    return Response.json({ ok: true, removed: true })
  }

  try {
    const updated = await NewsReactionModel.findOneAndUpdate(
      { newsSlug: slug, userKey },
      {
        newsSlug: slug,
        userKey,
        ...(isAuthed
          ? {
              userId: session!.user!.id,
              anonId: undefined,
              userName: session!.user!.name || session!.user!.login || "User",
            }
          : {
              // Keep anon users unique even if old DB has legacy unique index on userId.
              userId: `anon:${anonId}`,
              anonId,
              userName: "Guest",
            }),
        type,
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    ).lean()
    return Response.json(updated)
  } catch (error) {
    const message = error instanceof Error ? error.message : "Reaksiya saqlanmadi"
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
  const filter = session?.user?.id
    ? { newsSlug: (await params).id, userKey: `user:${session.user.id}` }
    : { newsSlug: (await params).id, userKey: `anon:${anonId}` }
  await NewsReactionModel.findOneAndDelete(filter)
  return Response.json({ ok: true })
}