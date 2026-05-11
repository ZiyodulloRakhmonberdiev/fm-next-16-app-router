'use client'
/* eslint-disable react/no-unescaped-entities */

import { useState, useMemo, useEffect } from 'react'
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
  DialogDescription,
  DialogFooter,
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
import { Switch } from '@/shared/common/components/ui/switch'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/common/components/ui/select'
import { formatDateTimeLocale } from '@/shared/common/lib/formatter'
import { cn } from '@/shared/common/lib/utils'
import type { AppLocale } from '@/shared/common/lib/locale-api'
import { LOCALES } from '@/shared/common/lib/locale-constants'
import type { NewsItem, NewsStatus, RawNewsItem } from '@/features/news/model'
import { usePublicCategoriesQuery } from '@/features/category/model/public-categories-query'
import { getCategoryLabelForNewsItem } from '@/features/category/model/use-category-label'
import { useNewsQuery } from '@/features/dashboard/model/admin-hooks'
import { useQueryClient } from '@tanstack/react-query'
import { useSession } from 'next-auth/react'
import { normalizeRole } from '@/shared/common/lib/rbac'
import {
  Newspaper, PlusCircle, Eye, Search, ChevronDown, SlidersHorizontal,
  ExternalLink, Pencil, Columns3, Languages,
  Check, CircleOff, Clock, Send, Ban, Trash2, Archive,
  Columns2,
} from 'lucide-react'
import { NewsListSummaryCards } from './_components/news-list-summary-cards'
import { NewsListFilterPanel } from './_components/news-list-filter-panel'

/** Jadval va filtrlarda bir xil o‘zbekcha status matnlari */
const STATUS_LABEL_UZ: Record<NewsStatus, string> = {
  pending: 'Kutilmoqda',
  published: 'Nashr etilgan',
  cancelled: 'Bekor qilingan',
  deleted: "O'chirilgan",
  archived: 'Arxivlangan',
}

const STATUS_OPTIONS: { value: '' | NewsStatus; label: string }[] = [
  { value: '', label: 'Barcha statuslar' },
  { value: 'pending', label: STATUS_LABEL_UZ.pending },
  { value: 'published', label: STATUS_LABEL_UZ.published },
  { value: 'cancelled', label: STATUS_LABEL_UZ.cancelled },
  { value: 'deleted', label: STATUS_LABEL_UZ.deleted },
  { value: 'archived', label: STATUS_LABEL_UZ.archived },
]

const TELEGRAM_PUSH_LABEL_UZ: Record<'sent' | 'failed', string> = {
  sent: 'Yuborilgan',
  failed: 'Yuborilmadi',
}

const NEWS_TYPE_LABEL_UZ: Record<'video' | 'image' | 'text' | 'audio', string> = {
  video: 'Video',
  image: 'Rasm',
  text: 'Matn',
  audio: 'Audio',
}

function formatNewsTypeUz(type: string | undefined): string {
  if (!type?.trim()) return '—'
  const key = type.toLowerCase() as keyof typeof NEWS_TYPE_LABEL_UZ
  return NEWS_TYPE_LABEL_UZ[key] ?? type
}

function isTranslationsComplete(t: TranslationsForSlug | undefined): boolean {
  if (!t) return false
  return LOCALES.every((loc) => {
    const hasTitle = !!t.title[loc]?.trim()
    const hasDesc = !!t.description[loc]?.trim()
    const hasContent = !!t.content[loc]
    return hasTitle && hasDesc && hasContent
  })
}

const STATUS_ICONS: Record<NewsStatus, React.ComponentType<{ className?: string }>> = {
  pending: Clock, published: Send, cancelled: Ban, deleted: Trash2, archived: Archive,
}

const TOP_OPTIONS: { value: '' | 'yes' | 'no'; label: string }[] = [
  { value: '', label: 'Barchasi' },
  { value: 'yes', label: 'Ha' },
  { value: 'no', label: "Yo'q" },
]

const TYPE_OPTIONS_FULL: { value: '' | 'video' | 'image' | 'text' | 'audio'; label: string }[] = [
  { value: '', label: 'Barcha turlar' },
  { value: 'video', label: NEWS_TYPE_LABEL_UZ.video },
  { value: 'image', label: NEWS_TYPE_LABEL_UZ.image },
  { value: 'text', label: NEWS_TYPE_LABEL_UZ.text },
  { value: 'audio', label: NEWS_TYPE_LABEL_UZ.audio },
]

