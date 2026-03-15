import { NextRequest } from 'next/server'
import { dbConnect } from '@/shared/common/lib/db'
import { NewsModel } from '@/features/news/model/news.model'
import { createNewsSchema } from '@/features/news/model/schemas'
import { deleteNewsFromTelegram, sendNewsToTelegram } from '@/shared/common/lib/telegram'
import { requireAdminSession } from '@/shared/common/lib/require-admin-session'

async function syncTelegramForNews(news: any, origin: string) {
  if (!news.pushedToTelegram) return

  if (news.status !== 'published') {
    news.telegramLastAttemptAt = new Date()
    news.telegramPushStatus = undefined
    news.telegramPushReason = "News published bo'lganda Telegramga yuboriladi."
    await news.save()
    return
  }

  if (news.telegramMessageId) {
    await deleteNewsFromTelegram({ messageId: news.telegramMessageId })
  }

  const tgResult = await sendNewsToTelegram({
    titleUzb: news.title?.uzb || news.title?.uz || news.slug,
    descriptionUzb: news.description?.uzb || news.description?.uz || '',
    slug: news.slug,
    origin,
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
}

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  await dbConnect()
  const news = await NewsModel.findById((await params).id).lean()

  if (!news) {
    return Response.json({ error: 'Yangilik topilmadi' }, { status: 404 })
  }

  return Response.json(news)
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const unauthorized = await requireAdminSession(['ceo', 'administrator', 'moderator'])
  if (unauthorized) return unauthorized

  await dbConnect()
  const json = await req.json()

  const parsed = createNewsSchema.safeParse(json)
  if (!parsed.success) {
    return Response.json(
      { error: 'Validation error', issues: parsed.error.flatten() },
      { status: 400 }
    )
  }

  const updated = await NewsModel.findByIdAndUpdate(
    (await params).id,
    (() => {
      const safeData = { ...parsed.data }
      delete (safeData as { views?: number }).views
      const update: Record<string, unknown> = { ...safeData }
      if (update.videoSource === null || update.videoUrl === null) {
        update.$unset = {
          ...(update.videoSource === null && { videoSource: 1 }),
          ...(update.videoUrl === null && { videoUrl: 1 }),
        }
        delete update.videoSource
        delete update.videoUrl
      }
      if (Array.isArray(update.images)) {
        update.images = update.images.filter((u: unknown): u is string => typeof u === 'string' && u.trim() !== '')
      }
      return update
    })(),
    { new: true, runValidators: true }
  )

  if (!updated) {
    return Response.json({ error: 'Yangilik topilmadi' }, { status: 404 })
  }

  await syncTelegramForNews(updated, req.nextUrl.origin)

  return Response.json(updated.toObject())
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const unauthorized = await requireAdminSession(['ceo', 'administrator', 'moderator'])
  if (unauthorized) return unauthorized

  await dbConnect()
  const json = await req.json()

  const parsed = createNewsSchema.partial().safeParse(json)
  if (!parsed.success) {
    return Response.json(
      { error: 'Validation error', issues: parsed.error.flatten() },
      { status: 400 }
    )
  }

  const updated = await NewsModel.findByIdAndUpdate(
    (await params).id,
    (() => {
      const safeData = { ...parsed.data }
      delete (safeData as { views?: number }).views
      const update: Record<string, unknown> = { ...safeData }
      if (update.videoSource === null || update.videoUrl === null) {
        update.$unset = {
          ...(update.videoSource === null && { videoSource: 1 }),
          ...(update.videoUrl === null && { videoUrl: 1 }),
        }
        delete update.videoSource
        delete update.videoUrl
      }
      if (Array.isArray(update.images)) {
        update.images = update.images.filter((u: unknown): u is string => typeof u === 'string' && u.trim() !== '')
      }
      return update
    })(),
    { new: true, runValidators: true }
  )

  if (!updated) {
    return Response.json({ error: 'Yangilik topilmadi' }, { status: 404 })
  }

  await syncTelegramForNews(updated, req.nextUrl.origin)

  return Response.json(updated.toObject())
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const unauthorized = await requireAdminSession(['ceo', 'administrator', 'moderator'])
  if (unauthorized) return unauthorized

  await dbConnect()
  const deleted = await NewsModel.findByIdAndDelete((await params).id).lean()

  if (!deleted) {
    return Response.json({ error: 'Yangilik topilmadi' }, { status: 404 })
  }

  if (deleted.status === 'deleted' && deleted.telegramMessageId) {
    await deleteNewsFromTelegram({ messageId: deleted.telegramMessageId })
  }

  return Response.json({ ok: true })
}
