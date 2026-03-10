'use client'
/* eslint-disable react/no-unescaped-entities */

import { useState, useMemo } from 'react'
import { toast } from 'sonner'
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
import { Input } from '@/shared/common/components/ui/input'
import { Label } from '@/shared/common/components/ui/label'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuCheckboxItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from '@/shared/common/components/ui/dropdown-menu'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/shared/common/components/ui/dialog'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/shared/common/components/ui/table'
import { PaginationControl } from '@/shared/common/components/ui/pagination-control'
import { formatDateTimeLocale } from '@/shared/common/lib/formatter'
import type { AppLocale } from '@/shared/common/lib/locale-api'
import { LOCALES } from '@/shared/common/lib/locale-constants'
import type { NewsItem, NewsStatus, RawNewsItem } from '@/features/news/model'
import { useNewsQuery } from '@/features/dashboard/model/admin-hooks'
import {
  Newspaper, PlusCircle, Eye, Search, ChevronDown,
  ExternalLink, Pencil, Columns3, Languages,
  Check, CircleOff, Clock, Send, Ban, Trash2, Archive,
} from 'lucide-react'

const PER_PAGE = 40

const STATUS_OPTIONS: { value: '' | NewsStatus; label: string }[] = [
  { value: '', label: 'Barcha statuslar' },
  { value: 'pending', label: 'Kutilmoqda' },
  { value: 'published', label: 'Nashr qilingan' },
  { value: 'cancelled', label: 'Bekor qilingan' },
  { value: 'deleted', label: "O'chirilgan" },
  { value: 'archived', label: 'Arxivlangan' },
]

const STATUS_ICONS: Record<NewsStatus, React.ComponentType<{ className?: string }>> = {
  pending: Clock, published: Send, cancelled: Ban, deleted: Trash2, archived: Archive,
}

const TOP_OPTIONS: { value: '' | 'yes' | 'no'; label: string }[] = [
  { value: '', label: 'Barchasi' },
  { value: 'yes', label: 'Ha (Top)' },
  { value: 'no', label: "Yo'q" },
]

const TYPE_OPTIONS_FULL: { value: '' | 'video' | 'image'; label: string }[] = [
  { value: '', label: 'Barcha turlar' },
  { value: 'video', label: 'Video' },
  { value: 'image', label: 'Rasm' },
]

const COLUMN_KEYS = [
  'rasm', 'sarlavha', 'kategoriya', 'status', 'tur', 'top',
  'publishedAt', 'views', 'tarjimalar', 'amallar',
] as const

const COLUMN_LABELS: Record<(typeof COLUMN_KEYS)[number], string> = {
  rasm: 'Rasm', sarlavha: 'Sarlavha', kategoriya: 'Kategoriya',
  status: 'Status', tur: 'Tur', top: 'Top', publishedAt: 'publishedAt',
  views: "Ko'rishlar", tarjimalar: 'Tarjimalar', amallar: 'Amallar',
}

export type TranslationsForSlug = {
  title: Record<AppLocale, string | undefined>
  description: Record<AppLocale, string | undefined>
  content: Record<AppLocale, boolean>
}

type DashboardNewsListPageProps = {
  locale: AppLocale
  variant?: 'full' | 'tableOnly'
  initialStatus?: '' | NewsStatus
}

