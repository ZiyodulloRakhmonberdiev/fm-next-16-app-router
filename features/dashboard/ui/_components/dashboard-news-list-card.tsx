'use client'

import type { ReactNode } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/common/components/ui/card'
import { PaginationControl } from '@/shared/common/components/ui/pagination-control'
import type { AppLocale } from '@/shared/common/lib/locale-api'
import type { NewsItem } from '@/features/news/model'
import { DashboardNewsSimpleRow } from './dashboard-news-simple-row'

type DashboardNewsListCardProps = {
  title: ReactNode
  items: NewsItem[]
  locale: AppLocale
  emptyText: string
  page: number
  totalPages: number
  onPrev: () => void
  onNext: () => void
  showRemove?: boolean
  isPendingItem?: (item: NewsItem) => boolean
  onRemoveClick?: (item: NewsItem) => void
}

export function DashboardNewsListCard({
  title,
  items,
  locale,
  emptyText,
  page,
  totalPages,
  onPrev,
  onNext,
  showRemove,
  isPendingItem,
  onRemoveClick,
}: DashboardNewsListCardProps) {
  return (
    <Card className="shadow-sm">
      <CardHeader className="space-y-1 px-4 py-0">
        <CardTitle className="flex items-center gap-2 text-base">{title}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2 px-4 py-0 md:space-y-3">
        {items.length === 0 ? (
          <p className="text-sm text-muted-foreground py-1">{emptyText}</p>
        ) : (
          <>
            <div className="max-h-[min(22rem,50vh)] space-y-1.5 overflow-y-auto md:space-y-2 md:pr-1">
              {items.map((item) => (
                <DashboardNewsSimpleRow
                  key={item.slug}
                  item={item}
                  locale={locale}
                  showRemove={showRemove}
                  disabled={isPendingItem?.(item)}
                  onRemoveClick={onRemoveClick ? () => onRemoveClick(item) : undefined}
                />
              ))}
            </div>
            <PaginationControl page={page} totalPages={totalPages} onPrev={onPrev} onNext={onNext} />
          </>
        )}
      </CardContent>
    </Card>
  )
}
