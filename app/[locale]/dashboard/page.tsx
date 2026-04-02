import { getLocale } from 'next-intl/server'
import { headers } from 'next/headers'
import { Link } from '@/i18n/navigation'
import { getNewsListForLocale, type RawNewsItem } from '@/features/news/model'
import type { AppLocale } from '@/shared/common/lib/locale-api'
import { getServerApiUrl } from '@/shared/common/lib/server-api-url'
import { Suspense } from 'react'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle
} from '@/shared/common/components/ui/card'
import { Newspaper, FolderTree, Tag, BarChart3, MessageSquare, Megaphone, Heart, Inbox, Send, Users, PlusCircle, LayoutGrid } from 'lucide-react'
import { attachNewsIdsToItems } from '@/features/dashboard/lib/attach-news-ids'
import { DashboardNewsLists } from '@/features/dashboard/ui/news-lists'
import { DashboardCharts } from '@/features/dashboard/ui/dashboard-charts'
import {
  buildDashboardCategoryPie,
  buildDashboardMonthlySeries,
} from '@/features/dashboard/lib/chart-data'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/shared/common/lib/auth-options'

type DashboardCategoryRow = { slug: string; name?: Partial<Record<AppLocale, string>> }

function getFetchOptions(cookie: string | null): RequestInit {
  return {
    cache: 'no-store' as RequestCache,
    headers: cookie ? { cookie } : undefined,
  }
}

// Stats API dan keladigan tip
type DashboardStatsRes = {
  stats: {
    totalCount: number
    publishedCount: number
    totalViews: number
    categoriesCount: number
    tagsCount: number
    commentsCount: number
    pendingCommentsCount: number
    reactionsCount: number
    adsCount: number
    adsFeedbackCount: number
    usersCount: number
    contactTotal: number
    contactNew: number
  }
  chartNews: RawNewsItem[]
  categories: DashboardCategoryRow[]
}

