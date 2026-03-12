import { getLocale } from 'next-intl/server'
import { headers } from 'next/headers'
import { Link } from '@/i18n/navigation'
import { getNewsListForLocale, type RawNewsItem } from '@/features/news/model'
import type { AppLocale } from '@/shared/common/lib/locale-api'
import { getServerApiUrl } from '@/shared/common/lib/server-api-url'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/shared/common/components/ui/card'
import { Newspaper, FolderTree, Tag, BarChart3, MessageSquare, Megaphone, Heart } from 'lucide-react'
import { DashboardNewsLists } from '@/features/dashboard/ui/news-lists'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/shared/common/lib/auth-options'

function getFetchOptions(cookie: string | null): RequestInit {
  return {
    cache: 'no-store' as RequestCache,
    headers: cookie ? { cookie } : undefined,
  }
}

export default async function DashboardPage() {
  const session = await getServerSession(authOptions)
  const locale = (await getLocale()) as AppLocale
  const h = await headers()
  const cookie = h.get('cookie')
  const opts = getFetchOptions(cookie)

  const [categoriesRes, tagsRes, newsRes, commentsRes, adsRes, reactionsRes] = await Promise.all([
    fetch(await getServerApiUrl('/api/categories'), opts),
    fetch(await getServerApiUrl('/api/tags'), opts),
    fetch(await getServerApiUrl('/api/news?page=1&limit=500'), opts),
    fetch(await getServerApiUrl('/api/comments'), opts),
    fetch(await getServerApiUrl('/api/ads'), opts),
    fetch(await getServerApiUrl('/api/reactions'), opts),
  ])
  const failed = [
    !categoriesRes.ok && 'categories',
    !tagsRes.ok && 'tags',
    !newsRes.ok && 'news',
    !commentsRes.ok && 'comments',
    !adsRes.ok && 'ads',
    !reactionsRes.ok && 'reactions',
  ].filter(Boolean)
  if (failed.length > 0) {
    throw new Error('Dashboard ma’lumotlarini yuklab bo‘lmadi')
  }
  const categories = (await categoriesRes.json()) as unknown[]
  const tags = (await tagsRes.json()) as unknown[]
  const newsJson = (await newsRes.json()) as { data: RawNewsItem[] }
  const comments = (await commentsRes.json()) as unknown[]
  const ads = (await adsRes.json()) as unknown[]
  const reactionsJson = (await reactionsRes.json()) as { count: number }
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
  const topNews = topNewsRaw.length ? topNewsRaw : latestNews.slice(0, 20)
  const authorsChoiceNews = authorsChoiceRaw.length ? authorsChoiceRaw : latestNews.slice(0, 20)
  const mostReadNews = [...allNews].sort((a, b) => b.views - a.views)
  const totalCount = newsJson.data.length
  const publishedCount = newsJson.data.filter((item) => (item.status ?? 'published') === 'published').length
  const totalViews = newsJson.data.reduce((acc, item) => acc + (item.views ?? 0), 0)

  const stats = [
    {
      label: 'Yangiliklar',
      value: `${publishedCount}/${totalCount}`,
      icon: Newspaper,
      href: '/dashboard/news',
    },
    {
      label: 'Kategoriyalar',
      value: categories.length,
      icon: FolderTree,
      href: '/dashboard/categories',
    },
    {
      label: 'Umumiy ko‘rishlar',
      value: totalViews,
      icon: BarChart3,
      href: '/dashboard/news',
    },
    {
      label: 'Teglar',
      value: tags.length,
      icon: Tag,
      href: '/dashboard/tags',
    },
    {
      label: 'Izohlar',
      value: comments.length ?? 0,
      icon: MessageSquare,
      href: '/dashboard/comments',
    },
    {
      label: 'Reklama',
      value: ads.length ?? 0,
      icon: Megaphone,
      href: '/dashboard/ads',
    },
    {
      label: 'Reaksiyalar',
      value: reactionsJson.count ?? 0,
      icon: Heart,
      href: '/dashboard/reactions',
    },
  ]

  return (
    <div className="space-y-8 overflow-x-hidden">
      <div>
        <div className="mb-4 space-y-1">
          <h1 className="text-xl md:text-2xl font-semibold tracking-tight">
            Hush kelibsiz, {session?.user?.name}
          </h1>
          <p className="text-sm text-muted-foreground">
            Boshqaruv panelidan yangiliklar, kategoriyalar va teglarni tezkor boshqaring.
          </p>
        </div>
        <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((s) => (
            <Link key={s.label} href={s.href} className="group">
              <Card className="relative h-full overflow-hidden border border-border/60 bg-linear-to-b from-background via-background to-muted/40 transition-all duration-200 hover:-translate-y-1 hover:border-primary/40 hover:shadow-lg">
                <div className="pointer-events-none absolute inset-0 opacity-0 group-hover:opacity-100 bg-[radial-gradient(circle_at_top,rgba(59,130,246,0.18),transparent_55%)] transition-opacity" />
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between gap-2">
                    <CardTitle className="text-sm sm:text-base font-medium text-muted-foreground">
                      {s.label}
                    </CardTitle>
                    <div className="rounded-full bg-primary/5 text-primary p-2 group-hover:bg-primary/10 transition-colors">
                      <s.icon className="size-4 sm:size-5" />
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="flex items-end justify-between gap-2">
                  <p className="text-2xl sm:text-3xl font-semibold tracking-tight">
                    {typeof s.value === 'number' ? s.value.toLocaleString() : s.value}
                  </p>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>

      <DashboardNewsLists
        topNews={topNews}
        authorsChoiceNews={authorsChoiceNews}
        mostReadNews={mostReadNews}
        locale={locale}
      />
    </div>
  )
}
