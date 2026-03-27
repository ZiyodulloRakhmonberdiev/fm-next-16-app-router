'use client'

import { Link } from '@/i18n/navigation'
import {
  Card,
  CardDescription,
  CardTitle,
} from '@/shared/common/components/ui/card'
import type { NewsStatus } from '@/features/news/model'
import { Newspaper } from 'lucide-react'

type StatusIconMap = Record<NewsStatus, React.ComponentType<{ className?: string }>>

type NewsListSummaryCardsProps = {
  total: number
  countsByStatus: Record<NewsStatus, number>
  statusOptions: { value: '' | NewsStatus; label: string }[]
  statusIcons: StatusIconMap
}

export function NewsListSummaryCards({
  total,
  countsByStatus,
  statusOptions,
  statusIcons,
}: NewsListSummaryCardsProps) {
  return (
    <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 sm:gap-4">
      <Link href="/dashboard/news" className="block">
        <Card className="hover:border-primary/60 transition-colors cursor-pointer h-full p-2 md:p-4">
          <div className="py-3 flex flex-row items-center gap-3 px-0 md:px-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
              <Newspaper className="size-5 text-primary" />
            </div>
            <div className="min-w-0">
              <CardTitle className="text-sm font-medium">Barchasi</CardTitle>
              <CardDescription>{total} ta yangilik</CardDescription>
            </div>
          </div>
        </Card>
      </Link>
      {statusOptions.filter((s) => s.value !== '').map((option) => {
        const value = option.value as NewsStatus
        const count = countsByStatus[value]
        const Icon = statusIcons[value]
        return (
          <Link key={value} href={`/dashboard/news/status/${value}`} className="block">
            <Card className="hover:border-primary/60 transition-colors cursor-pointer h-full p-2 md:p-4">
              <div className="py-3 flex flex-row items-center gap-3 px-0 md:px-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                  <Icon className="size-5 text-primary" />
                </div>
                <div className="min-w-0">
                  <CardTitle className="text-sm font-medium">{option.label}</CardTitle>
                  <CardDescription>{count} ta yangilik</CardDescription>
                </div>
              </div>
            </Card>
          </Link>
        )
      })}
    </div>
  )
}
