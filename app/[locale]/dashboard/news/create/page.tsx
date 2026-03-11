import { getLocale } from 'next-intl/server'
import { headers } from 'next/headers'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/common/components/ui/card'
import { CreateNewsForm } from '@/features/news/ui/create-news-form'
import type { AppLocale } from '@/shared/common/lib/locale-api'
import { getServerApiUrl } from '@/shared/common/lib/server-api-url'
import type { RawNewsItem } from '@/features/news/model'
import type { LocaleMap } from '@/shared/common/lib/locale-types'

type NamedSlug = { slug: string; name: LocaleMap }
type UserRow = { full_name: string }

function getFetchOptions(cookie: string | null): RequestInit {
  return {
    cache: 'no-store' as RequestCache,
    headers: cookie ? { cookie } : undefined,
  }
}

export default async function CreateNewsPage() {
  const locale = (await getLocale()) as AppLocale
  const h = await headers()
  const cookie = h.get('cookie')
  const opts = getFetchOptions(cookie)

  const [categoriesRes, tagsRes, newsRes, usersRes] = await Promise.all([
    fetch(await getServerApiUrl('/api/categories'), opts),
    fetch(await getServerApiUrl('/api/tags'), opts),
    fetch(await getServerApiUrl('/api/news?page=1&limit=500'), opts),
    fetch(await getServerApiUrl('/api/users'), opts),
  ])
  const failed = [
    !categoriesRes.ok && 'categories',
    !tagsRes.ok && 'tags',
    !newsRes.ok && 'news',
    !usersRes.ok && 'users',
  ].filter(Boolean)
  if (failed.length > 0) {
    throw new Error(`Dashboard ma'lumotlarini yuklab bo'lmadi: ${failed.join(', ')}`)
  }

  const categoriesData = (await categoriesRes.json()) as NamedSlug[]
  const tagsData = (await tagsRes.json()) as NamedSlug[]
  const newsData = (await newsRes.json()) as { data: RawNewsItem[] }
  const usersData = (await usersRes.json()) as UserRow[]

  const categories = categoriesData.map((c) => ({
    slug: c.slug,
    name: c.name[locale] ?? c.name.uz ?? c.slug,
  }))
  const tags = tagsData.map((t) => ({
    slug: t.slug,
    name: t.name[locale] ?? t.name.uz ?? t.slug,
  }))
  const authors = Array.from(new Set(usersData.map((u) => u.full_name).filter(Boolean))).sort()

  return (
    <Card>
      <CardHeader>
        <CardTitle>Yangilik yaratish</CardTitle>
        <CardDescription>
          Ikki bosqichda: birinchi — tarjimalar va umumiy maydonlar, ikkinchi — boolean sozlamalar va saqlash.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <CreateNewsForm
          categories={categories}
          tags={tags}
          authors={authors}
          existingSlugs={newsData.data.map((n) => n.slug)}
        />
      </CardContent>
    </Card>
  )
}
