import { NextRequest } from 'next/server'
import { dbConnect } from '@/shared/common/lib/db'
import { NewsModel } from '@/features/news/model/news.model'
import { CategoryModel } from '@/features/category/model/category.model'
import { TagModel } from '@/features/tags/model/tag.model'
import { UserModel } from '@/features/users/model/user.model'
import { createNewsSchema } from '@/features/news/model/schemas'
import { deleteNewsFromTelegram, sendNewsToTelegram } from '@/shared/infra/telegram'
import { requireAdminSession } from '@/shared/server/require-admin-session'
import { logAdminAction } from '@/features/admin-logs/lib/log-action'
import { protectPublicApi } from '@/shared/server/protect-api'

async function syncTelegramForNews(news: any, origin: string) {
  // Agar pushedToTelegram false bo'lsa, lekin xabar yuborilgan bo'lsa - uni o'chirish kerak
  if (!news.pushedToTelegram) {
    if (news.telegramMessageId) {
      try {
        await deleteNewsFromTelegram({ messageId: news.telegramMessageId })
      } catch (err) {
        console.error("Telegramdan o'chirishda xato:", err)
      }
      news.telegramMessageId = undefined
      news.telegramMessageLink = undefined
      news.telegramPushStatus = undefined
      news.telegramPushReason = "Telegramdan o'chirildi."
      await news.save()
    }
    return
  }

  if (news.status !== 'published') {
    news.telegramLastAttemptAt = new Date()
    news.telegramPushStatus = undefined
    news.telegramPushReason = "News published bo'lganda Telegramga yuboriladi."
    await news.save()
    return
  }

  // Agar allaqachon yuborilgan bo'lsa va mantiq bo'yicha yangilash kerak bo'lsa - avval eskisini o'chiramiz
  if (news.telegramMessageId) {
    try {
      await deleteNewsFromTelegram({ messageId: news.telegramMessageId })
    } catch (err) {
      console.warn("Telegramdan o'chirishda xato:", err)
    }
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

async function resolveCategoryAndTagsForUpdate(update: Record<string, unknown>) {
  if (typeof update.categoryId === 'string' && update.categoryId.trim()) {
    const category = await CategoryModel.findById(update.categoryId)
      .select({ _id: 1, slug: 1 })
      .lean()
    if (!category) {
      throw new Error('Tanlangan kategoriya topilmadi.')
    }
    update.categorySlug = category.slug
  }
  if (Array.isArray(update.tagIds)) {
    if (update.tagIds.length > 0) {
      const tags = await TagModel.find({ _id: { $in: update.tagIds as string[] } })
        .select({ _id: 1, slug: 1 })
        .lean()
      const slugById = new Map(tags.map((t) => [t._id, t.slug]))
      update.tagIds = tags.map((t) => t._id)
      update.tagSlugs = (update.tagIds as string[])
        .map((id) => slugById.get(id))
        .filter(Boolean) as string[]
    } else {
      update.tagSlugs = []
    }
  }
  if (typeof update.authorId === 'string' && update.authorId.trim()) {
    const user = await UserModel.findById(update.authorId).select({ _id: 1, full_name: 1 }).lean()
    if (!user) {
      throw new Error('Tanlangan muallif topilmadi.')
    }
    update.author = user.full_name
  }
  if (update.authorId === null) {
    update.$unset = { ...(update.$unset as Record<string, unknown>), authorId: 1, author: 1 }
    delete update.authorId
    delete update.author
  }
  return update
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const isProtected = await protectPublicApi(req)
  if (isProtected) return isProtected

  await dbConnect()
  const news = await NewsModel.findById((await params).id).lean()

  if (!news) {
    return Response.json({ error: 'Yangilik topilmadi' }, { status: 404 })
  }

  if (news.authorId) {
    const author = await UserModel.findById(news.authorId).select({ _id: 1, full_name: 1 }).lean()
    if (author?.full_name) news.author = author.full_name
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

  const safeData = { ...parsed.data }
  delete (safeData as { views?: number }).views
  let update: Record<string, unknown> = { ...safeData }
  if (update.videoSource === null || update.videoUrl === null || update.themeId === null) {
    update.$unset = {
      ...(update.videoSource === null && { videoSource: 1 }),
      ...(update.videoUrl === null && { videoUrl: 1 }),
      ...(update.themeId === null && { themeId: 1 }),
    }
    if (update.videoSource === null) delete update.videoSource
    if (update.videoUrl === null) delete update.videoUrl
    if (update.themeId === null) delete update.themeId
  }
  if (Array.isArray(update.images)) {
    update.images = update.images.filter((u: unknown): u is string => typeof u === 'string' && u.trim() !== '')
  }
  try {
    update = await resolveCategoryAndTagsForUpdate(update)
  } catch (err) {
    return Response.json(
      { error: 'Validation error', message: err instanceof Error ? err.message : 'Validation error' },
      { status: 400 }
    )
  }

  const updated = await NewsModel.findByIdAndUpdate((await params).id, update, {
    new: true,
    runValidators: true,
  })

  if (!updated) {
    return Response.json({ error: 'Yangilik topilmadi' }, { status: 404 })
  }

  await syncTelegramForNews(updated, req.nextUrl.origin)

  logAdminAction({
    action: 'UPDATE_NEWS',
    targetId: updated._id?.toString() || updated.slug,
    targetName: updated.title?.uzb || updated.title?.uz || updated.slug,
  })

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

  const safeData = { ...parsed.data }
  delete (safeData as { views?: number }).views
  let update: Record<string, unknown> = { ...safeData }
  if (update.videoSource === null || update.videoUrl === null || update.themeId === null) {
    update.$unset = {
      ...(update.videoSource === null && { videoSource: 1 }),
      ...(update.videoUrl === null && { videoUrl: 1 }),
      ...(update.themeId === null && { themeId: 1 }),
    }
    if (update.videoSource === null) delete update.videoSource
    if (update.videoUrl === null) delete update.videoUrl
    if (update.themeId === null) delete update.themeId
  }
  if (Array.isArray(update.images)) {
    update.images = update.images.filter((u: unknown): u is string => typeof u === 'string' && u.trim() !== '')
  }
  try {
    update = await resolveCategoryAndTagsForUpdate(update)
  } catch (err) {
    return Response.json(
      { error: 'Validation error', message: err instanceof Error ? err.message : 'Validation error' },
      { status: 400 }
    )
  }

  const updated = await NewsModel.findByIdAndUpdate((await params).id, update, {
    new: true,
    runValidators: true,
  })

  if (!updated) {
    return Response.json({ error: 'Yangilik topilmadi' }, { status: 404 })
  }

  await syncTelegramForNews(updated, req.nextUrl.origin)

  logAdminAction({
    action: 'UPDATE_NEWS',
    targetId: updated._id?.toString() || updated.slug,
    targetName: updated.title?.uzb || updated.title?.uz || updated.slug,
  })

  return Response.json(updated.toObject())
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const unauthorized = await requireAdminSession(['ceo'])
  if (unauthorized) return unauthorized

  await dbConnect()
  const deleted = await NewsModel.findByIdAndDelete((await params).id).lean()

  if (!deleted) {
    return Response.json({ error: 'Yangilik topilmadi' }, { status: 404 })
  }

  if (deleted.status === 'deleted' && deleted.telegramMessageId) {
    await deleteNewsFromTelegram({ messageId: deleted.telegramMessageId })
  }

  logAdminAction({
    action: 'DELETE_NEWS',
    targetId: deleted._id?.toString() || deleted.slug,
    targetName: deleted.title?.uzb || deleted.title?.uz || deleted.slug,
  })

  return Response.json({ ok: true })
}
