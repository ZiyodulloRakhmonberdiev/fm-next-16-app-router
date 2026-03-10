import { getLocale } from 'next-intl/server'
import { Link } from '@/i18n/navigation'
import { seed } from '@/scripts/seed'
import { seedNews } from '@/scripts/seed-news'
import { getNewsListForLocale } from '@/features/news/model'
import type { AppLocale } from '@/shared/common/lib/locale-api'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/shared/common/components/ui/card'
import {  Newspaper, FolderTree, Tag, BarChart3 } from 'lucide-react'
import { DashboardNewsLists, DashboardHomeHeader } from '@/features/dashboard'

export default async function DashboardPage() {
  const locale = (await getLocale()) as AppLocale

  const ADMIN_FULL_NAME = 'Admin Foydalanuvchi'

  const allNews = getNewsListForLocale(seedNews.news, locale)
  const topNews = getNewsListForLocale(
    seedNews.news.filter((r) => r.isTop),
    locale
  ).sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime())
  const authorsChoiceNews = getNewsListForLocale(
    seedNews.news.filter((r) => r.authorsChoice),
    locale
  ).sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime())
  const mostReadNews = [...allNews].sort((a, b) => b.views - a.views)
  const totalViews = allNews.reduce((acc, item) => acc + (item.views ?? 0), 0)

  const stats = [
    {
      label: 'Yangiliklar',
      value: allNews.length,
      icon: Newspaper,
      href: '/dashboard/news',
    },
    {
      label: 'Kategoriyalar',
      value: seed.categories.length,
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
      value: seed.tags.length,
      icon: Tag,
      href: '/dashboard/tags',
    },
  ]

  return (
    <div className="space-y-8 overflow-x-hidden">
      <DashboardHomeHeader />
      <div>
        <div className="mb-4 space-y-1">
          <h1 className="text-xl md:text-2xl font-semibold tracking-tight">
            Hush kelibsiz, {ADMIN_FULL_NAME}
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
                    {s.value.toLocaleString()}
                  </p>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>

      {/* Qidiruv va ro'yxatlar: Top news, Muallif tanlovi, Ko'p o'qilgan */}
      <DashboardNewsLists
        topNews={topNews}
        authorsChoiceNews={authorsChoiceNews}
        mostReadNews={mostReadNews}
        locale={locale}
      />
    </div>
  )
}
