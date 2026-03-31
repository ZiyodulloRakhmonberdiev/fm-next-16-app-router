import type { Metadata } from "next"
import { getLocale } from "next-intl/server"
import ClientSiteNothingGate from "../_components/client-site-nothing-gate"
import ClientServerOffGate from "../_components/client-server-off-gate"
import { Footer } from "@/widgets/client-footer"
import ClientSidebar from "@/widgets/client-sidebar/ui/client-sidebar"
import { Header } from "@/widgets/client-header"
import { dbConnect } from "@/shared/common/lib/db"
import { NewsModel } from "@/features/news/model/news.model"
import { SpecialNewsPageContent } from "@/features/news/ui/special-news-page-content"
import { LatestNews } from "@/shared/common/components/news-sections"
import { getCachedPublicNews } from "@/shared/server/public-data-server"

export async function generateMetadata(): Promise<Metadata> {
  return { title: "Reklama yangiliklar" }
}

export default async function AdsNewsPage() {
  await dbConnect()
  const rows = await NewsModel.find({ status: "published", ad: true })
    .sort({ publishedAt: -1 })
    .limit(80)
    .lean()
  const list = JSON.parse(JSON.stringify(rows))

  return (
    <ClientSiteNothingGate>
      <div className="block md:hidden">
        <ClientSidebar />
      </div>
      <div className="flex w-full flex-1 flex-col">
        <Header />
        <main className="flex-1 py-4">
          <ClientServerOffGate model="news">
            <div className="mx-auto grid max-w-7xl grid-cols-1 gap-6 lg:grid-cols-4">
              <div className="min-w-0 px-4 md:px-6 lg:col-span-3">
                <SpecialNewsPageContent title="E'lonlar" initialNews={list} />
              </div>
              <aside className="hidden md:flex flex-col gap-6 px-4 md:px-6 lg:col-span-1">
                <LatestNews initialNews={await getCachedPublicNews()} />
              </aside>
            </div>
          </ClientServerOffGate>
        </main>
        <Footer />
      </div>
    </ClientSiteNothingGate>
  )
}