const AD_OPTIONS: { value: '' | 'yes' | 'no'; label: string }[] = [
  { value: '', label: 'Barchasi' },
  { value: 'yes', label: 'Reklama (Ha)' },
  { value: 'no', label: "Reklama emas (Yo'q)" },
]

const STATS_OPTIONS: { value: '' | 'yes' | 'no'; label: string }[] = [
  { value: '', label: 'Barchasi' },
  { value: 'yes', label: 'Maqola (Ha)' },
  { value: 'no', label: "Maqola emas (Yo'q)" },
]

const COLUMN_KEYS = [
  'tezkorAmallar', 'rasm', 'sarlavha', 'kategoriya', 'status', 'tur', 'top',
  'createdBy', 'publishedAt', 'views', 'telegram', 'tarjimalar', 'amallar',
] as const

const COLUMN_LABELS: Record<(typeof COLUMN_KEYS)[number], string> = {
  tezkorAmallar: "Tezkor",
  rasm: 'Rasm', sarlavha: 'Sarlavha', kategoriya: 'Kategoriya',
  status: 'Holat', tur: 'Tur', top: 'Top', createdBy: 'Hosil qildi',
  publishedAt: 'Nashr etildi',
  views: "Ko'rishlar", telegram: 'Telegram', tarjimalar: 'Tarjimalar', amallar: 'Amallar',
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
  const queryClient = useQueryClient()
  const { data: session } = useSession()
  const isCeo = normalizeRole(session?.user?.role) === 'ceo'
  const { data: categories = [], isPending: categoriesPending } = usePublicCategoriesQuery()
  const { data, isLoading, error } = useNewsQuery(variant === 'tableOnly' ? initialStatus || undefined : undefined)
  const rawNews = useMemo(() => data?.data ?? [], [data])
  const idBySlug = useMemo(() => {
    const m = new Map<string, string>()
    for (const raw of rawNews as (RawNewsItem & { _id?: string })[]) {
      const id = raw._id
      if (raw.slug && id != null && String(id) !== '') {
        m.set(raw.slug, String(id))
      }
    }
    return m
  }, [rawNews])
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
          ad: raw.ad ?? false,
          stats: raw.stats ?? false,
          type: raw.type,
          isBreaking: raw.isBreaking ?? false,
          pushedToTelegram: raw.pushedToTelegram,
          pushedToTelegramAt: raw.pushedToTelegramAt,
          telegramMessageId: raw.telegramMessageId,
          telegramMessageLink: raw.telegramMessageLink,
          telegramPushStatus: raw.telegramPushStatus,
          telegramPushReason: raw.telegramPushReason,
          telegramLastAttemptAt: raw.telegramLastAttemptAt,
          videoSource: raw.videoSource,
          videoUrl: raw.videoUrl,
          createdBy: raw.createdBy,
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
  const searchIndexBySlug = useMemo<Record<string, string>>(() => {
    const out: Record<string, string> = {}
    for (const raw of rawNews as RawNewsItem[]) {
      const titleParts = LOCALES.map((loc) => raw.title?.[loc] ?? '')
      const descParts = LOCALES.map((loc) => raw.description?.[loc] ?? '')
      out[raw.slug] = [
        raw.slug,
        raw.categorySlug ?? '',
        raw.author ?? '',
        raw.createdBy?.name ?? '',
        ...titleParts,
        ...descParts,
      ]
        .join(' ')
        .toLowerCase()
    }
    return out
  }, [rawNews])
  const authorOptions = useMemo(() => {
    const seen = new Map<string, string>()
    for (const raw of rawNews as RawNewsItem[]) {
      const id = raw.authorId?.trim() || ''
      const name = (raw.author ?? '').trim()
      if (!name) continue
      const key = id || `author:${name.toLowerCase()}`
      if (!seen.has(key)) seen.set(key, name)
    }
    return Array.from(seen.entries())
      .map(([value, label]) => ({ value, label }))
      .sort((a, b) => a.label.localeCompare(b.label))
  }, [rawNews])

  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(50)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<'' | NewsStatus>(initialStatus)
  const [authorFilter, setAuthorFilter] = useState('')
  const [isTopFilter, setIsTopFilter] = useState<'' | 'yes' | 'no'>('')
  const [adFilter, setAdFilter] = useState<'' | 'yes' | 'no'>('')
  const [statsFilter, setStatsFilter] = useState<'' | 'yes' | 'no'>('')
  const [typeFilter, setTypeFilter] = useState<'' | 'video' | 'image' | 'text' | 'audio'>('')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const [columnVisibility, setColumnVisibility] = useState<Record<string, boolean>>(() =>
    Object.fromEntries(COLUMN_KEYS.map((k) => [k, true]))
  )
  const [translationsModalSlug, setTranslationsModalSlug] = useState<string | null>(null)
  const [permanentDeleteSlug, setPermanentDeleteSlug] = useState<string | null>(null)
  const [permanentDeleting, setPermanentDeleting] = useState(false)
  const [quickEditSlug, setQuickEditSlug] = useState<string | null>(null)
  const [quickEditStatus, setQuickEditStatus] = useState<NewsStatus>('pending')
  const [quickEditFlags, setQuickEditFlags] = useState({
    isTop: false,
    authorsChoice: false,
    isBreaking: false,
    ad: false,
    stats: false,
    pushedToTelegram: false,
  })
  const [quickEditSaving, setQuickEditSaving] = useState(false)

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
        (item) => (searchIndexBySlug[item.slug] ?? '').includes(q)
      )
    }
    if (statusFilter) list = list.filter((item) => (item.status ?? 'published') === statusFilter)
    if (authorFilter) {
      list = list.filter((item) => {
        const raw = (rawNews as RawNewsItem[]).find((x) => x.slug === item.slug)
        if (!raw) return false
        const key = raw.authorId?.trim() || `author:${(raw.author ?? '').trim().toLowerCase()}`
        return key === authorFilter
      })
    }
    if (isTopFilter === 'yes') list = list.filter((item) => item.isTop === true)
    if (isTopFilter === 'no') list = list.filter((item) => item.isTop !== true)
    if (adFilter === 'yes') list = list.filter((item) => item.ad === true)
    if (adFilter === 'no') list = list.filter((item) => item.ad !== true)
    if (statsFilter === 'yes') list = list.filter((item) => item.stats === true)
    if (statsFilter === 'no') list = list.filter((item) => item.stats !== true)
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
  }, [news, search, searchIndexBySlug, statusFilter, authorFilter, isTopFilter, adFilter, statsFilter, typeFilter, dateFrom, dateTo, rawNews])

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize))
  const currentPage = Math.min(page, totalPages)
  const slice = filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize)

  const getImageSrc = (raw?: string) => {
    if (!raw) return ''
    const candidate =
      raw.startsWith('http://') || raw.startsWith('https://') || raw.startsWith('/')
        ? raw
        : `/uploads/images/${raw}`
    try {
      new URL(candidate, 'http://localhost')
      return candidate
    } catch {
      return ''
    }
  }

  const clearFilters = () => {
    setSearch('')
    setStatusFilter('')
    setAuthorFilter('')
    setIsTopFilter('')
    setAdFilter('')
    setStatsFilter('')
    setTypeFilter('')
    setDateFrom('')
    setDateTo('')
    setPage(1)
  }

  useEffect(() => {
    setPage(1)
  }, [pageSize, search, statusFilter, authorFilter, isTopFilter, adFilter, statsFilter, typeFilter, dateFrom, dateTo])

  const itemPendingPermanentDelete = permanentDeleteSlug
    ? news.find((n) => n.slug === permanentDeleteSlug)
    : null

  const handlePermanentDelete = async () => {
    if (!permanentDeleteSlug) return
    const id = idBySlug.get(permanentDeleteSlug)
    if (!id) {
      toast.error("Yangilik ID topilmadi — sahifani yangilang")
      return
    }
    setPermanentDeleting(true)
    try {
      const res = await fetch(`/api/news/${id}`, { method: 'DELETE', credentials: 'include' })
      const j = (await res.json().catch(() => ({}))) as { error?: string }
      if (!res.ok) {
        toast.error(j.error ?? "O'chirishda xato")
        return
      }
      toast.success('Yangilik bazadan butunlay o‘chirildi')
      setPermanentDeleteSlug(null)
      await queryClient.invalidateQueries({ queryKey: ['admin', 'news'] })
    } finally {
      setPermanentDeleting(false)
    }
  }

  const openQuickEdit = (slug: string) => {
    const raw = (rawNews as RawNewsItem[]).find((x) => x.slug === slug)
    if (!raw) return
    setQuickEditSlug(slug)
    setQuickEditStatus((raw.status ?? 'published') as NewsStatus)
    setQuickEditFlags({
      isTop: Boolean(raw.isTop),
      authorsChoice: Boolean(raw.authorsChoice),
      isBreaking: Boolean(raw.isBreaking),
      ad: Boolean(raw.ad),
      stats: Boolean(raw.stats),
      pushedToTelegram: Boolean(raw.pushedToTelegram),
    })
  }

  const handleSaveQuickEdit = async () => {
    if (!quickEditSlug) return
    const id = idBySlug.get(quickEditSlug)
    if (!id) {
      toast.error("Yangilik ID topilmadi — sahifani yangilang")
      return
    }
    setQuickEditSaving(true)
    try {
      const res = await fetch(`/api/news/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          status: quickEditStatus,
          ...quickEditFlags,
        }),
      })
      const j = (await res.json().catch(() => ({}))) as { error?: string }
      if (!res.ok) {
        toast.error(j.error ?? 'Saqlashda xatolik')
        return
      }
      toast.success("Tezkor amallar saqlandi")
      setQuickEditSlug(null)
      await queryClient.invalidateQueries({ queryKey: ['admin', 'news'] })
    } finally {
      setQuickEditSaving(false)
    }
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
    <div className="min-w-0 space-y-4 md:space-y-6">
      <Card className="gap-4 border-primary/30 bg-primary/5 py-4 md:gap-6 md:py-6">
        <CardHeader className="flex flex-col items-center justify-between gap-4 px-3 md:flex-row md:px-6">
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
          <NewsListSummaryCards
            total={news.length}
            countsByStatus={countsByStatus}
            statusOptions={STATUS_OPTIONS}
            statusIcons={STATUS_ICONS}
          />

          <NewsListFilterPanel
            statusFilter={statusFilter}
            authorFilter={authorFilter}
            isTopFilter={isTopFilter}
            adFilter={adFilter}
            statsFilter={statsFilter}
            typeFilter={typeFilter}
            dateFrom={dateFrom}
            dateTo={dateTo}
            onStatusChange={setStatusFilter}
            onAuthorChange={setAuthorFilter}
            onTopChange={setIsTopFilter}
            onAdChange={setAdFilter}
            onTypeChange={setTypeFilter}
            onDateFromChange={setDateFrom}
            onDateToChange={setDateTo}
            onClear={clearFilters}
            renderSelect={({ kind }) =>
              kind === 'status' ? (
                <FilterSelect label="Holat" value={statusFilter} options={STATUS_OPTIONS} onSelect={setStatusFilter} />
              ) : kind === 'author' ? (
                <FilterSelect
                  label="Muallif"
                  value={authorFilter}
                  options={[{ value: '', label: 'Barcha mualliflar' }, ...authorOptions]}
                  onSelect={setAuthorFilter}
                />
              ) : kind === 'top' ? (
                <FilterSelect label="Top" value={isTopFilter} options={TOP_OPTIONS} onSelect={setIsTopFilter} />
              ) : kind === 'ad' ? (
                <FilterSelect label="Reklama" value={adFilter} options={AD_OPTIONS} onSelect={setAdFilter} />
              ) : kind === 'stats' ? (
                <FilterSelect label="Maqola" value={statsFilter} options={STATS_OPTIONS} onSelect={setStatsFilter} />
              ) : (
                <FilterSelect label="Turi" value={typeFilter} options={TYPE_OPTIONS_FULL} onSelect={setTypeFilter} />
              )
            }
          />
        </>
      )}

      <Card className="gap-3 py-3 md:gap-6 md:py-6">
        <CardHeader className="px-3 md:px-6">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <CardTitle className="text-base">Barcha yangiliklar ({filtered.length})</CardTitle>
            <div className="relative w-full sm:w-auto sm:min-w-[400px]">
              <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input type="search" placeholder="Sarlavha/tavsif (barcha tillarda)..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
            </div>
            <div className="w-full sm:w-auto sm:min-w-[130px]">
              <Select value={String(pageSize)} onValueChange={(v) => setPageSize(Number(v))}>
                <SelectTrigger className="h-9">
                  <SelectValue placeholder="Sahifada soni" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="10">10 ta</SelectItem>
                  <SelectItem value="25">25 ta</SelectItem>
                  <SelectItem value="50">50 ta</SelectItem>
                  <SelectItem value="100">100 ta</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="gap-1">
                  <Columns2 className="size-4" />
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
        <CardContent className="min-w-0 px-3 pb-4 md:px-6 md:pb-6">
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
              <div className="-mx-3 min-w-0 w-[calc(100%+1.5rem)] max-w-none touch-pan-x overflow-x-auto overscroll-x-contain px-3 [scrollbar-width:thin] md:mx-0 md:w-full md:max-w-full md:px-0">
                <Table className="min-w-max">
                  <TableHeader>
                    <TableRow>
                      {columnVisibility.tezkorAmallar !== false && <TableHead className="w-[92px]">{COLUMN_LABELS.tezkorAmallar}</TableHead>}
                      {columnVisibility.rasm !== false && <TableHead>{COLUMN_LABELS.rasm}</TableHead>}
                      {columnVisibility.sarlavha !== false && <TableHead className="min-w-[200px]">{COLUMN_LABELS.sarlavha}</TableHead>}
                      {columnVisibility.kategoriya !== false && <TableHead>{COLUMN_LABELS.kategoriya}</TableHead>}
                      {columnVisibility.status !== false && <TableHead>{COLUMN_LABELS.status}</TableHead>}
                      {columnVisibility.tur !== false && <TableHead>{COLUMN_LABELS.tur}</TableHead>}
                      {columnVisibility.top !== false && <TableHead className="text-center">{COLUMN_LABELS.top}</TableHead>}
                      {columnVisibility.createdBy !== false && <TableHead>{COLUMN_LABELS.createdBy}</TableHead>}
                      {columnVisibility.publishedAt !== false && <TableHead>{COLUMN_LABELS.publishedAt} </TableHead>}
                      {columnVisibility.views !== false && <TableHead className="text-right">{COLUMN_LABELS.views}</TableHead>}
                      {columnVisibility.telegram !== false && <TableHead>{COLUMN_LABELS.telegram}</TableHead>}
                      {columnVisibility.tarjimalar !== false && <TableHead className="text-center w-20">{COLUMN_LABELS.tarjimalar}</TableHead>}
                      {columnVisibility.amallar !== false && <TableHead className="w-[140px] text-right">{COLUMN_LABELS.amallar}</TableHead>}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {slice.map((item) => {
                      const firstImage = item.images?.[0]
                      const thumbSrc = getImageSrc(firstImage)
                      return (
                    <TableRow key={item.slug}>
                        {columnVisibility.tezkorAmallar !== false && (
                          <TableCell>
                            <Button
                              type="button"
                              variant="secondary"
                              size="sm"
                              onClick={() => openQuickEdit(item.slug)}
                              title="Tezkor amallar"
                            >
                              <SlidersHorizontal className="size-4" />
                            </Button>
                          </TableCell>
                        )}
                        {columnVisibility.rasm !== false && (
                          <TableCell>
                            <div className="relative h-12 w-16 overflow-hidden rounded bg-muted">
                              {thumbSrc ? (
                              <Image src={thumbSrc} alt="" fill className="object-cover" sizes="64px" />
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
                            <Link href={`/dashboard/news/${item.slug}/edit`} className="font-medium line-clamp-2 text-primary hover:underline truncate max-w-[200px]">
                              {item.title}
                            </Link>
                          </TableCell>
                        )}
                        {columnVisibility.kategoriya !== false && (
                          <TableCell className="text-muted-foreground">
                            {getCategoryLabelForNewsItem(categories, categoriesPending, item, locale)}
                          </TableCell>
                        )}
                        {columnVisibility.status !== false && (
                          <TableCell>
                            <span className="inline-flex rounded-md bg-muted px-2 py-0.5 text-xs font-medium">
                              {STATUS_LABEL_UZ[(item.status ?? 'published') as NewsStatus]}
                            </span>
                          </TableCell>
                        )}
                        {columnVisibility.tur !== false && (
                          <TableCell className="text-muted-foreground">{formatNewsTypeUz(item.type)}</TableCell>
                        )}
                        {columnVisibility.top !== false && (
                          <TableCell className="text-center">
                            {item.isTop ? <span className="text-primary font-medium">Ha</span> : <span className="text-muted-foreground">Yo'q</span>}
                          </TableCell>
                        )}
                        {columnVisibility.createdBy !== false && (
                          <TableCell className="max-w-[140px] text-sm text-muted-foreground">
                            <span className="line-clamp-2" title={item.createdBy?.name}>
                              {item.createdBy?.name?.trim() || '—'}
                            </span>
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
                        {columnVisibility.telegram !== false && (
                          <TableCell className="text-xs">
                            {item.telegramPushStatus ? (
                              <div className="space-y-1">
                                <span
                                  className={cn(
                                    'inline-flex rounded-md px-2 py-0.5 text-xs font-medium',
                                    item.telegramPushStatus === 'sent'
                                      ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300'
                                      : 'bg-destructive/10 text-destructive'
                                  )}
                                >
                                  {item.telegramPushStatus === 'sent' || item.telegramPushStatus === 'failed'
                                    ? TELEGRAM_PUSH_LABEL_UZ[item.telegramPushStatus]
                                    : item.telegramPushStatus}
                                </span>
                              </div>
                            ) : (
                              <span className="text-muted-foreground">—</span>
                            )}
                          </TableCell>
                        )}
                        {columnVisibility.tarjimalar !== false && (
                          <TableCell className="text-center">
                            <Button variant="secondary" size="sm" onClick={() => setTranslationsModalSlug(item.slug)}>
                              <Languages
                                className={cn(
                                  isTranslationsComplete(translationsBySlug[item.slug]) &&
                                    'text-green-600 dark:text-green-400'
                                )}
                              />
                            </Button>
                          </TableCell>
                        )}
                        {columnVisibility.amallar !== false && (
                          <TableCell className="text-right">
                            <div className="flex flex-wrap items-center justify-end gap-1">
                              <Button variant="secondary" size="sm" asChild onClick={() => toast.info('Tahrirlash sahifasi ochildi')}>
                                <Link href={`/dashboard/news/${item.slug}/edit`}><Pencil className="size-4" /></Link>
                              </Button>
                              <Button variant="secondary" size="sm" asChild>
                                <Link href={`/news/${item.slug}`} target="_blank" rel="noopener noreferrer"><ExternalLink className="size-4" /></Link>
                              </Button>
                              {isCeo ? (
                                <Button
                                  type="button"
                                  variant="secondary"
                                  size="sm"
                                  onClick={() => setPermanentDeleteSlug(item.slug)}
                                  title="Bazadan butunlay o‘chirish"
                                >
                                  <Trash2 className="size-4" />
                                </Button>
                              ) : null}
                            </div>
                          </TableCell>
                        )}
                      </TableRow>
                    )})}
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

      <Dialog open={!!permanentDeleteSlug} onOpenChange={(open) => !open && setPermanentDeleteSlug(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Yangilikni butunlay o‘chirish</DialogTitle>
            <DialogDescription>
              {itemPendingPermanentDelete ? (
                <>
                  <span className="font-medium text-foreground">&quot;{itemPendingPermanentDelete.title}&quot;</span> bazadan
                  qaytarilmasdan o‘chiriladi. Faqat CEO bajarishi mumkin.
                </>
              ) : null}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex gap-2">
            <Button type="button" variant="outline" onClick={() => setPermanentDeleteSlug(null)}>
              Bekor qilish
            </Button>
            <Button
              type="button"
              variant="destructive"
              disabled={permanentDeleting}
              onClick={() => void handlePermanentDelete()}
            >
              Butunlay o‘chirish
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={!!quickEditSlug} onOpenChange={(open) => !open && setQuickEditSlug(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Tezkor amallar</DialogTitle>
            <DialogDescription>
              Boolean maydonlar va statusni sahifaga kirmasdan yangilang.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 pt-1">
            <div className="space-y-2">
              <Label>Holat</Label>
              <Select value={quickEditStatus} onValueChange={(v) => setQuickEditStatus(v as NewsStatus)}>
                <SelectTrigger>
                  <SelectValue placeholder="Holat" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending">{STATUS_LABEL_UZ.pending}</SelectItem>
                  <SelectItem value="published">{STATUS_LABEL_UZ.published}</SelectItem>
                  <SelectItem value="cancelled">{STATUS_LABEL_UZ.cancelled}</SelectItem>
                  <SelectItem value="archived">{STATUS_LABEL_UZ.archived}</SelectItem>
                  <SelectItem value="deleted">{STATUS_LABEL_UZ.deleted}</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-3">
              <div className="flex items-center justify-between rounded-md border p-3">
                <Label htmlFor="quick-isTop">Top ro'yxatda</Label>
                <Switch id="quick-isTop" checked={quickEditFlags.isTop} onCheckedChange={(checked) => setQuickEditFlags((prev) => ({ ...prev, isTop: checked }))} />
              </div>
              <div className="flex items-center justify-between rounded-md border p-3">
                <Label htmlFor="quick-authorsChoice">Muallif tanlovi</Label>
                <Switch id="quick-authorsChoice" checked={quickEditFlags.authorsChoice} onCheckedChange={(checked) => setQuickEditFlags((prev) => ({ ...prev, authorsChoice: checked }))} />
              </div>
              <div className="flex items-center justify-between rounded-md border p-3">
                <Label htmlFor="quick-isBreaking">Dolzarb (breaking)</Label>
                <Switch id="quick-isBreaking" checked={quickEditFlags.isBreaking} onCheckedChange={(checked) => setQuickEditFlags((prev) => ({ ...prev, isBreaking: checked }))} />
              </div>
              <div className="flex items-center justify-between rounded-md border p-3">
                <Label htmlFor="quick-ad">Reklama sifatida</Label>
                <Switch id="quick-ad" checked={quickEditFlags.ad} onCheckedChange={(checked) => setQuickEditFlags((prev) => ({ ...prev, ad: checked }))} />
              </div>
              <div className="flex items-center justify-between rounded-md border p-3">
                <Label htmlFor="quick-stats">Maqolalar sifatida</Label>
                <Switch id="quick-stats" checked={quickEditFlags.stats} onCheckedChange={(checked) => setQuickEditFlags((prev) => ({ ...prev, stats: checked }))} />
              </div>
              <div className="flex items-center justify-between rounded-md border p-3">
                <Label htmlFor="quick-pushedToTelegram">Telegramga yuborish</Label>
                <Switch id="quick-pushedToTelegram" checked={quickEditFlags.pushedToTelegram} onCheckedChange={(checked) => setQuickEditFlags((prev) => ({ ...prev, pushedToTelegram: checked }))} />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setQuickEditSlug(null)}>
              Bekor qilish
            </Button>
            <Button type="button" onClick={() => void handleSaveQuickEdit()} disabled={quickEditSaving}>
              Saqlash
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

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
                    <TableHead className="font-medium">Tillar</TableHead>
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
                          <TableCell className="font-medium">Sarlavha</TableCell>
                          {LOCALES.map((loc) => (
                            <TableCell key={loc} className="text-center">
                              {hasTitle(loc) ? <Check className="size-5 text-green-600 inline-block" /> : <CircleOff className="size-5 text-muted-foreground inline-block" />}
                            </TableCell>
                          ))}
                        </TableRow>
                        <TableRow>
                          <TableCell className="font-medium">Tavsif</TableCell>
                          {LOCALES.map((loc) => (
                            <TableCell key={loc} className="text-center">
                              {hasDesc(loc) ? <Check className="size-5 text-green-600 inline-block" /> : <CircleOff className="size-5 text-muted-foreground inline-block" />}
                            </TableCell>
                          ))}
                        </TableRow>
                        <TableRow>
                          <TableCell className="font-medium">Batafsil</TableCell>
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
