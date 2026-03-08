import { getLocale } from 'next-intl/server'
import { seed } from '@/scripts/seed'
import type { AppLocale } from '@/shared/common/lib/locale-api'
import { DashboardTagsPage } from '@/features/dashboard'

export default async function DashboardTagsPageRoute() {
  const locale = (await getLocale()) as AppLocale
  const tags = seed.tags.map((t) => ({
    slug: t.slug,
    name: t.name,
  }))

  return <DashboardTagsPage tags={tags} locale={locale} />
}
