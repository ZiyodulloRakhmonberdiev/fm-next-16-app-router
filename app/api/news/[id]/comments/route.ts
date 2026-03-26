import { NextRequest } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/shared/common/lib/auth-options"
import { dbConnect } from "@/shared/common/lib/db"
import { NewsCommentModel } from "@/features/news/model/comment.model"
import { UserModel } from "@/features/users/model/user.model"
import { NewsModel } from "@/features/news/model/news.model"
import { normalizeRole } from "@/shared/common/lib/rbac"
import {
  SiteSettingsModel,
  SITE_SETTINGS_DOCUMENT_ID,
  leanDocToPayload,
} from "@/features/dashboard/configs/site-settings.model"
import { sendPendingCommentAlertToTelegram } from "@/shared/common/lib/database-backup"

const newsFilter = (id: string) => ({
  $or: [{ newsId: id }, { newsSlug: id }],
})

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  await dbConnect()
  const session = await getServerSession(authOptions)
  const userId = session?.user?.id
  const id = (await params).id

  const { searchParams } = new URL(req.url)
  const limit = Math.min(50, Math.max(1, Number(searchParams.get("limit") ?? 5)))
  const offset = Math.max(0, Number(searchParams.get("offset") ?? 0))

  const filter = newsFilter(id)

  let minePending: unknown[] = []
  if (userId) {
    minePending = await NewsCommentModel.find({ ...filter, userId, status: "pending" })
      .sort({ createdAt: -1 })
      .lean()
  }

  const visiblePublic = await NewsCommentModel.find({
    ...filter,
    status: { $in: ["confirmed", "approved"] },
  })
    .sort({ createdAt: 1 })
    .skip(offset)
    .limit(limit)
    .lean()
  const totalPublic = await NewsCommentModel.countDocuments({
    ...filter,
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
  const newsId = (await params).id

  const news = await NewsModel.findById(newsId).select("slug title").lean()
  if (!news) return Response.json({ error: "Yangilik topilmadi" }, { status: 404 })
  const newsSlug = news.slug

  let replyToUserLogin: string | undefined
  if (body?.replyToCommentId) {
    const parent = await NewsCommentModel.findById(body.replyToCommentId).lean()
    const parentBelongsToNews =
      parent && (parent.newsId === newsId || parent.newsSlug === newsSlug)
    if (!parent || !parentBelongsToNews) {
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
    newsId: String(newsId),
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
  if (status === "pending") {
    const titleObj = (news as { title?: Record<string, string | undefined> }).title
    const title =
      titleObj?.uzb?.trim() ||
      titleObj?.uz?.trim() ||
      titleObj?.ru?.trim() ||
      titleObj?.en?.trim() ||
      "Yangilik"
    const origin = new URL(req.url).origin
    const settingsDoc = await SiteSettingsModel.findById(SITE_SETTINGS_DOCUMENT_ID).lean()
    const settingsPayload = leanDocToPayload(settingsDoc)
    const backupSettings = settingsPayload?.databaseBackup
    if (backupSettings?.botToken?.trim() && backupSettings?.chatId?.trim()) {
      const tg = await sendPendingCommentAlertToTelegram({
        settings: backupSettings,
        requestOrigin: origin,
        newsTitle: title,
        commentText: content,
      })
      if (tg.ok && tg.messageId) {
        comment.pendingTelegramMessageId = tg.messageId
        await comment.save()
      }
    }
  }

  const plain = comment.toObject ? comment.toObject() : (comment as unknown as Record<string, unknown>)

  return Response.json(plain, { status: 201 })
}