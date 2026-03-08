import { getLocale } from 'next-intl/server'
import { seed } from '@/scripts/seed'
import type { AppLocale } from '@/shared/common/lib/locale-api'
import { DashboardCategoriesPage } from '@/features/dashboard'

export default async function DashboardCategoriesPageRoute() {
  const locale = (await getLocale()) as AppLocale
  const categories = seed.categories.map((c) => ({
    slug: c.slug,
    href: c.href,
    name: c.name,
  }))

  return <DashboardCategoriesPage categories={categories} locale={locale} />
}
