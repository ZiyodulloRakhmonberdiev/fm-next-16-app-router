import { NextRequest } from 'next/server'
import { dbConnect } from '@/shared/common/lib/db'
import { NewsModel } from '@/features/news/model/news.model'
import { createNewsSchema } from '@/features/news/model/schemas'
import { sendNewsToTelegram } from '@/shared/common/lib/telegram'
import { requireAdminSession } from '@/shared/common/lib/require-admin-session'

export async function GET(req: NextRequest) {
  try {
    await dbConnect()

    const { searchParams } = new URL(req.url)
    const status = searchParams.get('status')
    const category = searchParams.get('category')
    const page = Math.max(1, Number(searchParams.get('page') ?? 1))
    const limit = Math.min(100, Math.max(1, Number(searchParams.get('limit') ?? 20)))
    const skip = (page - 1) * limit

    const filter: Record<string, unknown> = {}
    if (status) filter.status = status
    if (category) filter.categorySlug = category

    const [news, total] = await Promise.all([
      NewsModel.find(filter)
        .sort({ publishedAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      NewsModel.countDocuments(filter),
    ])

    return Response.json({
      data: news,
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

export async function POST(req: NextRequest) {
  const unauthorized = await requireAdminSession(['ceo', 'administrator', 'moderator'])
  if (unauthorized) return unauthorized

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

    const news = await NewsModel.create(createData)
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
