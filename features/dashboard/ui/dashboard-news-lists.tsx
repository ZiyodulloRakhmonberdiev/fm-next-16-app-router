'use client'

import { useState } from 'react'
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
import { formatDateTimeLocale } from '@/shared/common/lib/formatter'
import type { AppLocale } from '@/shared/common/lib/locale-api'
import type { NewsItem } from '@/features/news/model'
import { Newspaper, Trash2, Eye, ChevronLeft, ChevronRight } from 'lucide-react'

const PER_PAGE = 5

type ListType = 'top' | 'authorsChoice'

type DashboardNewsListsProps = {
  topNews: NewsItem[]
  authorsChoiceNews: NewsItem[]
  mostReadNews: NewsItem[]
  locale: AppLocale
}

function Pagination({
  page,
  totalPages,
  onPrev,
  onNext,
}: {
  page: number
  totalPages: number
  onPrev: () => void
  onNext: () => void
}) {
  if (totalPages <= 1) return null
  return (
    <div className="flex items-center justify-between gap-2 pt-2 border-t border-border mt-2">
      <Button
        variant="outline"
        size="sm"
        onClick={onPrev}
        disabled={page <= 1}
        className="gap-1"
      >
        <ChevronLeft className="size-4" />
        Oldingi
      </Button>
      <span className="text-sm text-muted-foreground">
        Sahifa {page} / {totalPages}
      </span>
      <Button
        variant="outline"
        size="sm"
        onClick={onNext}
        disabled={page >= totalPages}
        className="gap-1"
      >
        Keyingi
        <ChevronRight className="size-4" />
      </Button>
    </div>
  )
}

