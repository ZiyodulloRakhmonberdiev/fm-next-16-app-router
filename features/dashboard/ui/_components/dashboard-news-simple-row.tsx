'use client'

import { Link } from '@/i18n/navigation'
import Image from 'next/image'
import { Button } from '@/shared/common/components/ui/button'
import { formatDateTimeLocale } from '@/shared/common/lib/formatter'
import type { AppLocale } from '@/shared/common/lib/locale-api'
import type { NewsItem } from '@/features/news/model'
import { ListMinus, Newspaper } from 'lucide-react'

const TITLE_MAX = 36

function truncateTitle(title: string, max = TITLE_MAX): string {
  const t = title.trim()
  if (t.length <= max) return t
  return `${t.slice(0, max)}…`
}

type DashboardNewsSimpleRowProps = {
  item: NewsItem
  locale: AppLocale
  showRemove?: boolean
  onRemoveClick?: () => void
  disabled?: boolean
}

export function DashboardNewsSimpleRow({
  item,
  locale,
  showRemove,
  onRemoveClick,
  disabled,
}: DashboardNewsSimpleRowProps) {
  return (
    <div className="flex items-center gap-2 rounded-lg border border-border/60 bg-muted/15 px-2 py-2 md:gap-3 md:px-3 md:py-2.5">
      <Link
        href={`/dashboard/news/${item.slug}/edit`}
        className="relative size-12 shrink-0 overflow-hidden rounded-md bg-muted md:size-14"
      >
        {item.images[0] ? (
          <Image src={item.images[0]} alt="" fill className="object-cover" sizes="56px" />
        ) : (
          <div className="flex size-full items-center justify-center">
            <Newspaper className="size-4 text-muted-foreground md:size-5" />
          </div>
        )}
      </Link>
      <div className="min-w-0 flex-1">
        <Link
          href={`/dashboard/news/${item.slug}/edit`}
          className="text-sm font-medium leading-snug hover:underline"
          title={item.title}
        >
          {truncateTitle(item.title)}
        </Link>
        <p className="mt-0.5 text-[11px] text-muted-foreground tabular-nums md:text-xs">
          {formatDateTimeLocale(item.publishedAt, locale)} · {item.views.toLocaleString()} ko&apos;rish
        </p>
      </div>
      {showRemove && onRemoveClick ? (
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="size-8 shrink-0 text-muted-foreground hover:bg-muted hover:text-foreground md:size-9"
          disabled={disabled}
          onClick={onRemoveClick}
          aria-label="Ro'yxatdan olib tashlash"
        >
          <ListMinus className="size-4" />
        </Button>
      ) : null}
    </div>
  )
}
