'use client'
/* eslint-disable react/no-unescaped-entities */

import { useEffect, useState, type ReactNode } from 'react'
import { Link } from '@/i18n/navigation'
import Image from 'next/image'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/shared/common/components/ui/card'
import { Button } from '@/shared/common/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/shared/common/components/ui/dialog'
import { PaginationControl } from '@/shared/common/components/ui/pagination-control'
import { formatDateTimeLocale } from '@/shared/common/lib/formatter'
import type { AppLocale } from '@/shared/common/lib/locale-api'
import type { NewsItem } from '@/features/news/model'
import type { DashboardNewsListItem } from '@/features/dashboard/lib/attach-news-ids'
import { Newspaper, ListMinus, Eye, Zap } from 'lucide-react'
import { toast } from 'sonner'

const PER_PAGE = 5
const TITLE_MAX = 36

export type { DashboardNewsListItem } from '@/features/dashboard/lib/attach-news-ids'

type ListKind = 'top' | 'authorsChoice' | 'breaking'

type DashboardNewsListsProps = {
  topNews: DashboardNewsListItem[]
  authorsChoiceNews: DashboardNewsListItem[]
  breakingNews: DashboardNewsListItem[]
  mostReadNews: NewsItem[]
  locale: AppLocale
}

function truncateTitle(title: string, max = TITLE_MAX): string {
  const t = title.trim()
  if (t.length <= max) return t
  return `${t.slice(0, max)}…`
}

