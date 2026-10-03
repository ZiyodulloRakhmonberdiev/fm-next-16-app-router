import { getPublicNewsPage } from "@/shared/server/public-news-list"
import { setPageLocale } from "@/i18n/set-page-locale"
import { Footer } from "@/widgets/client-footer"
import { Header } from "@/widgets/client-header"
import { ClientSidebar } from "@/widgets/client-sidebar"
import ClientSiteNothingGate from "../../_components/client-site-nothing-gate"
import ClientServerOffGate from "../../_components/client-server-off-gate"
import { NewsListingPageContent } from "@/features/news/ui/news-listing-page-content"
import type { AppLocale } from "@/shared/common/lib/formatter"

export default async function VideoNewsPage({
  params,
}: {
  params: Promise<{ locale: AppLocale }>
}) {
  const { locale } = await params
  setPageLocale(locale)
  const initial = await getPublicNewsPage({ locale, pageSize: 9, video: true })
  return (
    <ClientSiteNothingGate>
      <div className="block md:hidden">
        <ClientSidebar />
      </div>
      <div className="flex w-full flex-1 flex-col">
        <Header />
        <main className="flex-1">
          <ClientServerOffGate model="news">
            <div className="mx-auto max-w-7xl">
              <NewsListingPageContent
                initial={initial}
                initialFilter="video"
                layout="videoGrid"
                forceVideoOnly
                pageSize={9}
              />
            </div>
          </ClientServerOffGate>
        </main>
        <Footer />
      </div>
    </ClientSiteNothingGate>
  )
}