function FilterSelect<T extends string>({
  label,
  value,
  options,
  onSelect,
  placeholder = 'Tanlang',
}: {
  label: string
  value: T | ''
  options: { value: T | ''; label: string }[]
  onSelect: (value: T | '') => void
  placeholder?: string
}) {
  const selectedLabel = options.find((o) => o.value === value)?.label ?? placeholder
  return (
    <div className="space-y-2">
      <Label className="text-sm font-medium">{label}</Label>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" className="w-full justify-between font-normal" size="sm">
            <span className="truncate">{selectedLabel}</span>
            <ChevronDown className="ml-2 size-4 shrink-0 opacity-50" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-(--radix-dropdown-menu-trigger-width)">
          {options.map((o) => (
            <DropdownMenuItem key={o.value || 'all'} onClick={() => onSelect(o.value)}>
              {o.label}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}

export function DashboardNewsListPage({
  locale,
  variant = 'full',
  initialStatus = '',
}: DashboardNewsListPageProps) {
  const { data, isLoading, error } = useNewsQuery(variant === 'tableOnly' ? initialStatus || undefined : undefined)
  const rawNews = useMemo(() => data?.data ?? [], [data])
  const news = useMemo(
    () => {
      const pickTitle = (raw: RawNewsItem) => {
        const localized = raw.title?.[locale]
        if (localized && localized.trim()) return localized
        for (const fallback of LOCALES) {
          const t = raw.title?.[fallback]
          if (t && t.trim()) return t
        }
        return raw.slug
      }

      return (rawNews as RawNewsItem[])
        .map((raw): NewsItem => ({
          slug: raw.slug,
          title: pickTitle(raw),
          description: raw.description?.[locale] ?? undefined,
          content: raw.content?.[locale],
          images: raw.images ?? [],
          category: raw.categorySlug,
          categorySlug: raw.categorySlug,
          tags: raw.tagSlugs ?? [],
          publishedAt: raw.publishedAt,
          minutes: raw.minutes ?? 1,
          views: raw.views ?? 0,
          author: raw.author ?? '',
          status: raw.status ?? 'published',
          isTop: raw.isTop ?? false,
          type: raw.type,
          isBreaking: raw.isBreaking ?? false,
          pushedToTelegram: raw.pushedToTelegram,
          pushedToTelegramAt: raw.pushedToTelegramAt,
          videoSource: raw.videoSource,
          videoUrl: raw.videoUrl,
        }))
        .sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime())
    },
    [rawNews, locale]
  )
  const translationsBySlug = useMemo<Record<string, TranslationsForSlug>>(() => {
    const out: Record<string, TranslationsForSlug> = {}
    for (const raw of rawNews as RawNewsItem[]) {
      const title: Record<AppLocale, string | undefined> = {} as Record<AppLocale, string | undefined>
      const description: Record<AppLocale, string | undefined> = {} as Record<AppLocale, string | undefined>
      const content: Record<AppLocale, boolean> = {} as Record<AppLocale, boolean>
      for (const loc of LOCALES) {
        title[loc] = (raw.title as Record<string, string | undefined>)[loc]
        description[loc] = (raw.description as Record<string, string | undefined> | undefined)?.[loc]
        content[loc] = !!(raw.content as Record<string, unknown> | undefined)?.[loc]
      }
      out[raw.slug] = { title, description, content }
    }
    return out
  }, [rawNews])

  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<'' | NewsStatus>(initialStatus)
  const [isTopFilter, setIsTopFilter] = useState<'' | 'yes' | 'no'>('')
  const [typeFilter, setTypeFilter] = useState<'' | 'video' | 'image'>('')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const [columnVisibility, setColumnVisibility] = useState<Record<string, boolean>>(() =>
    Object.fromEntries(COLUMN_KEYS.map((k) => [k, true]))
  )
  const [translationsModalSlug, setTranslationsModalSlug] = useState<string | null>(null)

  const countsByStatus = useMemo(() => {
    const base: Record<NewsStatus, number> = {
      pending: 0, published: 0, cancelled: 0, deleted: 0, archived: 0,
    }
    for (const item of news) {
      const status = (item.status ?? 'published') as NewsStatus
      if (base[status] !== undefined) base[status]++
    }
    return base
  }, [news])

  const filtered = useMemo(() => {
    let list = [...news]
    const q = search.trim().toLowerCase()
    if (q) {
      list = list.filter(
        (item) =>
          item.title.toLowerCase().includes(q) ||
          item.category.toLowerCase().includes(q) ||
          item.author.toLowerCase().includes(q)
      )
    }
    if (statusFilter) list = list.filter((item) => (item.status ?? 'published') === statusFilter)
    if (isTopFilter === 'yes') list = list.filter((item) => item.isTop === true)
    if (isTopFilter === 'no') list = list.filter((item) => item.isTop !== true)
    if (typeFilter) list = list.filter((item) => (item.type ?? '') === typeFilter)
    if (dateFrom) {
      const from = new Date(dateFrom)
      from.setHours(0, 0, 0, 0)
      list = list.filter((item) => new Date(item.publishedAt) >= from)
    }
    if (dateTo) {
      const to = new Date(dateTo)
      to.setHours(23, 59, 59, 999)
      list = list.filter((item) => new Date(item.publishedAt) <= to)
    }
    return list
  }, [news, search, statusFilter, isTopFilter, typeFilter, dateFrom, dateTo])

  const totalPages = Math.max(1, Math.ceil(filtered.length / PER_PAGE))
  const currentPage = Math.min(page, totalPages)
  const slice = filtered.slice((currentPage - 1) * PER_PAGE, currentPage * PER_PAGE)

  const clearFilters = () => {
    setSearch('')
    setStatusFilter('')
    setIsTopFilter('')
    setTypeFilter('')
    setDateFrom('')
    setDateTo('')
    setPage(1)
  }

  const isTrashView = initialStatus === 'deleted'
  const titleText = variant === 'full' ? 'Yangiliklar' : isTrashView ? 'Savat' : 'Yangiliklar'
  const descriptionText =
    variant === 'full'
      ? "Barcha yangiliklar ro'yxati. Yangi yangilik qo'shish uchun quyidagi tugmani bosing."
      : isTrashView
      ? "Savatga o'tkazilgan yangiliklar."
      : 'Filtrlangan yangiliklar ro\'yxati.'

  return (
    <div className="space-y-6 min-w-0 overflow-hidden scrollbar-hide">
      <Card className="border-primary/30 bg-primary/5">
        <CardHeader className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div>
            <CardTitle className="text-xl flex items-center gap-2">
              <Newspaper className="size-6" />
              {titleText}
            </CardTitle>
            <CardDescription>{descriptionText}</CardDescription>
          </div>
          {variant === 'full' && (
            <Button asChild size="lg" className="shrink-0 w-full md:w-auto">
              <Link href="/dashboard/news/create">
                <PlusCircle className="size-4 mr-2" />
                Yangilik yaratish
              </Link>
            </Button>
          )}
        </CardHeader>
      </Card>

      {variant === 'full' && (
        <>
          <div className="grid gap-4 grid-cols-2 sm:grid-cols-3">
            <Link href="/dashboard/news" className="block">
              <Card className="hover:border-primary/60 transition-colors cursor-pointer h-full">
                <CardHeader className="py-3 flex flex-row items-center gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                    <Newspaper className="size-5 text-primary" />
                  </div>
                  <div className="min-w-0">
                    <CardTitle className="text-sm font-medium">Barcha yangiliklar</CardTitle>
                    <CardDescription>{news.length} ta yangilik</CardDescription>
                  </div>
                </CardHeader>
              </Card>
            </Link>
            {STATUS_OPTIONS.filter((s) => s.value !== '').map((option) => {
              const value = option.value as NewsStatus
              const count = countsByStatus[value]
              const Icon = STATUS_ICONS[value]
              return (
                <Link key={value} href={`/dashboard/news/status/${value}`} className="block">
                  <Card className="hover:border-primary/60 transition-colors cursor-pointer h-full">
                    <CardHeader className="py-3 flex flex-row items-center gap-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                        <Icon className="size-5 text-primary" />
                      </div>
                      <div className="min-w-0">
                        <CardTitle className="text-sm font-medium">{option.label}</CardTitle>
                        <CardDescription>{count} ta yangilik</CardDescription>
                      </div>
                    </CardHeader>
                  </Card>
                </Link>
              )
            })}
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Filterlar</CardTitle>
              <CardDescription>Status, Top, tur va sana bo'yicha filtrlash</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
                <FilterSelect label="Status" value={statusFilter} options={STATUS_OPTIONS} onSelect={setStatusFilter} />
                <FilterSelect label="Top" value={isTopFilter} options={TOP_OPTIONS} onSelect={setIsTopFilter} />
                <FilterSelect label="Turi" value={typeFilter} options={TYPE_OPTIONS_FULL} onSelect={setTypeFilter} />
                <div className="space-y-2">
                  <Label htmlFor="date-from" className="text-sm font-medium">Sana (dan)</Label>
                  <Input id="date-from" type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} className="h-9" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="date-to" className="text-sm font-medium">Sana (gacha)</Label>
                  <Input id="date-to" type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} className="h-9" />
                </div>
                <div className="flex flex-col justify-end gap-2">
                  <p className="text-xs text-muted-foreground opacity-0 pointer-events-none">.</p>
                  <Button variant="outline" size="sm" onClick={clearFilters}>Filterlarni tozalash</Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </>
      )}

      <Card className="min-w-0">
        <CardHeader>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <CardTitle className="text-base">Barcha yangiliklar ({filtered.length})</CardTitle>
            <div className="relative w-full sm:w-auto sm:min-w-[400px]">
              <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input type="search" placeholder="Sarlavha, tavsif..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="gap-1">
                  <Columns3 className="size-4" />
                  Ustunlar
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuLabel>Ustunlarni ko'rsatish</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {COLUMN_KEYS.map((key) => (
                  <DropdownMenuCheckboxItem
                    key={key}
                    checked={columnVisibility[key] !== false}
                    onCheckedChange={(checked) => setColumnVisibility((prev) => ({ ...prev, [key]: checked !== false }))}
                  >
                    {COLUMN_LABELS[key]}
                  </DropdownMenuCheckboxItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </CardHeader>
        <CardContent className="min-w-0">
          {isLoading ? (
            <p className="text-sm text-muted-foreground py-8 text-center">Yangiliklar yuklanmoqda...</p>
          ) : error ? (
            <p className="text-sm text-destructive py-8 text-center">Yangiliklarni yuklab bo‘lmadi.</p>
          ) : filtered.length === 0 ? (
            <p className="text-sm text-muted-foreground py-8 text-center">
              Filterga mos yangiliklar topilmadi yoki hali yangiliklar yo'q.
            </p>
          ) : (
            <>
              <div className="min-w-0 w-full max-w-full overflow-x-auto -mx-1">
                <Table className="min-w-max">
                  <TableHeader>
                    <TableRow>
                      {columnVisibility.rasm !== false && <TableHead>{COLUMN_LABELS.rasm}</TableHead>}
                      {columnVisibility.sarlavha !== false && <TableHead className="min-w-[200px]">{COLUMN_LABELS.sarlavha}</TableHead>}
                      {columnVisibility.kategoriya !== false && <TableHead>{COLUMN_LABELS.kategoriya}</TableHead>}
                      {columnVisibility.status !== false && <TableHead>{COLUMN_LABELS.status}</TableHead>}
                      {columnVisibility.tur !== false && <TableHead>{COLUMN_LABELS.tur}</TableHead>}
                      {columnVisibility.top !== false && <TableHead className="text-center">{COLUMN_LABELS.top}</TableHead>}
                      {columnVisibility.publishedAt !== false && <TableHead>{COLUMN_LABELS.publishedAt}</TableHead>}
                      {columnVisibility.views !== false && <TableHead className="text-right">{COLUMN_LABELS.views}</TableHead>}
                      {columnVisibility.tarjimalar !== false && <TableHead className="text-center w-20">{COLUMN_LABELS.tarjimalar}</TableHead>}
                      {columnVisibility.amallar !== false && <TableHead className="w-[140px] text-right">{COLUMN_LABELS.amallar}</TableHead>}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {slice.map((item) => (
                      <TableRow key={item.slug}>
                        {columnVisibility.rasm !== false && (
                          <TableCell>
                            <div className="relative h-12 w-16 overflow-hidden rounded bg-muted">
                              {item.images[0] ? (
                                <Image src={item.images[0]} alt="" fill className="object-cover" sizes="64px" />
                              ) : (
                                <div className="flex h-full w-full items-center justify-center">
                                  <Newspaper className="size-6 text-muted-foreground" />
                                </div>
                              )}
                            </div>
                          </TableCell>
                        )}
                        {columnVisibility.sarlavha !== false && (
                          <TableCell>
                            <Link href={`/dashboard/news/${item.slug}/edit`} className="font-medium line-clamp-2 text-primary hover:underline">
                              {item.title}
                            </Link>
                          </TableCell>
                        )}
                        {columnVisibility.kategoriya !== false && <TableCell className="text-muted-foreground">{item.category}</TableCell>}
                        {columnVisibility.status !== false && (
                          <TableCell>
                            <span className="inline-flex rounded-md bg-muted px-2 py-0.5 text-xs font-medium capitalize">
                              {item.status ?? 'published'}
                            </span>
                          </TableCell>
                        )}
                        {columnVisibility.tur !== false && <TableCell className="text-muted-foreground capitalize">{item.type ?? '—'}</TableCell>}
                        {columnVisibility.top !== false && (
                          <TableCell className="text-center">
                            {item.isTop ? <span className="text-primary font-medium">Ha</span> : <span className="text-muted-foreground">Yo'q</span>}
                          </TableCell>
                        )}
                        {columnVisibility.publishedAt !== false && (
                          <TableCell className="text-muted-foreground whitespace-nowrap text-sm">
                            {formatDateTimeLocale(item.publishedAt, locale)}
                          </TableCell>
                        )}
                        {columnVisibility.views !== false && (
                          <TableCell className="text-right">
                            <span className="inline-flex items-center gap-1">
                              <Eye className="size-3.5 text-muted-foreground" />
                              {item.views}
                            </span>
                          </TableCell>
                        )}
                        {columnVisibility.tarjimalar !== false && (
                          <TableCell className="text-center">
                            <Button variant="ghost" size="icon" className="size-9" onClick={() => setTranslationsModalSlug(item.slug)}>
                              <Languages className="size-5" />
                            </Button>
                          </TableCell>
                        )}
                        {columnVisibility.amallar !== false && (
                          <TableCell className="text-right">
                            <div className="flex items-center justify-end gap-1">
                              <Button variant="outline" size="sm" asChild onClick={() => toast.info('Tahrirlash sahifasi ochildi')}>
                                <Link href={`/dashboard/news/${item.slug}/edit`}><Pencil className="size-4" /></Link>
                              </Button>
                              <Button variant="ghost" size="sm" asChild>
                                <Link href={`/news/${item.slug}`} target="_blank" rel="noopener noreferrer"><ExternalLink className="size-4" /></Link>
                              </Button>
                            </div>
                          </TableCell>
                        )}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
              <PaginationControl
                page={currentPage}
                totalPages={totalPages}
                onPrev={() => setPage((p) => Math.max(1, p - 1))}
                onNext={() => setPage((p) => Math.min(totalPages, p + 1))}
              />
            </>
          )}
        </CardContent>
      </Card>

      <Dialog open={!!translationsModalSlug} onOpenChange={(open) => !open && setTranslationsModalSlug(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Tarjimalar</DialogTitle>
          </DialogHeader>
          {translationsModalSlug && translationsBySlug[translationsModalSlug] && (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="font-medium">Field</TableHead>
                    {LOCALES.map((loc) => (
                      <TableHead key={loc} className="text-center capitalize">{loc}</TableHead>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {(() => {
                    const t = translationsBySlug[translationsModalSlug]
                    const hasTitle = (loc: AppLocale) => !!t.title[loc]?.trim()
                    const hasDesc = (loc: AppLocale) => !!t.description?.[loc]?.trim()
                    return (
                      <>
                        <TableRow>
                          <TableCell className="font-medium">title</TableCell>
                          {LOCALES.map((loc) => (
                            <TableCell key={loc} className="text-center">
                              {hasTitle(loc) ? <Check className="size-5 text-green-600 inline-block" /> : <CircleOff className="size-5 text-muted-foreground inline-block" />}
                            </TableCell>
                          ))}
                        </TableRow>
                        <TableRow>
                          <TableCell className="font-medium">description</TableCell>
                          {LOCALES.map((loc) => (
                            <TableCell key={loc} className="text-center">
                              {hasDesc(loc) ? <Check className="size-5 text-green-600 inline-block" /> : <CircleOff className="size-5 text-muted-foreground inline-block" />}
                            </TableCell>
                          ))}
                        </TableRow>
                        <TableRow>
                          <TableCell className="font-medium">content</TableCell>
                          {LOCALES.map((loc) => (
                            <TableCell key={loc} className="text-center">
                              {t.content[loc] ? <Check className="size-5 text-green-600 inline-block" /> : <CircleOff className="size-5 text-muted-foreground inline-block" />}
                            </TableCell>
                          ))}
                        </TableRow>
                      </>
                    )
                  })()}
                </TableBody>
              </Table>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
