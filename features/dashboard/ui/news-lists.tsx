'use client'
/* eslint-disable react/no-unescaped-entities */

import { useEffect, useMemo, useState } from 'react'
import type { AppLocale } from '@/shared/common/lib/locale-api'
import type { NewsItem } from '@/features/news/model'
import type { DashboardNewsListItem } from '@/features/dashboard/lib/attach-news-ids'
import { Eye, Newspaper, Zap } from 'lucide-react'
import { toast } from 'sonner'
import { DashboardNewsListCard } from './_components/dashboard-news-list-card'
import { DashboardNewsRemoveConfirmDialog } from './_components/dashboard-news-remove-confirm-dialog'

const PER_PAGE = 5

export type { DashboardNewsListItem } from '@/features/dashboard/lib/attach-news-ids'

type ListKind = 'top' | 'authorsChoice' | 'breaking'

type DashboardNewsListsProps = {
  topNews: DashboardNewsListItem[]
  authorsChoiceNews: DashboardNewsListItem[]
  breakingNews: DashboardNewsListItem[]
  mostReadNews: NewsItem[]
  locale: AppLocale
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

  const confirmTitle = useMemo(() => (confirm.kind ? confirmCopy[confirm.kind].title : ''), [confirm.kind])
  const confirmDescription = useMemo(
    () => (confirm.kind ? confirmCopy[confirm.kind].description : ''),
    [confirm.kind]
  )

  return (
    <div className="space-y-4 md:space-y-6">
      <div className="grid gap-4 md:gap-6 lg:grid-cols-2">
        <DashboardNewsListCard
          title={
            <>
              <Newspaper className="size-5 shrink-0" />
              Top yangiliklar
            </>
          }
          items={topSlice}
          locale={locale}
          emptyText="Top yangiliklar yo'q."
          page={topPage}
          totalPages={totalPagesTop}
          onPrev={() => setPageTop((p) => Math.max(1, p - 1))}
          onNext={() => setPageTop((p) => Math.min(totalPagesTop, p + 1))}
          showRemove
          isPendingItem={(item) => pendingId === (item as DashboardNewsListItem).newsId}
          onRemoveClick={(item) => openConfirm('top', item as DashboardNewsListItem)}
        />
        <DashboardNewsListCard
          title={
            <>
              <span className="text-amber-600 dark:text-amber-400">★</span>
              Muallif tanlovi
            </>
          }
          items={authorsSlice}
          locale={locale}
          emptyText="Muallif tanlovi yangiliklar yo'q."
          page={authorsPage}
          totalPages={totalPagesAuthors}
          onPrev={() => setPageAuthors((p) => Math.max(1, p - 1))}
          onNext={() => setPageAuthors((p) => Math.min(totalPagesAuthors, p + 1))}
          showRemove
          isPendingItem={(item) => pendingId === (item as DashboardNewsListItem).newsId}
          onRemoveClick={(item) => openConfirm('authorsChoice', item as DashboardNewsListItem)}
        />
        <DashboardNewsListCard
          title={
            <>
              <Zap className="size-5 shrink-0 text-amber-500" />
              Dolzarb
            </>
          }
          items={breakingSlice}
          locale={locale}
          emptyText="Breaking yangiliklar yo'q."
          page={breakingPage}
          totalPages={totalPagesBreaking}
          onPrev={() => setPageBreaking((p) => Math.max(1, p - 1))}
          onNext={() => setPageBreaking((p) => Math.min(totalPagesBreaking, p + 1))}
          showRemove
          isPendingItem={(item) => pendingId === (item as DashboardNewsListItem).newsId}
          onRemoveClick={(item) => openConfirm('breaking', item as DashboardNewsListItem)}
        />
        <DashboardNewsListCard
          title={
            <>
              <Eye className="size-5 shrink-0" />
              Ko'p o'qilgan
            </>
          }
          items={mostReadSlice}
          locale={locale}
          emptyText="Yangiliklar yo'q."
          page={mostReadPage}
          totalPages={totalPagesMostRead}
          onPrev={() => setPageMostRead((p) => Math.max(1, p - 1))}
          onNext={() => setPageMostRead((p) => Math.min(totalPagesMostRead, p + 1))}
        />
      </div>

      <DashboardNewsRemoveConfirmDialog
        open={confirm.open}
        title={confirmTitle}
        description={confirmDescription}
        disabled={pendingId != null}
        onClose={closeConfirm}
        onConfirm={() => void handleConfirmRemove()}
      />
    </div>
  )
}
