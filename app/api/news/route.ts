import { NextRequest } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/shared/common/lib/auth-options'
import { dbConnect } from '@/shared/common/lib/db'
import { NewsModel } from '@/features/news/model/news.model'
import { NewsCommentModel } from '@/features/news/model/comment.model'
import { NewsReactionModel } from '@/features/news/model/reaction.model'
import { createNewsSchema } from '@/features/news/model/schemas'
import { sendNewsToTelegram } from '@/shared/common/lib/telegram'
import { requireAdminSession } from '@/shared/common/lib/require-admin-session'
import type { SortOrder } from 'mongoose'

export async function GET(req: NextRequest) {
  try {
    await dbConnect()

    const { searchParams } = new URL(req.url)
    const status = searchParams.get('status')
    const category = searchParams.get('category')
    const categoryList = searchParams.getAll("category")
    const page = Math.max(1, Number(searchParams.get('page') ?? 1))
    const limit = Math.min(100, Math.max(1, Number(searchParams.get('limit') ?? 20)))
    const sortBy = (searchParams.get("sortBy") ?? "publishedAt").toLowerCase()
    const recentMonths = Number(searchParams.get("recentMonths") ?? 0)
    const top = searchParams.get("top")
    const authorsChoice = searchParams.get("authorsChoice") ?? searchParams.get("authors_choice")
    const breaking = searchParams.get("breaking") ?? searchParams.get("isBreaking")
    const video = searchParams.get("video") ?? searchParams.get("hasVideo") ?? searchParams.get("has_video")
    const skip = (page - 1) * limit

    const filter: Record<string, unknown> = {}
    if (status) filter.status = status
    const categorySlugs = [
      ...categoryList.flatMap((v) => String(v).split(",").map((s) => s.trim()).filter(Boolean)),
      ...(category ? String(category).split(",").map((s) => s.trim()).filter(Boolean) : []),
    ]
    const uniqueCategorySlugs = Array.from(new Set(categorySlugs))
    if (uniqueCategorySlugs.length === 1) {
      filter.categorySlug = uniqueCategorySlugs[0]
    } else if (uniqueCategorySlugs.length > 1) {
      filter.categorySlug = { $in: uniqueCategorySlugs }
    }
    if (top === "1" || top === "true") filter.isTop = true
    if (authorsChoice === "1" || authorsChoice === "true") filter.authorsChoice = true
    if (breaking === "1" || breaking === "true") filter.isBreaking = true
    /** UI (`video-news-section-2`): `type === "video"` yoki `videoSource` + `videoUrl` */
    if (video === "1" || video === "true") {
      filter.$or = [
        { type: "video", videoUrl: { $exists: true, $ne: "" } },
        {
          videoUrl: { $exists: true, $ne: "" },
          videoSource: { $in: ["youtube", "local"] },
        },
      ]
    }
    if (Number.isFinite(recentMonths) && recentMonths > 0) {
      const now = new Date()
      const from = new Date(now)
      from.setMonth(from.getMonth() - Math.floor(recentMonths))
      filter.publishedAt = { $gte: from }
    }

    /** `views` bo‘lsa faqat ko‘rishlar bo‘yicha (publishedAt ikkinchi tartibda); aks holda nashr sanasi. */
    const sort: Record<string, SortOrder> =
      sortBy === 'views'
        ? { views: -1, publishedAt: -1 }
        : { publishedAt: -1 }

    const [news, total] = await Promise.all([
      NewsModel.find(filter)
        .sort(sort)
        .skip(skip)
        .limit(limit)
        .lean(),
      NewsModel.countDocuments(filter),
    ])

    const slugs = news.map((n) => n.slug).filter(Boolean)
    const commentBySlug = new Map<string, number>()
    const reactionBySlug = new Map<string, number>()
    if (slugs.length > 0) {
      const [commentAgg, reactionAgg] = await Promise.all([
        NewsCommentModel.aggregate<{ _id: string; count: number }>([
          {
            $match: {
              newsSlug: { $in: slugs },
              status: { $in: ['confirmed', 'approved'] },
            },
          },
          { $group: { _id: '$newsSlug', count: { $sum: 1 } } },
        ]),
        NewsReactionModel.aggregate<{ _id: string; count: number }>([
          { $match: { newsSlug: { $in: slugs } } },
          { $group: { _id: '$newsSlug', count: { $sum: 1 } } },
        ]),
      ])
      for (const row of commentAgg) {
        if (row._id) commentBySlug.set(String(row._id), row.count)
      }
      for (const row of reactionAgg) {
        if (row._id) reactionBySlug.set(String(row._id), row.count)
      }
    }

    const data = news.map((n) => ({
      ...n,
      commentCount: commentBySlug.get(n.slug) ?? 0,
      reactionCount: reactionBySlug.get(n.slug) ?? 0,
    }))

    return Response.json({
      data,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'DB xatosi'
    console.error('[api/news GET]', message)
    return Response.json(
      { error: 'MongoDB ga ulanish amalga oshmadi', details: message },
      { status: 503 }
    )
  }
}

function creatorDisplayName(user: {
  name?: string | null
  email?: string | null
  login?: string | null
}): string {
  const n = user.name?.trim()
  if (n) return n
  const l = user.login?.trim()
  if (l) return l
  const e = user.email?.trim()
  if (e) return e
  return "Noma'lum"
}

export async function POST(req: NextRequest) {
  const unauthorized = await requireAdminSession(['ceo', 'administrator', 'moderator'])
  if (unauthorized) return unauthorized

  const session = await getServerSession(authOptions)
  const sessionUser = session?.user
  if (!sessionUser?.id) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    await dbConnect()
    const json = await req.json()

    const parsed = createNewsSchema.safeParse(json)
    if (!parsed.success) {
      return Response.json(
        { error: 'Validation error', issues: parsed.error.flatten() },
        { status: 400 }
      )
    }

    const createData = { ...parsed.data }
    if (createData.videoSource === null) delete createData.videoSource
    if (createData.videoUrl === null) delete createData.videoUrl
    if (Array.isArray(createData.images)) {
      createData.images = createData.images.filter((u): u is string => typeof u === 'string' && u.trim() !== '')
    }

    const news = await NewsModel.create({
      ...createData,
      createdBy: {
        userId: sessionUser.id,
        name: creatorDisplayName({
          name: sessionUser.name,
          email: sessionUser.email,
          login: (sessionUser as { login?: string }).login,
        }),
      },
    })
    if (news.pushedToTelegram && news.status === 'published') {
      const tgResult = await sendNewsToTelegram({
        titleUzb: news.title?.uzb || news.title?.uz || news.slug,
        descriptionUzb: news.description?.uzb || news.description?.uz || '',
        slug: news.slug,
        origin: req.nextUrl.origin,
        type: news.type,
        videoUrl: news.videoUrl,
        imageUrl: Array.isArray(news.images) ? news.images[0] : undefined,
      })
      news.telegramLastAttemptAt = new Date()
      news.telegramPushStatus = tgResult.status
      news.telegramPushReason = tgResult.reason
      news.telegramMessageId = tgResult.messageId
      news.telegramMessageLink = tgResult.messageLink
      if (tgResult.status === 'sent') {
        news.pushedToTelegramAt = new Date()
      }
      await news.save()
    } else if (news.pushedToTelegram) {
      news.telegramLastAttemptAt = new Date()
      news.telegramPushStatus = undefined
      news.telegramPushReason = "News published bo'lganda Telegramga yuboriladi."
      await news.save()
    }
    return Response.json(news, { status: 201 })
  } catch (err) {
    const anyErr = err as any

    if (anyErr && (anyErr.code === 11000 || anyErr.code === 'E11000')) {
      const field = Object.keys(anyErr.keyPattern ?? anyErr.keyValue ?? {})[0] ?? 'slug'
      return Response.json(
        {
          error: 'Unique constraint',
          message: `${field} allaqachon mavjud. Iltimos, boshqasini tanlang.`,
        },
        { status: 409 }
      )
    }

    const message = err instanceof Error ? err.message : 'DB xatosi'
    console.error('[api/news POST]', message)
    return Response.json(
      { error: "Yangilikni yaratib bo'lmadi", details: message },
      { status: 500 }
    )
  }
}
