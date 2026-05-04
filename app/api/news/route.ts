import { NextRequest } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/shared/common/lib/auth-options'
import { dbConnect } from '@/shared/common/lib/db'
import { NewsModel } from '@/features/news/model/news.model'
import { CategoryModel } from '@/features/category/model/category.model'
import { TagModel } from '@/features/tags/model/tag.model'
import { UserModel } from '@/features/users/model/user.model'
import { NewsCommentModel } from '@/features/news/model/comment.model'
import { NewsReactionModel } from '@/features/news/model/reaction.model'
import { createNewsSchema } from '@/features/news/model/schemas'
import { computeNewsMediaFlags } from '@/features/news/lib/news-media-flags'
import { sendNewsToTelegram } from '@/shared/infra/telegram'
import { logAdminAction } from '@/features/admin-logs/lib/log-action'
import { requireAdminSession } from '@/shared/server/require-admin-session'
import { protectPublicApi } from '@/shared/server/protect-api'
import { CACHE_TIMINGS, noStoreHeaders, publicCacheHeaders } from '@/shared/common/lib/http-cache'
import type { SortOrder } from 'mongoose'
import { isAppLocale, type AppLocale } from '@/shared/common/lib/locale-api'
import { pickUserLocaleText } from '@/features/users/lib/user-locale'

