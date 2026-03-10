import { getLocale } from 'next-intl/server'
import type { AppLocale } from '@/shared/common/lib/locale-api'
import { DashboardNewsListPage } from '@/features/dashboard/ui/news-list-page'

export default async function DashboardNewsPage() {
  const locale = (await getLocale()) as AppLocale
  return <DashboardNewsListPage locale={locale} />
}
