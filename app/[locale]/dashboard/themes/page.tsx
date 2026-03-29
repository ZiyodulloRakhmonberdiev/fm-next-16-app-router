import { getLocale } from 'next-intl/server'
import type { AppLocale } from '@/shared/common/lib/locale-api'
import { ThemesPage } from '../_components'

export default async function DashboardThemesPageRoute() {
  const locale = (await getLocale()) as AppLocale
  return <ThemesPage locale={locale} />
}

