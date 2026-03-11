import { NextRequest } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/shared/common/lib/auth-options"
import { dbConnect } from "@/shared/common/lib/db"
import { NewsCommentModel } from "@/features/news/model/comment.model"
import { UserModel } from "@/features/users/model/user.model"
import { normalizeRole } from "@/shared/common/lib/rbac"

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  await dbConnect()
  const session = await getServerSession(authOptions)
  const userId = session?.user?.id
  const slug = (await params).id

  const { searchParams } = new URL(req.url)
  const limit = Math.min(50, Math.max(1, Number(searchParams.get("limit") ?? 5)))
  const offset = Math.max(0, Number(searchParams.get("offset") ?? 0))

  let minePending: unknown[] = []
  if (userId) {
    minePending = await NewsCommentModel.find({ newsSlug: slug, userId, status: "pending" })
      .sort({ createdAt: -1 })
      .lean()
  }

  const visiblePublic = await NewsCommentModel.find({
    newsSlug: slug,
    status: { $in: ["confirmed", "approved"] },
  })
    .sort({ createdAt: 1 })
    .skip(offset)
    .limit(limit)
    .lean()
  const totalPublic = await NewsCommentModel.countDocuments({
    newsSlug: slug,
    status: { $in: ["confirmed", "approved"] },
  })

  return Response.json({
    comments: [...minePending, ...visiblePublic]
      .sort((a, b) => new Date(String(a.createdAt)).getTime() - new Date(String(b.createdAt)).getTime()),
    totalPublic,
    hasMore: offset + limit < totalPublic,
  })
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return Response.json({ error: "Unauthorized" }, { status: 401 })
  }

  const body = (await req.json().catch(() => null)) as { content?: string; replyToCommentId?: string } | null
  const content = body?.content?.trim()
  if (!content) return Response.json({ error: "Izoh matni kerak" }, { status: 400 })
  if (content.length > 512) {
    return Response.json({ error: "Izoh 512 belgidan oshmasligi kerak" }, { status: 400 })
  }

  await dbConnect()
  const me = await UserModel.findById(session.user.id).lean()

  let replyToUserLogin: string | undefined
  const newsSlug = (await params).id
  if (body?.replyToCommentId) {
    const parent = await NewsCommentModel.findById(body.replyToCommentId).lean()
    if (!parent || parent.newsSlug !== newsSlug) {
      return Response.json({ error: "Javob beriladigan izoh topilmadi" }, { status: 404 })
    }
    if (parent.replyToCommentId) {
      return Response.json({ error: "Sub-izohga javob berib bo'lmaydi" }, { status: 400 })
    }
    replyToUserLogin = parent?.userLogin || undefined
  }

  const role = normalizeRole(me?.role)
  const isTrustedCommenter =
    role === "ceo" || role === "administrator" || role === "moderator"
  const status = isTrustedCommenter ? "confirmed" : "pending"
  const confirmedAt = isTrustedCommenter ? new Date() : undefined

  const comment = await NewsCommentModel.create({
    newsSlug,
    userId: session.user.id,
    userName: session.user.name || session.user.login || "User",
    userLogin: session.user.login || undefined,
    userPosition: me?.position || undefined,
    content,
    status,
    confirmedAt,
    replyToCommentId: body?.replyToCommentId || undefined,
    replyToUserLogin,
  })
  return Response.json(comment, { status: 201 })
}
