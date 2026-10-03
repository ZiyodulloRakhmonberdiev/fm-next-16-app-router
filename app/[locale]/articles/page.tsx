import { setPageLocale, type LocalePageProps } from "@/i18n/set-page-locale"
import type { Metadata } from "next"
import { getTranslations } from "next-intl/server"
import ClientSiteNothingGate from "../_components/client-site-nothing-gate"
import ClientServerOffGate from "../_components/client-server-off-gate"
import { Footer } from "@/widgets/client-footer"
import ClientSidebar from "@/widgets/client-sidebar/ui/client-sidebar"
import { Header } from "@/widgets/client-header"
import { dbConnect } from "@/shared/common/lib/db"
import { NewsModel } from "@/features/news/model/news.model"
import { SpecialNewsPageContent } from "@/features/news/ui/special-news-page-content"
import LatestNews from "@/entities/news/lists/latest-news"
import { getPublicSidebarNews } from "@/shared/server/public-data-server"

export async function generateMetadata({ params }: LocalePageProps): Promise<Metadata> {
  setPageLocale((await params).locale)
  const t = await getTranslations("common")
  return { title: t("articles") }
}

export default async function StatsNewsPage({ params }: LocalePageProps) {
  const pageLocale = setPageLocale((await params).locale)
  const t = await getTranslations("common")
  await dbConnect()
  const filter = { status: "published", stats: true }
  const [rows, total] = await Promise.all([
    NewsModel.find(filter)
    .sort({ publishedAt: -1 })
      .limit(20)
      .lean(),
    NewsModel.countDocuments(filter),
  ])
  const list = JSON.parse(JSON.stringify(rows))
  const totalPages = Math.max(1, Math.ceil(total / 10))
  const initialPage = totalPages >= 2 ? 2 : 1

  return (
    <ClientSiteNothingGate>
      <div className="block md:hidden">
        <ClientSidebar />
      </div>
      <div className="flex w-full flex-1 flex-col">
        <Header />
        <main className="flex-1 py-4">
          <ClientServerOffGate model="news">
            <div className="mx-auto grid max-w-7xl grid-cols-1 gap-6 lg:grid-cols-3">
              <div className="min-w-0 px-4 md:px-6 lg:col-span-2">
                <SpecialNewsPageContent
                  title={t("articles")}
                  initialNews={list}
                  initialPage={initialPage}
                  initialTotalPages={totalPages}
                  enableLoadMore
                  loadMoreQuery={{ stats: true }}
                />
              </div>
              <aside className="hidden md:flex flex-col gap-6 px-4 md:px-6 lg:col-span-1">
                <LatestNews items={await getPublicSidebarNews(pageLocale)} />
              </aside>
            </div>
          </ClientServerOffGate>
        </main>
        <Footer />
      </div>
    </ClientSiteNothingGate>
  )
}
