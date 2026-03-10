
import { getLocale } from 'next-intl/server'
import type { AppLocale } from '@/shared/common/lib/locale-api'
import { TagsPage } from '../_components'

export default async function DashboardTagsPageRoute() {
  const locale = (await getLocale()) as AppLocale
  return <TagsPage locale={locale} />
}
