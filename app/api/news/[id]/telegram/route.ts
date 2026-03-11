import { NextRequest } from 'next/server'
import { dbConnect } from '@/shared/common/lib/db'
import { NewsModel } from '@/features/news/model/news.model'
import { deleteNewsFromTelegram, sendNewsToTelegram } from '@/shared/common/lib/telegram'
import { requireAdminSession } from '@/shared/common/lib/require-admin-session'

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const unauthorized = await requireAdminSession(['ceo', 'administrator', 'moderator'])
  if (unauthorized) return unauthorized

  await dbConnect()
  const news = await NewsModel.findById((await params).id)
  if (!news) return Response.json({ error: 'Yangilik topilmadi' }, { status: 404 })

  news.pushedToTelegram = true

  if (news.status !== 'published') {
    news.telegramLastAttemptAt = new Date()
    news.telegramPushReason = "News published bo'lganda Telegramga yuboriladi."
    await news.save()
    return Response.json(news.toObject())
  }

  if (news.telegramMessageId) {
    await deleteNewsFromTelegram({ messageId: news.telegramMessageId })
  }

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
  return Response.json(news.toObject())
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const unauthorized = await requireAdminSession(['ceo', 'administrator', 'moderator'])
  if (unauthorized) return unauthorized

  await dbConnect()
  const news = await NewsModel.findById((await params).id)
  if (!news) return Response.json({ error: 'Yangilik topilmadi' }, { status: 404 })

  const delResult = await deleteNewsFromTelegram({ messageId: news.telegramMessageId })
  news.telegramLastAttemptAt = new Date()
  news.telegramPushStatus = delResult.status === 'failed' ? 'failed' : news.telegramPushStatus
  news.telegramPushReason = delResult.reason
  news.pushedToTelegram = false
  news.telegramMessageId = undefined
  news.telegramMessageLink = undefined
  news.pushedToTelegramAt = undefined
  await news.save()

  return Response.json(news.toObject())
}
