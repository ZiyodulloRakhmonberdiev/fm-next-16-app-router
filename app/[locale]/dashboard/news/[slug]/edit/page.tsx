import { getLocale } from 'next-intl/server'
import { headers } from 'next/headers'
import { notFound } from 'next/navigation'
import type { AppLocale } from '@/shared/common/lib/locale-api'
import { rawNewsToEditInitialData } from '@/features/news/lib/raw-to-edit-initial'
import { getServerApiUrl } from '@/shared/common/lib/server-api-url'
import type { RawNewsItem } from '@/features/news/model'
import type { LocaleMap } from '@/shared/common/lib/locale-types'
import { EditNewsPageClient } from './_components/edit-news-page-client'
import { normalizeRole } from '@/shared/common/lib/rbac'

type Props = {
  params: Promise<{ slug: string }>
}
type UserRow = { _id: string; full_name: string; role: string }

function getFetchOptions(cookie: string | null): RequestInit {
  return {
    cache: 'no-store' as RequestCache,
    headers: cookie ? { cookie } : undefined,
  }
}

export default async function EditNewsPage({ params }: Props) {
  const { slug } = await params
  const locale = (await getLocale()) as AppLocale
  const h = await headers()
  const cookie = h.get('cookie')
  const opts = getFetchOptions(cookie)

  const [categoriesRes, themesRes, tagsRes, newsRes, usersRes] = await Promise.all([
    fetch(await getServerApiUrl('/api/categories'), opts),
    fetch(await getServerApiUrl('/api/themes?admin=1'), opts),
    fetch(await getServerApiUrl('/api/tags'), opts),
    fetch(await getServerApiUrl('/api/news?page=1&limit=500'), opts),
    fetch(await getServerApiUrl('/api/users'), opts),
  ])
  const failed = [
    !categoriesRes.ok && 'categories',
    !themesRes.ok && 'themes',
    !tagsRes.ok && 'tags',
    !newsRes.ok && 'news',
    !usersRes.ok && 'users',
  ].filter(Boolean)
  if (failed.length > 0) {
    throw new Error(`Dashboard ma'lumotlarini yuklab bo'lmadi: ${failed.join(', ')}`)
  }

  const categoriesData = (await categoriesRes.json()) as Array<{ _id: string; slug: string; name: LocaleMap }>
  const themesData = (await themesRes.json()) as Array<{ _id: string; slug: string; name: LocaleMap; status?: "active" | "inactive" }>
  const tagsData = (await tagsRes.json()) as Array<{ _id: string; slug: string; name: LocaleMap }>
  const newsData = (await newsRes.json()) as { data: RawNewsItem[] }
  const usersData = (await usersRes.json()) as UserRow[]

  const raw = newsData.data.find((n) => n.slug === slug)
  if (!raw) notFound()

  const initialData = rawNewsToEditInitialData(raw)
  if (!initialData.categoryId) {
    initialData.categoryId = categoriesData.find((c) => c.slug === initialData.categorySlug)?._id ?? ''
  }
  if (!initialData.tagIds.length && initialData.tagSlugs.length) {
    initialData.tagIds = tagsData
      .filter((t) => initialData.tagSlugs.includes(t.slug))
      .map((t) => t._id)
  }
  if (!initialData.authorId && initialData.author) {
    initialData.authorId = usersData.find((u) => u.full_name === initialData.author)?._id ?? ''
  }

  const categories = categoriesData.map((c) => ({
    id: c._id,
    slug: c.slug,
    name: c.name[locale] ?? c.name.uz ?? c.slug,
  }))
  const tags = tagsData.map((t) => ({
    id: t._id,
    slug: t.slug,
    name: t.name[locale] ?? t.name.uz ?? t.slug,
  }))
  const themes = themesData
    .filter((t) => (t.status ?? "active") === "active" || t._id === raw.themeId)
    .map((t) => ({
      id: t._id,
      slug: t.slug,
      name: t.name[locale] ?? t.name.uz ?? t.slug,
    }))
  const authors = usersData
    .filter((u) => {
      const role = normalizeRole(u.role)
      return role === 'ceo' || role === 'administrator' || role === 'moderator'
    })
    .filter((u) => u.full_name?.trim())
    .map((u) => ({ id: u._id, name: u.full_name }))
    .sort((a, b) => a.name.localeCompare(b.name))
  const existingSlugs = newsData.data.map((n) => n.slug).filter((s) => s !== slug)

  return (
    <EditNewsPageClient
      categories={categories}
      themes={themes}
      tags={tags}
      authors={authors}
      existingSlugs={existingSlugs}
      initialData={initialData}
    />
  )
}