export async function GET(req: NextRequest) {
  const isProtected = await protectPublicApi(req)
  if (isProtected) return isProtected

  try {
    await dbConnect()

    const { searchParams } = new URL(req.url)
    const status = searchParams.get('status')
    const wantsAdmin = searchParams.get('admin') === '1'
    if (wantsAdmin) {
      const unauthorized = await requireAdminSession(['ceo', 'administrator', 'moderator'])
      if (unauthorized) return unauthorized
    }
    const category = searchParams.get('category')
    const categoryList = searchParams.getAll("category")
    const categoryId = searchParams.get('categoryId')
    const categoryIdList = searchParams.getAll("categoryId")
    const theme = searchParams.get('theme')
    const themeList = searchParams.getAll("theme")
    const page = Math.max(1, Number(searchParams.get('page') ?? 1))
    const limit = Math.min(100, Math.max(1, Number(searchParams.get('limit') ?? 20)))
    const localeParam = searchParams.get('locale')
    const currentLocale: AppLocale = isAppLocale(localeParam ?? '') ? (localeParam as AppLocale) : 'uz'
    const sortBy = (searchParams.get("sortBy") ?? "publishedAt").toLowerCase()
    const recentMonths = Number(searchParams.get("recentMonths") ?? 0)
    const top = searchParams.get("top")
    const authorsChoice = searchParams.get("authorsChoice") ?? searchParams.get("authors_choice")
    const breaking = searchParams.get("breaking") ?? searchParams.get("isBreaking")
    const stats = searchParams.get("stats")
    const authorId = searchParams.get("authorId")
    const authorIdList = searchParams.getAll("authorId")
    const video = searchParams.get("video") ?? searchParams.get("hasVideo") ?? searchParams.get("has_video")
    const audio = searchParams.get("audio") ?? searchParams.get("hasAudio") ?? searchParams.get("has_audio")
    const includeAd = searchParams.get("includeAd") ?? searchParams.get("include_ad")
    const skip = (page - 1) * limit

    const filter: Record<string, unknown> = {}
    const wantsStats = stats === "1" || stats === "true"
    if (!wantsAdmin && includeAd !== "1" && includeAd !== "true" && !wantsStats) {
      filter.ad = { $ne: true }
      filter.stats = { $ne: true }
    }
    if (wantsStats) {
      filter.stats = true
      filter.ad = { $ne: true }
    }
    if (status) filter.status = status
    const categorySlugs = [
      ...categoryList.flatMap((v) => String(v).split(",").map((s) => s.trim()).filter(Boolean)),
      ...(category ? String(category).split(",").map((s) => s.trim()).filter(Boolean) : []),
    ]
    const categoryIds = [
      ...categoryIdList.flatMap((v) => String(v).split(",").map((s) => s.trim()).filter(Boolean)),
      ...(categoryId ? String(categoryId).split(",").map((s) => s.trim()).filter(Boolean) : []),
    ]
    const uniqueCategoryIds = Array.from(new Set(categoryIds))
    if (uniqueCategoryIds.length === 1) {
      filter.categoryId = uniqueCategoryIds[0]
    } else if (uniqueCategoryIds.length > 1) {
      filter.categoryId = { $in: uniqueCategoryIds }
    } else {
      const uniqueCategorySlugs = Array.from(new Set(categorySlugs))
      if (uniqueCategorySlugs.length === 1) {
        filter.categorySlug = uniqueCategorySlugs[0]
      } else if (uniqueCategorySlugs.length > 1) {
        filter.categorySlug = { $in: uniqueCategorySlugs }
      }
    }
    const themeIds = [
      ...themeList.flatMap((v) => String(v).split(",").map((s) => s.trim()).filter(Boolean)),
      ...(theme ? String(theme).split(",").map((s) => s.trim()).filter(Boolean) : []),
    ]
    const uniqueThemeIds = Array.from(new Set(themeIds))
    if (uniqueThemeIds.length === 1) {
      filter.themeId = uniqueThemeIds[0]
    } else if (uniqueThemeIds.length > 1) {
      filter.themeId = { $in: uniqueThemeIds }
    }
    if (top === "1" || top === "true") filter.isTop = true
    if (authorsChoice === "1" || authorsChoice === "true") filter.authorsChoice = true
    if (breaking === "1" || breaking === "true") filter.isBreaking = true
    const authorIds = [
      ...authorIdList.flatMap((v) => String(v).split(",").map((s) => s.trim()).filter(Boolean)),
      ...(authorId ? String(authorId).split(",").map((s) => s.trim()).filter(Boolean) : []),
    ]
    const uniqueAuthorIds = Array.from(new Set(authorIds))
    if (uniqueAuthorIds.length === 1) {
      filter.authorId = uniqueAuthorIds[0]
    } else if (uniqueAuthorIds.length > 1) {
      filter.authorId = { $in: uniqueAuthorIds }
    }
    /** Video filter: endi asosiy mezon `hasVideo` */
    if (video === "1" || video === "true") {
      filter.$or = [
        { hasVideo: true },
        { videoUrl: { $exists: true, $nin: [null, ""] } },
      ]
    }
    /** Audio filter: endi asosiy mezon `hasAudio` */
    if (audio === "1" || audio === "true") {
      filter.$or = [
        { hasAudio: true },
        { audioUrl: { $exists: true, $nin: [null, ""] } },
      ]
    }
    if (Number.isFinite(recentMonths) && recentMonths > 0) {
      const now = new Date()
      const from = new Date(now)
      from.setMonth(from.getMonth() - Math.floor(recentMonths))
      filter.publishedAt = { $gte: from }
    }

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

    const authorDocIds = Array.from(
      new Set(news.map((n) => n.authorId).filter((id): id is string => typeof id === 'string' && id.trim() !== ''))
    )
    const authorNameById = new Map<string, string>()
    if (authorDocIds.length > 0) {
      const users = await UserModel.find({ _id: { $in: authorDocIds } })
        .select({ _id: 1, full_name: 1 })
        .lean()
      for (const user of users) {
        authorNameById.set(user._id, pickUserLocaleText(user.full_name, currentLocale))
      }
    }

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
      author: n.authorId ? (authorNameById.get(n.authorId) ?? n.author) : n.author,
      commentCount: commentBySlug.get(n.slug) ?? 0,
      reactionCount: reactionBySlug.get(n.slug) ?? 0,
    }))

    const isPublicPublished = !wantsAdmin && (!status || status === 'published')
    return Response.json(
      {
        data,
        meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
      },
      {
        headers: isPublicPublished
          ? publicCacheHeaders(CACHE_TIMINGS.newsList.maxAge, CACHE_TIMINGS.newsList.stale)
          : noStoreHeaders(),
      }
    )
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

    const createData: Record<string, unknown> & {
      categoryId: string
      tagIds: string[]
      themeId?: string | null
      authorId?: string | null
      videoSource?: string | null
      videoUrl?: string | null
      images?: unknown[]
    } = { ...parsed.data }
    const category = await CategoryModel.findById(createData.categoryId).select({ _id: 1, slug: 1 }).lean()
    if (!category) {
      return Response.json(
        { error: 'Validation error', message: 'Tanlangan kategoriya topilmadi.' },
        { status: 400 }
      )
    }
    createData.categorySlug = category.slug
    if (createData.tagIds.length > 0) {
      const tags = await TagModel.find({ _id: { $in: createData.tagIds } }).select({ _id: 1, slug: 1 }).lean()
      const slugById = new Map(tags.map((t) => [t._id, t.slug]))
      createData.tagIds = tags.map((t) => t._id)
      createData.tagSlugs = createData.tagIds.map((id) => slugById.get(id)).filter(Boolean) as string[]
    } else {
      createData.tagSlugs = []
    }
    if (createData.themeId === null) delete createData.themeId
    if (typeof createData.authorId === 'string' && createData.authorId.trim()) {
      const author = await UserModel.findById(createData.authorId).select({ _id: 1, full_name: 1 }).lean()
      if (!author) {
        return Response.json(
          { error: 'Validation error', message: 'Tanlangan muallif topilmadi.' },
          { status: 400 }
        )
      }
      createData.author = pickUserLocaleText(author.full_name, 'uz')
    } else {
      delete createData.authorId
      delete createData.author
    }
    if (createData.videoSource === null) delete createData.videoSource
    if (createData.videoUrl === null) delete createData.videoUrl
    if (Array.isArray(createData.images)) {
      createData.images = createData.images.filter((u): u is string => typeof u === 'string' && u.trim() !== '')
    }
    const flags = computeNewsMediaFlags({
      title: createData.title as { uz?: string; uzb?: string; ru?: string; en?: string } | null | undefined,
      images: createData.images,
      videoUrl: createData.videoUrl,
      audioUrl: createData.audioUrl,
    })
    createData.hasText = flags.hasText
    createData.hasImage = flags.hasImage
    createData.hasVideo = flags.hasVideo
    createData.hasAudio = flags.hasAudio

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
    
    // Log the creation action asynchronously
    logAdminAction({
      action: 'CREATE_NEWS',
      targetId: news._id?.toString() || news.slug,
      targetName: news.title?.uzb || news.title?.uz || news.slug,
    })

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
