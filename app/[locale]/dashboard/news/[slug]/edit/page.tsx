import { getLocale } from 'next-intl/server'
import { notFound } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/common/components/ui/card'
import { CreateNewsForm } from '@/features/news/ui/create-news-form'
import { seed } from '@/scripts/seed'
import { seedNews } from '@/scripts/seed-news'
import type { AppLocale } from '@/shared/common/lib/locale-api'
import { getCategoryName, getTagName } from '@/shared/common/lib/seed-helpers'
import { rawNewsToEditInitialData } from '@/features/news/lib/raw-to-edit-initial'

type Props = {
  params: Promise<{ slug: string }>
}

export default async function EditNewsPage({ params }: Props) {
  const { slug } = await params
  const locale = (await getLocale()) as AppLocale

  const raw = seedNews.news.find((n) => n.slug === slug)
  if (!raw) notFound()

  const initialData = rawNewsToEditInitialData(raw)

  const categories = seed.categories.map((c) => ({
    slug: c.slug,
    name: getCategoryName(c.slug, locale),
  }))
  const tags = seed.tags.map((t) => ({
    slug: t.slug,
    name: getTagName(t.slug, locale),
  }))
  const authors = Array.from(
    new Set(seedNews.news.map((n) => n.author).filter(Boolean))
  ).sort()
  const existingSlugs = seedNews.news.map((n) => n.slug).filter((s) => s !== slug)

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
