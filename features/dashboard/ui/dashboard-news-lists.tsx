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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/shared/common/components/ui/table'

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
                <div className="rounded-md border overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-12">#</TableHead>
                        <TableHead className="w-[84px]">Rasm</TableHead>
                        <TableHead>Sarlavha</TableHead>
                        <TableHead className="whitespace-nowrap">Sana</TableHead>
                        <TableHead className="whitespace-nowrap text-right">Ko‘rishlar</TableHead>
                        <TableHead className="w-[72px] text-right">Amal</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {topSlice.map((item, index) => (
                        <TableRow key={item.slug} className="hover:bg-muted/40">
                          <TableCell className="text-xs text-muted-foreground">
                            #{(topPage - 1) * PER_PAGE + index + 1}
                          </TableCell>
                          <TableCell>
                            <Link
                              href={`/dashboard/news/${item.slug}/edit`}
                              className="block"
                            >
                              <div className="relative h-12 w-16 overflow-hidden rounded-md bg-muted">
                                {item.images[0] ? (
                                  <Image
                                    src={item.images[0]}
                                    alt=""
                                    fill
                                    className="object-cover"
                                    sizes="64px"
                                  />
                                ) : (
                                  <div className="flex h-full items-center justify-center">
                                    <Newspaper className="size-4 text-muted-foreground" />
                                  </div>
                                )}
                              </div>
                            </Link>
                          </TableCell>
                          <TableCell>
                            <Link
                              href={`/dashboard/news/${item.slug}/edit`}
                              className="text-sm font-medium line-clamp-2 hover:underline"
                            >
                              {item.title}
                            </Link>
                          </TableCell>
                          <TableCell className="text-xs text-muted-foreground whitespace-nowrap">
                            {formatDateTimeLocale(item.publishedAt, locale)}
                          </TableCell>
                          <TableCell className="text-xs text-muted-foreground text-right whitespace-nowrap">
                            {item.views.toLocaleString()} ko‘rish
                          </TableCell>
                          <TableCell className="text-right">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="text-destructive hover:text-destructive hover:bg-destructive/10"
                              onClick={() => handleRemoveClick(item.slug, 'top')}
                              title="Top ro‘yxatdan olib tashlash"
                            >
                              <Trash2 className="size-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
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

        {/* Muallif tanlovi — jadval ko‘rinishida */}
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
                <div className="rounded-md border overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-12">#</TableHead>
                        <TableHead className="w-[84px]">Rasm</TableHead>
                        <TableHead>Sarlavha</TableHead>
                        <TableHead>Muallif</TableHead>
                        <TableHead className="whitespace-nowrap">Sana</TableHead>
                        <TableHead className="w-[72px] text-right">Amal</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {authorsSlice.map((item, index) => (
                        <TableRow key={item.slug} className="hover:bg-muted/40">
                          <TableCell className="text-xs text-muted-foreground">
                            #{(authorsPage - 1) * PER_PAGE + index + 1}
                          </TableCell>
                          <TableCell>
                            <Link
                              href={`/dashboard/news/${item.slug}/edit`}
                              className="block"
                            >
                              <div className="relative h-12 w-16 overflow-hidden rounded-md bg-muted">
                                {item.images[0] ? (
                                  <Image
                                    src={item.images[0]}
                                    alt=""
                                    fill
                                    className="object-cover"
                                    sizes="64px"
                                  />
                                ) : (
                                  <div className="flex h-full items-center justify-center">
                                    <Newspaper className="size-4 text-muted-foreground" />
                                  </div>
                                )}
                              </div>
                            </Link>
                          </TableCell>
                          <TableCell>
                            <Link
                              href={`/dashboard/news/${item.slug}/edit`}
                              className="text-sm font-medium line-clamp-2 hover:underline"
                            >
                              {item.title}
                            </Link>
                          </TableCell>
                          <TableCell className="text-xs text-muted-foreground">
                            {item.author}
                          </TableCell>
                          <TableCell className="text-xs text-muted-foreground whitespace-nowrap">
                            {formatDateTimeLocale(item.publishedAt, locale)}
                          </TableCell>
                          <TableCell className="text-right">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="text-destructive hover:text-destructive hover:bg-destructive/10"
                              onClick={() => handleRemoveClick(item.slug, 'authorsChoice')}
                              title="Muallif tanlovidan olib tashlash"
                            >
                              <Trash2 className="size-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
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

        {/* Ko'p o'qilgan — jadval ko‘rinishi, delete yo'q */}
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
                <div className="rounded-md border overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-12">#</TableHead>
                        <TableHead className="w-[84px]">Rasm</TableHead>
                        <TableHead>Sarlavha</TableHead>
                        <TableHead className="whitespace-nowrap">Sana</TableHead>
                        <TableHead className="whitespace-nowrap text-right">Ko‘rishlar</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {mostReadSlice.map((item, index) => (
                        <TableRow key={item.slug} className="hover:bg-muted/40">
                          <TableCell className="text-xs text-muted-foreground">
                            #{(mostReadPage - 1) * PER_PAGE + index + 1}
                          </TableCell>
                          <TableCell>
                            <Link
                              href={`/dashboard/news/${item.slug}/edit`}
                              className="block"
                            >
                              <div className="relative h-12 w-16 overflow-hidden rounded-md bg-muted">
                                {item.images[0] ? (
                                  <Image
                                    src={item.images[0]}
                                    alt=""
                                    fill
                                    className="object-cover"
                                    sizes="64px"
                                  />
                                ) : (
                                  <div className="flex h-full items-center justify-center">
                                    <Newspaper className="size-4 text-muted-foreground" />
                                  </div>
                                )}
                              </div>
                            </Link>
                          </TableCell>
                          <TableCell>
                            <Link
                              href={`/dashboard/news/${item.slug}/edit`}
                              className="text-sm font-medium line-clamp-2 hover:underline"
                            >
                              {item.title}
                            </Link>
                          </TableCell>
                          <TableCell className="text-xs text-muted-foreground whitespace-nowrap">
                            {formatDateTimeLocale(item.publishedAt, locale)}
                          </TableCell>
                          <TableCell className="text-xs text-muted-foreground text-right whitespace-nowrap">
                            {item.views.toLocaleString()} ko‘rish
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
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
