import { getLocale } from 'next-intl/server'
import { notFound } from 'next/navigation'
import type { NewsStatus } from '@/features/news/model'
import type { AppLocale } from '@/shared/common/lib/locale-api'
import { DashboardNewsListPage } from '@/features/dashboard/ui/news-list-page'

type Props = {
  params: Promise<{ status: string }>
}

const VALID_STATUSES: NewsStatus[] = ['pending', 'published', 'cancelled', 'deleted', 'archived']

export default async function DashboardNewsStatusPage({ params }: Props) {
  const { status } = await params
  const statusParam = status as NewsStatus
  if (!VALID_STATUSES.includes(statusParam)) {
    notFound()
  }

  const locale = (await getLocale()) as AppLocale
  return (
    <DashboardNewsListPage
      locale={locale}
      variant="tableOnly"
      initialStatus={statusParam}
    />
  )
}

