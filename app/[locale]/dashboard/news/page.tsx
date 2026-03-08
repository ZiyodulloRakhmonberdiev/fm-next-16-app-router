import { getLocale } from 'next-intl/server'
import { getNewsListForLocale } from '@/features/news/model'
import { seedNews } from '@/scripts/seed-news'
import type { AppLocale } from '@/shared/common/lib/locale-api'
import { DashboardNewsListPage } from '@/features/dashboard'

const LOCALES: AppLocale[] = ['uz', 'uzb', 'ru', 'en']

function buildTranslationsBySlug() {
  const out: Record<
    string,
    {
      title: Record<AppLocale, string | undefined>
      description: Record<AppLocale, string | undefined>
      content: Record<AppLocale, boolean>
    }
  > = {}
  for (const raw of seedNews.news) {
    const title: Record<AppLocale, string | undefined> = {} as Record<AppLocale, string | undefined>
    const description: Record<AppLocale, string | undefined> = {} as Record<AppLocale, string | undefined>
    const content: Record<AppLocale, boolean> = {} as Record<AppLocale, boolean>
    for (const loc of LOCALES) {
      title[loc] = (raw.title as Record<string, string | undefined>)[loc]
      description[loc] = (raw.description as Record<string, string | undefined> | undefined)?.[loc]
      content[loc] = !!(raw.content as Record<string, unknown> | undefined)?.[loc]
    }
    out[raw.slug] = { title, description, content }
  }
  return out
}

export default async function DashboardNewsPage() {
  const locale = (await getLocale()) as AppLocale
  const news = getNewsListForLocale(seedNews.news, locale).sort(
    (a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
  )
  const translationsBySlug = buildTranslationsBySlug()

  return (
    <DashboardNewsListPage
      news={news}
      locale={locale}
      translationsBySlug={translationsBySlug}
    />
  )
}