export default async function DashboardPage(props: { searchParams?: Promise<{ range?: string }> }) {
  const session = await getServerSession(authOptions)
  const locale = (await getLocale()) as AppLocale
  const h = await headers()
  const cookie = h.get('cookie')
  const opts = getFetchOptions(cookie)

  const searchParams = props.searchParams ? await props.searchParams : {}
  const range = searchParams.range
  const rangeQuery = range ? `?range=${range}` : ''

  // Yordamchi tezkor APIni chaqiramiz
  const statsRes = await fetch(await getServerApiUrl(`/api/dashboard/stats${rangeQuery}`), opts)
  
  if (!statsRes.ok) {
    throw new Error('Dashboard statistikasini yuklab bo‘lmadi')
  }
  
  const { stats: sData, chartNews, categories }: DashboardStatsRes = await statsRes.json()

  const monthlySeries = buildDashboardMonthlySeries(chartNews, locale)
  const categoryPie = buildDashboardCategoryPie(chartNews, categories, locale)

  const stats: {
    label: string
    value: number | string
    secondary?: string
    icon: any
    href: string
  }[] = [
    {
      label: 'Foydalanuvchilar',
      value: sData.usersCount ?? 0,
      icon: Users,
      href: '/dashboard/users',
    },
    {
      label: 'Yangiliklar',
      value: sData.publishedCount != null ? `${sData.publishedCount}/${sData.totalCount}` : 0,
      icon: Newspaper,
      href: '/dashboard/news',
    },
    {
      label: 'Kategoriyalar',
      value: sData.categoriesCount ?? 0,
      icon: FolderTree,
      href: '/dashboard/categories',
    },
    {
      label: 'Umumiy ko‘rishlar',
      value: sData.totalViews ?? 0,
      icon: BarChart3,
      href: '/dashboard/news',
    },
    {
      label: 'Teglar',
      value: sData.tagsCount ?? 0,
      icon: Tag,
      href: '/dashboard/tags',
    },
    {
      label: 'Izohlar',
      value: sData.commentsCount ?? 0,
      icon: MessageSquare,
      href: '/dashboard/comments',
    },
    {
      label: 'Xabarlar',
      value: sData.contactTotal ?? 0,
      secondary: `${sData.contactNew ?? 0} yangi`,
      icon: Send,
      href: '/dashboard/contact-messages',
    },
    {
      label: 'Reaksiyalar',
      value: sData.reactionsCount ?? 0,
      icon: Heart,
      href: '/dashboard/reactions',
    },
    {
      label: 'Reklama',
      value: sData.adsCount ?? 0,
      icon: Megaphone,
      href: '/dashboard/ads',
    },
    {
      label: 'Reklama feedback',
      value: sData.adsFeedbackCount ?? 0,
      icon: Inbox,
      href: '/dashboard/ads/feedback',
    }
  ]

  return (
    <div className="space-y-8 overflow-x-hidden">
      
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4">
        {/* Tezkor amallar */}
        <div className="flex flex-wrap items-center gap-3">
          <Link 
            href="/dashboard/news/create" 
            className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow-sm hover:bg-primary/90 transition-colors"
          >
            <PlusCircle className="size-4" />
            Yangi xabar
          </Link>
          <Link 
            href="/dashboard/categories" 
            className="inline-flex items-center gap-2 rounded-md bg-secondary px-4 py-2 text-sm font-medium text-secondary-foreground shadow-sm hover:bg-secondary/80 transition-colors"
          >
            <LayoutGrid className="size-4" />
            Kategoriyalar
          </Link>
          <Link 
            href="/dashboard/comments" 
            className="inline-flex items-center gap-2 rounded-md bg-secondary px-4 py-2 text-sm font-medium shadow-sm hover:bg-secondary/80 transition-colors relative"
          >
            <MessageSquare className="size-4" />
            Izohlar
            {sData.pendingCommentsCount > 0 && (
              <span className="flex h-5 min-w-[20px] items-center justify-center rounded-full bg-destructive px-1.5 text-[10px] font-bold text-white">
                {sData.pendingCommentsCount}
              </span>
            )}
          </Link>
          <Link 
            href="/dashboard/users" 
            className="inline-flex items-center gap-2 rounded-md bg-secondary px-4 py-2 text-sm font-medium shadow-sm hover:bg-secondary/80 transition-colors"
          >
            <Users className="size-4" />
            Foydalanuvchilar
          </Link>
        </div>

        {/* Vaqt filtri */}
        <div className="flex items-center gap-1 bg-muted p-1 rounded-md self-start xl:self-auto overflow-x-auto">
          <Link href="?range=7d" className={`px-3 py-1.5 text-sm font-medium rounded whitespace-nowrap transition-colors ${range === '7d' ? 'bg-background shadow text-foreground' : 'text-muted-foreground hover:bg-muted-foreground/10'}`}>7 kun</Link>
          <Link href="?range=30d" className={`px-3 py-1.5 text-sm font-medium rounded whitespace-nowrap transition-colors ${range === '30d' ? 'bg-background shadow text-foreground' : 'text-muted-foreground hover:bg-muted-foreground/10'}`}>30 kun</Link>
          <Link href="?range=1y" className={`px-3 py-1.5 text-sm font-medium rounded whitespace-nowrap transition-colors ${range === '1y' ? 'bg-background shadow text-foreground' : 'text-muted-foreground hover:bg-muted-foreground/10'}`}>1 yil</Link>
          <Link href="?" className={`px-3 py-1.5 text-sm font-medium rounded whitespace-nowrap transition-colors ${!range ? 'bg-background shadow text-foreground' : 'text-muted-foreground hover:bg-muted-foreground/10'}`}>Barchasi</Link>
        </div>
      </div>

      <div>
        <div className="grid gap-3 sm:gap-4 pt-1 grid-cols-2 lg:grid-cols-5">
          {stats.map((s) => (
            <Link key={s.label} href={s.href} className="group">
              <Card className="relative h-full overflow-hidden border border-border/60 bg-linear-to-b from-background via-background to-muted/40 transition-all duration-200 hover:-translate-y-1 hover:border-primary/40 hover:shadow-lg">
                <div className="pointer-events-none absolute inset-0 opacity-0 group-hover:opacity-100 bg-[radial-gradient(circle_at_top,rgba(59,130,246,0.18),transparent_55%)] transition-opacity" />
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between gap-2">
                    <CardTitle className="text-xs sm:text-sm font-medium text-muted-foreground truncate">
                      {s.label}
                    </CardTitle>
                    <div className="rounded-full bg-primary/5 text-primary p-1.5 group-hover:bg-primary/10 transition-colors shrink-0">
                      <s.icon className="size-4" />
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="flex flex-col items-stretch gap-1">
                  <p className="text-xl sm:text-2xl font-semibold tracking-tight tabular-nums truncate">
                    {typeof s.value === 'number' ? s.value.toLocaleString() : s.value}
                  </p>
                  {/* {s.secondary != null ? (
                    <p className="text-xs text-muted-foreground tabular-nums truncate">{s.secondary}</p>
                  ) : null} */}
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>

      <DashboardCharts monthly={monthlySeries} categoryPie={categoryPie} />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="lg:col-span-2">
          <Suspense fallback={<div className="h-64 flex items-center justify-center animate-pulse bg-muted rounded-xl">Yangiliklar ro'yxatlari yuklanmoqda...</div>}>
            <DashboardNewsListsAsync locale={locale} opts={opts} />
          </Suspense>
        </div>
        
      </div>
        <div className="lg:col-span-1">
          <Suspense fallback={<div className="h-64 flex items-center justify-center animate-pulse bg-muted rounded-xl">Faoliyat tarixi yuklanmoqda...</div>}>
            <RecentActivityAsync opts={opts} />
          </Suspense>
        </div>
    </div>
  )
}

import { RecentActivityAsync } from '@/features/admin-logs/ui/recent-activity'

/**
 * Bu qism avval dashboard loadni sekinlashtirar edi. 
 * Endi faqat top / latest news larni render qilish uchun alohida Suspense ichida yoziladi.
 */
async function DashboardNewsListsAsync({ locale, opts }: { locale: AppLocale, opts: RequestInit }) {
  // Yangiliklar massivini 100 tadan olamiz, chunki eng so'nggi va top xabarlarni ajratish kifoya qiladi
  const res = await fetch(await getServerApiUrl('/api/news?page=1&limit=100'), opts)
  if (!res.ok) {
    return <div className="text-destructive text-sm p-4 border rounded-md">Yangiliklar ro'yxatini yuklab bo'lmadi.</div>
  }
  
  const newsJson = (await res.json()) as { data: RawNewsItem[] }
  const allNews = getNewsListForLocale(newsJson.data, locale)
  
  const latestNews = [...allNews].sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime())
  
  const topNewsRaw = getNewsListForLocale(
    newsJson.data.filter((r) => r.isTop),
    locale
  ).sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime())
  
  const authorsChoiceRaw = getNewsListForLocale(
    newsJson.data.filter((r) => r.authorsChoice),
    locale
  ).sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime())
  
  const breakingRaw = getNewsListForLocale(
    newsJson.data.filter((r) => r.isBreaking),
    locale
  ).sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime())
  
  const topNews = topNewsRaw
  const authorsChoiceNews = authorsChoiceRaw
  const mostReadNews = [...allNews].sort((a, b) => (b.views ?? 0) - (a.views ?? 0)).slice(0, 20)
  
  const topNewsWithIds = attachNewsIdsToItems(topNews, newsJson.data)
  const authorsChoiceWithIds = attachNewsIdsToItems(authorsChoiceNews, newsJson.data)
  const breakingWithIds = attachNewsIdsToItems(breakingRaw, newsJson.data)

  return (
    <DashboardNewsLists
      topNews={topNewsWithIds}
      authorsChoiceNews={authorsChoiceWithIds}
      breakingNews={breakingWithIds}
      mostReadNews={mostReadNews}
      locale={locale}
    />
  )
}
