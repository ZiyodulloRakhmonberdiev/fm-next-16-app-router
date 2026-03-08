import { getLocale } from 'next-intl/server'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/common/components/ui/card'
import { CreateNewsForm } from '@/features/news/ui/create-news-form'
import { seed } from '@/scripts/seed'
import { seedNews } from '@/scripts/seed-news'
import type { AppLocale } from '@/shared/common/lib/locale-api'
import { getCategoryName, getTagName } from '@/shared/common/lib/seed-helpers'

export default async function CreateNewsPage() {
  const locale = (await getLocale()) as AppLocale
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
          existingSlugs={seedNews.news.map((n) => n.slug)}
        />
      </CardContent>
    </Card>
  )
}
