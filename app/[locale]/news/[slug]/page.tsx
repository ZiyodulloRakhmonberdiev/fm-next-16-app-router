import { notFound } from "next/navigation"
import { Footer } from "@/widgets/client-footer"
import { Header } from "@/widgets/client-header"
import ClientSidebar from "@/widgets/client-sidebar/ui/client-sidebar"
import { NewsPageContent } from "@/features/news/ui/news-page-content"
import { pickNewsForLocale, type RawNewsItem } from "@/features/news/model"
import { StayConnectedForNewsPage } from "@/shared/common/components/organisms"
import { LatestNews } from "@/shared/common/components/news-sections"
import { isAppLocale } from "@/shared/common/lib/locale-api"
import { dbConnect } from "@/shared/common/lib/db"
import { NewsModel } from "@/features/news/model/news.model"
import { Link } from "@/i18n/navigation"
import { CategoryListForNewsPage } from "@/entities/category/ui/category-list"
import ClientSiteNothingGate from "../../_components/client-site-nothing-gate"
import ClientServerOffGate from "../../_components/client-server-off-gate"
import { Flame, History, HomeIcon, Lightbulb, TrendingUpIcon, VideoIcon } from "lucide-react"
import { getTranslations } from "next-intl/server"

type Props = {
  params: Promise<{ locale: string; slug: string }>
}

export default async function NewsPage({ params }: Props) {
  const { locale, slug } = await params
  const currentLocale = isAppLocale(locale) ? locale : "uz"
  const t = await getTranslations("common")

  await dbConnect()
  const raw = await NewsModel.findOne({ slug, status: "published" }).lean()
  if (!raw) notFound()
  const news = pickNewsForLocale(raw as RawNewsItem, currentLocale)
  if (!news) notFound()

  const rawObj = raw as Record<string, unknown>
  const newsId =
    rawObj._id != null && rawObj._id !== ""
      ? String(rawObj._id)
      : undefined

  return (
    <ClientSiteNothingGate>
      <div className="block md:hidden">
        <ClientSidebar />
      </div>
      <div className="flex w-full flex-1 flex-col">
        <Header />
        <main className="flex-1 py-4 px-4 md:px-6">
          <ClientServerOffGate model="news">
            <div className="mx-auto max-w-7xl grid grid-cols-1 gap-6 lg:grid-cols-7">
              <aside className="hidden lg:flex lg:flex-col lg:col-span-1 lg:sticky lg:top-20 lg:self-start gap-4">
                <div className="px-4 text-lg">
                  <nav className="flex flex-col gap-4">
                    <Link href="/" className="flex items-center gap-3">
                     <HomeIcon className="w-5 h-5" /> <span className="text-lg">{t("nav_home")}</span>
                    </Link>
                    <Link href="/news/trending" className="flex items-center gap-3">
                      <Flame className="w-5 h-5" /> <span className="text-lg">{t("nav_trending")}</span>
                    </Link>
                    <Link href="/news/latest" className="flex items-center gap-3">
                      <History className="w-5 h-5" /> <span className="text-lg">{t("nav_latest")}</span>
                    </Link>
                    <Link href="/news/video" className="flex items-center gap-3">
                      <VideoIcon className="w-5 h-5" /> <span className="text-lg">{t("nav_video")}</span>
                    </Link>
                  </nav>
                </div>
                <div className="border-t border-b border-border">
                  <CategoryListForNewsPage />
                </div>
                <div className="px-4 text-sm">
                  <nav className="flex flex-col gap-2">
                    <Link href="/" className="flex items-center gap-3">
                      <span className="text-lg">Telegram</span>
                    </Link>
                    <Link href="/" className="flex items-center gap-3">
                      <span className="text-lg">Instagram</span>
                    </Link>
                    <Link href="/" className="flex items-center gap-3">
                      <span className="text-lg">Facebook</span>
                    </Link>
                    <Link href="/" className="flex items-center gap-3">
                      <span className="text-lg">YouTube</span>
                    </Link>
                  </nav>
                </div>
              </aside>

              <div className="min-w-0 lg:col-span-4">
                <NewsPageContent news={news} newsId={newsId} />
              </div>

              <aside className="hidden md:flex flex-col gap-6 lg:col-span-2">
                <LatestNews excludeSlug={news.slug} />
              </aside>
            </div>
          </ClientServerOffGate>
        </main>
        <Footer />
      </div>
    </ClientSiteNothingGate>
  )
}