async function patchNewsFlag(newsId: string, body: Record<string, boolean>): Promise<boolean> {
  const res = await fetch(`/api/news/${newsId}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
    credentials: 'include',
  })
  if (!res.ok) {
    const err = (await res.json().catch(() => null)) as { error?: string } | null
    toast.error(err?.error ?? "Saqlashda xatolik")
    return false
  }
  return true
}

function SimpleRow({
  item,
  locale,
  showRemove,
  onRemoveClick,
  disabled,
}: {
  item: NewsItem
  locale: AppLocale
  showRemove?: boolean
  onRemoveClick?: () => void
  disabled?: boolean
}) {
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

export function DashboardNewsLists({
  topNews,
  authorsChoiceNews,
  breakingNews,
  mostReadNews,
  locale,
}: DashboardNewsListsProps) {
  const [topItems, setTopItems] = useState(topNews)
  const [authorsItems, setAuthorsItems] = useState(authorsChoiceNews)
  const [breakingItems, setBreakingItems] = useState(breakingNews)

  useEffect(() => {
    setTopItems(topNews)
  }, [topNews])
  useEffect(() => {
    setAuthorsItems(authorsChoiceNews)
  }, [authorsChoiceNews])
  useEffect(() => {
    setBreakingItems(breakingNews)
  }, [breakingNews])

  const [pageTop, setPageTop] = useState(1)
  const [pageAuthors, setPageAuthors] = useState(1)
  const [pageBreaking, setPageBreaking] = useState(1)
  const [pageMostRead, setPageMostRead] = useState(1)

  const [confirm, setConfirm] = useState<{
    open: boolean
    kind: ListKind | null
    item: DashboardNewsListItem | null
  }>({ open: false, kind: null, item: null })

  const [pendingId, setPendingId] = useState<string | null>(null)

  const totalPagesTop = Math.max(1, Math.ceil(topItems.length / PER_PAGE))
  const totalPagesAuthors = Math.max(1, Math.ceil(authorsItems.length / PER_PAGE))
  const totalPagesBreaking = Math.max(1, Math.ceil(breakingItems.length / PER_PAGE))
  const totalPagesMostRead = Math.max(1, Math.ceil(mostReadNews.length / PER_PAGE))

  const topPage = Math.min(pageTop, totalPagesTop)
  const authorsPage = Math.min(pageAuthors, totalPagesAuthors)
  const breakingPage = Math.min(pageBreaking, totalPagesBreaking)
  const mostReadPage = Math.min(pageMostRead, totalPagesMostRead)

  const topSlice = topItems.slice((topPage - 1) * PER_PAGE, topPage * PER_PAGE)
  const authorsSlice = authorsItems.slice((authorsPage - 1) * PER_PAGE, authorsPage * PER_PAGE)
  const breakingSlice = breakingItems.slice((breakingPage - 1) * PER_PAGE, breakingPage * PER_PAGE)
  const mostReadSlice = mostReadNews.slice((mostReadPage - 1) * PER_PAGE, mostReadPage * PER_PAGE)

  const openConfirm = (kind: ListKind, item: DashboardNewsListItem) => {
    setConfirm({ open: true, kind, item })
  }

  const closeConfirm = () => {
    setConfirm({ open: false, kind: null, item: null })
  }

  const confirmCopy: Record<
    ListKind,
    { title: string; description: string; patch: Record<string, boolean> }
  > = {
    top: {
      title: "Top yangiliklar ro'yxatidan olib tashlaysizmi?",
      description: "",
      patch: { isTop: false },
    },
    authorsChoice: {
      title: "Muallif tanlovi ro'yxatidan olib tashlaysizmi?",
      description: "",
      patch: { authorsChoice: false },
    },
    breaking: {
      title: "Breaking ro'yxatidan olib tashlaysizmi?",
      description: "",
      patch: { isBreaking: false },
    },
  }

  const handleConfirmRemove = async () => {
    const { kind, item } = confirm
    if (!kind || !item) return
    const { patch } = confirmCopy[kind]
    setPendingId(item.newsId)
    const ok = await patchNewsFlag(item.newsId, patch)
    setPendingId(null)
    if (!ok) return

    if (kind === 'top') {
      setTopItems((prev) => {
        const next = prev.filter((x) => x.slug !== item.slug)
        const totalPages = Math.max(1, Math.ceil(next.length / PER_PAGE))
        setPageTop((p) => Math.min(p, totalPages))
        return next
      })
    } else if (kind === 'authorsChoice') {
      setAuthorsItems((prev) => {
        const next = prev.filter((x) => x.slug !== item.slug)
        const totalPages = Math.max(1, Math.ceil(next.length / PER_PAGE))
        setPageAuthors((p) => Math.min(p, totalPages))
        return next
      })
    } else {
      setBreakingItems((prev) => {
        const next = prev.filter((x) => x.slug !== item.slug)
        const totalPages = Math.max(1, Math.ceil(next.length / PER_PAGE))
        setPageBreaking((p) => Math.min(p, totalPages))
        return next
      })
    }
    toast.success("Ro'yxat yangilandi")
    closeConfirm()
  }

  const listBlock = (
    title: ReactNode,
    description: string,
    items: DashboardNewsListItem[],
    slice: DashboardNewsListItem[],
    kind: ListKind,
    page: number,
    totalPages: number,
    setPage: React.Dispatch<React.SetStateAction<number>>,
    empty: string
  ) => (
    <Card className="shadow-sm">
      <CardHeader className="space-y-1 px-4 py-0">
        <CardTitle className="flex items-center gap-2 text-base">{title}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2 px-4 py-0 md:space-y-3">
        {items.length === 0 ? (
          <p className="text-sm text-muted-foreground py-1">{empty}</p>
        ) : (
          <>
            <div className="max-h-[min(22rem,50vh)] space-y-1.5 overflow-y-auto md:space-y-2 md:pr-1">
              {slice.map((item) => (
                <SimpleRow
                  key={item.slug}
                  item={item}
                  locale={locale}
                  showRemove
                  disabled={pendingId === item.newsId}
                  onRemoveClick={() => openConfirm(kind, item)}
                />
              ))}
            </div>
            <PaginationControl
              page={page}
              totalPages={totalPages}
              onPrev={() => setPage((p) => Math.max(1, p - 1))}
              onNext={() => setPage((p) => Math.min(totalPages, p + 1))}
            />
          </>
        )}
      </CardContent>
    </Card>
  )

  const readOnlyCard = (
    title: ReactNode,
    description: string,
    slice: NewsItem[],
    total: number,
    page: number,
    totalPages: number,
    setPage: React.Dispatch<React.SetStateAction<number>>,
    empty: string
  ) => (
    <Card className="shadow-sm">
      <CardHeader className="space-y-1 px-4">
        <CardTitle className="flex items-center gap-2 text-base">{title}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2 px-4 py-0 md:space-y-3">
        {total === 0 ? (
          <p className="text-sm text-muted-foreground py-1">{empty}</p>
        ) : (
          <>
            <div className="max-h-[min(22rem,50vh)] space-y-1.5 overflow-y-auto md:space-y-2 md:pr-1">
              {slice.map((item) => (
                <SimpleRow key={item.slug} item={item} locale={locale} />
              ))}
            </div>
            <PaginationControl
              page={page}
              totalPages={totalPages}
              onPrev={() => setPage((p) => Math.max(1, p - 1))}
              onNext={() => setPage((p) => Math.min(totalPages, p + 1))}
            />
          </>
        )}
      </CardContent>
    </Card>
  )

  return (
    <div className="space-y-4 md:space-y-6">
      <div className="grid gap-4 md:gap-6 lg:grid-cols-2">
        {listBlock(
          <>
            <Newspaper className="size-5 shrink-0" />
            Top yangiliklar
          </>,
          'Eng muhim yangiliklar',
          topItems,
          topSlice,
          'top',
          topPage,
          totalPagesTop,
          setPageTop,
          "Top yangiliklar yo'q."
        )}
        {listBlock(
          <>
            <span className="text-amber-600 dark:text-amber-400">★</span>
            Muallif tanlovi
          </>,
          'Tahririyat tanlangan yangiliklar',
          authorsItems,
          authorsSlice,
          'authorsChoice',
          authorsPage,
          totalPagesAuthors,
          setPageAuthors,
          "Muallif tanlovi yangiliklar yo'q."
        )}
        {listBlock(
          <>
            <Zap className="size-5 shrink-0 text-amber-500" />
            Dolzarb
          </>,
          'Dolzarb yangiliklar',
          breakingItems,
          breakingSlice,
          'breaking',
          breakingPage,
          totalPagesBreaking,
          setPageBreaking,
          "Breaking yangiliklar yo'q."
        )}
        {readOnlyCard(
          <>
            <Eye className="size-5 shrink-0" />
            Ko'p o'qilgan
          </>,
          "Ko'rishlar soni bo'yicha",
          mostReadSlice,
          mostReadNews.length,
          mostReadPage,
          totalPagesMostRead,
          setPageMostRead,
          "Yangiliklar yo'q."
        )}
      </div>

      <Dialog open={confirm.open} onOpenChange={(open) => !open && closeConfirm()}>
        <DialogContent showCloseButton>
          <DialogHeader>
            <DialogTitle>
              {confirm.kind ? confirmCopy[confirm.kind].title : ''}
            </DialogTitle>
            <DialogDescription>
              {confirm.kind ? confirmCopy[confirm.kind].description : ''}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex gap-2 sm:gap-2">
            <Button type="button" variant="outline" onClick={closeConfirm}>
              Bekor qilish
            </Button>
            <Button
              type="button"
              variant="default"
              disabled={pendingId != null}
              onClick={() => void handleConfirmRemove()}
            >
              Tasdiqlash
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
