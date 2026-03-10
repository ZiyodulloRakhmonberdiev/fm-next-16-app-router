import { getLocale } from 'next-intl/server'
import { notFound } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/common/components/ui/card'
import { CreateNewsForm } from '@/features/news/ui/create-news-form'
import type { AppLocale } from '@/shared/common/lib/locale-api'
import { rawNewsToEditInitialData } from '@/features/news/lib/raw-to-edit-initial'
import { getServerApiUrl } from '@/shared/common/lib/server-api-url'
import type { RawNewsItem } from '@/features/news/model'
import type { LocaleMap } from '@/shared/common/lib/locale-types'

type Props = {
  params: Promise<{ slug: string }>
}
type UserRow = { full_name: string }

export default async function EditNewsPage({ params }: Props) {
  const { slug } = await params
  const locale = (await getLocale()) as AppLocale

  const [categoriesRes, tagsRes, newsRes, usersRes] = await Promise.all([
    fetch(await getServerApiUrl('/api/categories'), { cache: 'no-store' }),
    fetch(await getServerApiUrl('/api/tags'), { cache: 'no-store' }),
    fetch(await getServerApiUrl('/api/news?page=1&limit=500'), { cache: 'no-store' }),
    fetch(await getServerApiUrl('/api/users'), { cache: 'no-store' }),
  ])
  if (!categoriesRes.ok || !tagsRes.ok || !newsRes.ok || !usersRes.ok) {
    throw new Error('Dashboard ma’lumotlarini yuklab bo‘lmadi')
  }

  const categoriesData = (await categoriesRes.json()) as Array<{ slug: string; name: LocaleMap }>
  const tagsData = (await tagsRes.json()) as Array<{ slug: string; name: LocaleMap }>
  const newsData = (await newsRes.json()) as { data: RawNewsItem[] }
  const usersData = (await usersRes.json()) as UserRow[]

  const raw = newsData.data.find((n) => n.slug === slug)
  if (!raw) notFound()

  const initialData = rawNewsToEditInitialData(raw)

  const categories = categoriesData.map((c) => ({
    slug: c.slug,
    name: c.name[locale] ?? c.name.uz ?? c.slug,
  }))
  const tags = tagsData.map((t) => ({
    slug: t.slug,
    name: t.name[locale] ?? t.name.uz ?? t.slug,
  }))
  const authors = Array.from(new Set(usersData.map((u) => u.full_name).filter(Boolean))).sort()
  const existingSlugs = newsData.data.map((n) => n.slug).filter((s) => s !== slug)

  return (
    <Card>
      <CardHeader>
        <CardTitle>Yangilikni tahrirlash</CardTitle>
        <CardDescription>
          Create kabi 3 bosqich: ma’lumotlar, kontent, sozlamalar. Sozlamalar bosqichida
          status tugmalari orqali status o‘zgartiriladi va o‘chirish (Savatga) amalga
          oshiriladi.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <CreateNewsForm
          categories={categories}
          tags={tags}
          authors={authors}
          existingSlugs={existingSlugs}
          initialData={initialData}
        />
      </CardContent>
    </Card>
  )
}
