import { notFound } from "next/navigation"
import { Footer } from "@/widgets/client-footer"
import { Header } from "@/widgets/client-header"
import ClientSidebar from "@/widgets/client-sidebar/ui/client-sidebar"
import { NewsPageContent } from "@/features/news/ui/news-page-content"
import { pickNewsForLocale, type RawNewsItem } from "@/features/news/model"
import { StayConnected, StayConnectedSidebar, LatestNews } from "@/shared/common/components/molecules"
import { isAppLocale } from "@/shared/common/lib/locale-api"
import { dbConnect } from "@/shared/common/lib/db"
import { NewsModel } from "@/features/news/model/news.model"
import ClientSiteNothingGate from "../../_components/client-site-nothing-gate"
import ClientServerOffGate from "../../_components/client-server-off-gate"

type Props = {
  params: Promise<{ locale: string; slug: string }>
}

export default async function NewsPage({ params }: Props) {
  const { locale, slug } = await params
  const currentLocale = isAppLocale(locale) ? locale : "uz"

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
            <div className="mx-auto max-w-7xl grid grid-cols-1 gap-6 lg:grid-cols-4">
              <div className="min-w-0 lg:col-span-3">
                <NewsPageContent news={news} newsId={newsId} />
              </div>
              <aside className="flex-col gap-6 lg:col-span-1">
                <StayConnectedSidebar />
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
