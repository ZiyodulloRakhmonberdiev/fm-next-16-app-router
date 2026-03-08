import { getLocale } from 'next-intl/server'
import { Link } from '@/i18n/navigation'
import { seed } from '@/scripts/seed'
import { seedNews } from '@/scripts/seed-news'
import { getNewsListForLocale } from '@/features/news/model'
import type { AppLocale } from '@/shared/common/lib/locale-api'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/shared/common/components/ui/card'
import { PlusCircle, Newspaper, FolderTree, Tag, BarChart3 } from 'lucide-react'
import { DashboardNewsLists } from '@/features/dashboard'
import { Button } from '@/shared/common/components/ui/button'

export default async function DashboardPage() {
  const locale = (await getLocale()) as AppLocale

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
      label: 'Teglar',
      value: seed.tags.length,
      icon: Tag,
      href: '#',
    },
  ]

  return (
    <div className="space-y-8 overflow-x-hidden">
      <Card className="border-primary/30 bg-primary/5">
        <CardHeader className="flex flex-row items-center justify-between gap-4">
          <div>
            <CardTitle className="text-xl flex items-center gap-2">
              <PlusCircle className="size-6" />
              Yangilik yaratish
            </CardTitle>
            <CardDescription>
              Yangi yangilik qo‘shish uchun bosing
            </CardDescription>
          </div>
          <Button asChild size="lg" className="shrink-0">
            <Link href="/dashboard/news/create">
              <PlusCircle className="size-4 mr-2" />
              Yangilik yaratish
            </Link>
          </Button>
        </CardHeader>
      </Card>

      <div>
        <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <BarChart3 className="size-5" />
          Sayt ma'lumotlari
        </h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {stats.map((s) => (
            <Link key={s.label} href={s.href}>
              <Card className="hover:bg-muted/50 transition-colors h-full">
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base font-medium text-muted-foreground">
                      {s.label}
                    </CardTitle>
                    <s.icon className="size-5 text-muted-foreground" />
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold">{s.value}</p>
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
