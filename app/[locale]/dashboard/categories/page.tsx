import { getLocale } from 'next-intl/server'
import type { AppLocale } from '@/shared/common/lib/locale-api'
import { CategoriesPage } from '../_components'

export default async function DashboardCategoriesPageRoute() {
  const locale = (await getLocale()) as AppLocale
  return <CategoriesPage locale={locale} />
}