export function DashboardNewsLists({
  topNews,
  authorsChoiceNews,
  mostReadNews,
  locale,
}: DashboardNewsListsProps) {
  const [pageTop, setPageTop] = useState(1)
  const [pageAuthors, setPageAuthors] = useState(1)
  const [pageMostRead, setPageMostRead] = useState(1)
  const [removedFromTop, setRemovedFromTop] = useState<Set<string>>(new Set())
  const [removedFromAuthorsChoice, setRemovedFromAuthorsChoice] = useState<Set<string>>(new Set())
  const [confirmDialog, setConfirmDialog] = useState<{ open: boolean; slug: string; listType: ListType }>({
    open: false,
    slug: '',
    listType: 'top',
  })

  const topFiltered = topNews.filter((item) => !removedFromTop.has(item.slug))
  const authorsFiltered = authorsChoiceNews.filter((item) => !removedFromAuthorsChoice.has(item.slug))

  const totalPagesTop = Math.max(1, Math.ceil(topFiltered.length / PER_PAGE))
  const totalPagesAuthors = Math.max(1, Math.ceil(authorsFiltered.length / PER_PAGE))
  const totalPagesMostRead = Math.max(1, Math.ceil(mostReadNews.length / PER_PAGE))

  const topPage = Math.min(pageTop, totalPagesTop)
  const authorsPage = Math.min(pageAuthors, totalPagesAuthors)
  const mostReadPage = Math.min(pageMostRead, totalPagesMostRead)

  const topSlice = topFiltered.slice((topPage - 1) * PER_PAGE, topPage * PER_PAGE)
  const authorsSlice = authorsFiltered.slice((authorsPage - 1) * PER_PAGE, authorsPage * PER_PAGE)
  const mostReadSlice = mostReadNews.slice((mostReadPage - 1) * PER_PAGE, mostReadPage * PER_PAGE)

  const handleRemoveClick = (slug: string, listType: ListType) => {
    setConfirmDialog({ open: true, slug, listType })
  }

  const handleConfirmRemove = () => {
    const { slug, listType } = confirmDialog
    if (listType === 'top') {
      setRemovedFromTop((prev) => new Set(prev).add(slug))
      setPageTop((p) => Math.max(1, Math.min(p, Math.ceil((topFiltered.length - 1) / PER_PAGE))))
    } else {
      setRemovedFromAuthorsChoice((prev) => new Set(prev).add(slug))
      setPageAuthors((p) => Math.max(1, Math.min(p, Math.ceil((authorsFiltered.length - 1) / PER_PAGE))))
    }
    setConfirmDialog({ open: false, slug: '', listType: 'top' })
  }

  const handleCancelDialog = () => {
    setConfirmDialog({ open: false, slug: '', listType: 'top' })
  }

  const confirmTitle =
    confirmDialog.listType === 'top'
      ? "Top yangiliklar ro'yxatidan olib tashlashni xohlaysizmi?"
      : "Muallif tanlovi ro'yxatidan olib tashlashni xohlaysizmi?"
  const confirmDescription =
    confirmDialog.listType === 'top'
      ? "Tasdiqlanganda bu yangilik Top yangiliklar ro'yxatidan chiqariladi (isTop false qilinadi)."
      : "Tasdiqlanganda bu yangilik Muallif tanlovi ro'yxatidan chiqariladi (authorsChoice false qilinadi)."

  return (
    <div className="space-y-8">
      <div className="grid gap-8 lg:grid-cols-3">
        {/* Top news — delete tugmasi card content tashqarisida (har bir qator o‘ngida) */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Newspaper className="size-5" />
              Top yangiliklar
            </CardTitle>
            <CardDescription>Eng muhim yangiliklar</CardDescription>
          </CardHeader>
          <CardContent>
            {topFiltered.length === 0 ? (
              <p className="text-sm text-muted-foreground py-4">Top yangiliklar yo‘q.</p>
            ) : (
              <>
                <ul className="space-y-3">
                  {topSlice.map((item) => (
                    <li key={item.slug} className="flex items-stretch gap-2 rounded-lg border border-border/50 overflow-hidden">
                      <Link
                        href={`/news/${item.slug}`}
                        className="flex min-w-0 flex-1 gap-3 p-2 hover:bg-muted/50 transition-colors"
                      >
                        <div className="relative h-14 w-20 shrink-0 overflow-hidden rounded-md bg-muted">
                          {item.images[0] ? (
                            <Image src={item.images[0]} alt="" fill className="object-cover" sizes="80px" />
                          ) : (
                            <div className="flex h-full items-center justify-center">
                              <Newspaper className="size-6 text-muted-foreground" />
                            </div>
                          )}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="font-medium text-sm line-clamp-2">{item.title}</p>
                          <p className="text-xs text-muted-foreground mt-0.5">
                            {formatDateTimeLocale(item.publishedAt, locale)} · {item.views} ko‘rish
                          </p>
                        </div>
                      </Link>
                      <div className="flex items-center border-l border-border/50 bg-muted/30 px-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="shrink-0 text-destructive hover:text-destructive hover:bg-destructive/10"
                          onClick={() => handleRemoveClick(item.slug, 'top')}
                          title="Top ro‘yxatdan olib tashlash"
                        >
                          <Trash2 className="size-4" />
                          <span className="sr-only">Olib tashlash</span>
                        </Button>
                      </div>
                    </li>
                  ))}
                </ul>
                <Pagination
                  page={topPage}
                  totalPages={totalPagesTop}
                  onPrev={() => setPageTop((p) => Math.max(1, p - 1))}
                  onNext={() => setPageTop((p) => Math.min(totalPagesTop, p + 1))}
                />
              </>
            )}
          </CardContent>
        </Card>

        {/* Muallif tanlovi — delete card content tashqarisida */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <span className="text-amber-600 dark:text-amber-400">★</span>
              Muallif tanlovi
            </CardTitle>
            <CardDescription>Tahririyat tanlangan yangiliklar</CardDescription>
          </CardHeader>
          <CardContent>
            {authorsFiltered.length === 0 ? (
              <p className="text-sm text-muted-foreground py-4">Muallif tanlovi yangiliklar yo‘q.</p>
            ) : (
              <>
                <ul className="space-y-3">
                  {authorsSlice.map((item) => (
                    <li key={item.slug} className="flex items-stretch gap-2 rounded-lg border border-border/50 overflow-hidden">
                      <Link
                        href={`/news/${item.slug}`}
                        className="flex min-w-0 flex-1 gap-3 p-2 hover:bg-muted/50 transition-colors"
                      >
                        <div className="relative h-14 w-20 shrink-0 overflow-hidden rounded-md bg-muted">
                          {item.images[0] ? (
                            <Image src={item.images[0]} alt="" fill className="object-cover" sizes="80px" />
                          ) : (
                            <div className="flex h-full items-center justify-center">
                              <Newspaper className="size-6 text-muted-foreground" />
                            </div>
                          )}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="font-medium text-sm line-clamp-2">{item.title}</p>
                          <p className="text-xs text-muted-foreground mt-0.5">
                            {formatDateTimeLocale(item.publishedAt, locale)} · {item.author}
                          </p>
                        </div>
                      </Link>
                      <div className="flex items-center border-l border-border/50 bg-muted/30 px-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="shrink-0 text-destructive hover:text-destructive hover:bg-destructive/10"
                          onClick={() => handleRemoveClick(item.slug, 'authorsChoice')}
                          title="Muallif tanlovidan olib tashlash"
                        >
                          <Trash2 className="size-4" />
                          <span className="sr-only">Olib tashlash</span>
                        </Button>
                      </div>
                    </li>
                  ))}
                </ul>
                <Pagination
                  page={authorsPage}
                  totalPages={totalPagesAuthors}
                  onPrev={() => setPageAuthors((p) => Math.max(1, p - 1))}
                  onNext={() => setPageAuthors((p) => Math.min(totalPagesAuthors, p + 1))}
                />
              </>
            )}
          </CardContent>
        </Card>

        {/* Ko'p o'qilgan — pagination, delete yo'q */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Eye className="size-5" />
              Ko‘p o‘qilgan
            </CardTitle>
            <CardDescription>Ko‘rishlar soni bo‘yicha</CardDescription>
          </CardHeader>
          <CardContent>
            {mostReadNews.length === 0 ? (
              <p className="text-sm text-muted-foreground py-4">Yangiliklar yo‘q.</p>
            ) : (
              <>
                <ul className="space-y-3">
                  {mostReadSlice.map((item) => (
                    <li key={item.slug}>
                      <Link
                        href={`/news/${item.slug}`}
                        className="flex gap-3 rounded-lg border border-border/50 p-2 hover:bg-muted/50 transition-colors"
                      >
                        <div className="relative h-14 w-20 shrink-0 overflow-hidden rounded-md bg-muted">
                          {item.images[0] ? (
                            <Image src={item.images[0]} alt="" fill className="object-cover" sizes="80px" />
                          ) : (
                            <div className="flex h-full items-center justify-center">
                              <Newspaper className="size-6 text-muted-foreground" />
                            </div>
                          )}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="font-medium text-sm line-clamp-2">{item.title}</p>
                          <p className="text-xs text-muted-foreground mt-0.5">
                            {formatDateTimeLocale(item.publishedAt, locale)} · {item.views} ko‘rish
                          </p>
                        </div>
                      </Link>
                    </li>
                  ))}
                </ul>
                <Pagination
                  page={mostReadPage}
                  totalPages={totalPagesMostRead}
                  onPrev={() => setPageMostRead((p) => Math.max(1, p - 1))}
                  onNext={() => setPageMostRead((p) => Math.min(totalPagesMostRead, p + 1))}
                />
              </>
            )}
          </CardContent>
        </Card>
      </div>

      <Dialog open={confirmDialog.open} onOpenChange={(open) => !open && handleCancelDialog()}>
        <DialogContent showCloseButton={true}>
          <DialogHeader>
            <DialogTitle>{confirmTitle}</DialogTitle>
            <DialogDescription>{confirmDescription}</DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={handleCancelDialog}>
              Bekor qilish
            </Button>
            <Button variant="destructive" onClick={handleConfirmRemove}>
              Tasdiqlash
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
