import { notFound } from "next/navigation"
import { Footer } from "@/widgets/client-footer"
import { Header } from "@/widgets/client-header"
import ClientSidebar from "@/widgets/client-sidebar/ui/client-sidebar"
import { NewsPageContent } from "@/features/news/ui/news-page-content"
import { seedNews } from "@/scripts/seed-news"
import { StayConnected, LatestNews } from "@/shared/common/components/molecules"

type Props = {
  params: Promise<{ slug: string }>
}

export default async function NewsPage({ params }: Props) {
  const { slug } = await params
  const news = seedNews.news.find((n) => n.slug === slug)
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
              <LatestNews />
            </aside>
          </div>
        </main>
        <Footer />
      </div>
    </>
  )
}
