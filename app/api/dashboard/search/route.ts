import { NextRequest } from 'next/server'
import { seedNews } from '@/scripts/seed-news'
import { getNewsListForLocale } from '@/features/news/model'
import type { AppLocale } from '@/shared/common/lib/locale-api'
import { requireAdminSession } from '@/shared/common/lib/require-admin-session'

function matchesQuery(title: string, description: string | undefined, q: string): boolean {
  const lower = q.trim().toLowerCase()
  if (!lower) return true
  const t = (title ?? '').toLowerCase()
  const d = (description ?? '').toLowerCase()
  return t.includes(lower) || d.includes(lower)
}

export async function GET(request: NextRequest) {
  const unauthorized = await requireAdminSession(['ceo', 'administrator', 'moderator'])
  if (unauthorized) return unauthorized

  const { searchParams } = new URL(request.url)
  const q = searchParams.get('q') ?? ''
  const locale = (searchParams.get('locale') ?? 'uz') as AppLocale

  const list = getNewsListForLocale(seedNews.news, locale)
  const results = list.filter((item) =>
    matchesQuery(item.title, item.description, q)
  ).slice(0, 10)

  return Response.json({ results })
}
