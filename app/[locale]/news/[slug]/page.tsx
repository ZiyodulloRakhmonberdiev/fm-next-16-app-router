import { notFound } from "next/navigation"
import { Footer } from "@/widgets/client-footer"
import { Header } from "@/widgets/client-header"
import ClientSidebar from "@/widgets/client-sidebar/ui/client-sidebar"
import { NewsPageContent } from "@/features/news/ui/news-page-content"
import { pickNewsForLocale } from "@/features/news/model"
import { seedNews } from "@/scripts/seed-news"
import { StayConnected, LatestNews } from "@/shared/common/components/molecules"
import { isAppLocale } from "@/shared/common/lib/locale-api"

type Props = {
  params: Promise<{ locale: string; slug: string }>
}

export default async function NewsPage({ params }: Props) {
  const { locale, slug } = await params
  const currentLocale = isAppLocale(locale) ? locale : "uz"

  const raw = seedNews.news.find((n) => n.slug === slug)
  if (!raw) notFound()
  if ((raw.status ?? "published") !== "published") notFound()
  const news = pickNewsForLocale(raw, currentLocale)
  if (!news) notFound()

  return (
    <>
      <div className="block md:hidden">
        <ClientSidebar />
      </div>
      <div className="flex w-full flex-1 flex-col">
        <Header />
        <main className="flex-1 py-4 px-4 md:px-6">
          <div className="mx-auto max-w-7xl grid grid-cols-1 gap-6 lg:grid-cols-4">
            <div className="min-w-0 lg:col-span-3">
              <NewsPageContent news={news} />
            </div>
            <aside className="hidden lg:flex flex-col gap-6 lg:col-span-1">
              <StayConnected />
              <LatestNews excludeSlug={news.slug} />
            </aside>
          </div>
        </main>
        <Footer />
      </div>
    </>
  )
}
