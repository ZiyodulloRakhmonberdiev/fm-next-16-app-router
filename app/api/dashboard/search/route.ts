import { NextRequest } from 'next/server'
import { dbConnect } from '@/shared/common/lib/db'
import { NewsModel } from '@/features/news/model/news.model'
import { getNewsListForLocale } from '@/features/news/model'
import type { AppLocale } from '@/shared/common/lib/locale-api'
import { requireAdminSession } from '@/shared/server/require-admin-session'

function escapeRegex(input: string): string {
  return input.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

export async function GET(request: NextRequest) {
  const unauthorized = await requireAdminSession(['ceo', 'administrator', 'moderator'])
  if (unauthorized) return unauthorized

  const { searchParams } = new URL(request.url)
  const q = (searchParams.get('q') ?? '').trim()
  const locale = (searchParams.get('locale') ?? 'uz') as AppLocale
  if (!q) return Response.json({ results: [] })

  await dbConnect()
  const regex = new RegExp(escapeRegex(q), 'i')
  const rows = await NewsModel.find({
    $or: [
      { slug: regex },
      { 'title.uz': regex },
      { 'title.uzb': regex },
      { 'title.ru': regex },
      { 'title.en': regex },
      { 'description.uz': regex },
      { 'description.uzb': regex },
      { 'description.ru': regex },
      { 'description.en': regex },
    ],
  })
    .sort({ publishedAt: -1 })
    .limit(30)
    .lean()

  const list = getNewsListForLocale(rows as any, locale)
  const results = list.slice(0, 10)

  return Response.json({ results })
}
