import { redirect } from '@/i18n/navigation'
import { getLocale } from 'next-intl/server'

export default async function DashboardConfigsIndexPage() {
  const locale = await getLocale()
  redirect({ href: '/dashboard/configs/site', locale })
}
