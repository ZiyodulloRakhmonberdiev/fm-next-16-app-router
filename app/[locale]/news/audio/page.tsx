import { getPublicNewsPage } from "@/shared/server/public-news-list"
import { setPageLocale } from "@/i18n/set-page-locale"
import { Footer } from "@/widgets/client-footer"
import { Header } from "@/widgets/client-header"
import { ClientSidebar } from "@/widgets/client-sidebar"
import ClientSiteNothingGate from "../../_components/client-site-nothing-gate"
import ClientServerOffGate from "../../_components/client-server-off-gate"
import type { AppLocale } from "@/shared/common/lib/formatter"
import { AudioNewsPageClient } from "./audio-page-client"

export default async function AudioNewsPage({
  params,
}: {
  params: Promise<{ locale: AppLocale }>
}) {
  const { locale } = await params
  setPageLocale(locale)
  const initial = await getPublicNewsPage({ locale, pageSize: 9, audio: true })

  return (
    <ClientSiteNothingGate>
      <div className="block md:hidden">
        <ClientSidebar />
      </div>
      <div className="flex w-full flex-1 flex-col">
        <div className="hidden md:block">
          <Header />
        </div>
        <main className="flex-1">
          <ClientServerOffGate model="news">
            <div className="mx-auto max-w-7xl">
              <AudioNewsPageClient initial={initial} />
            </div>
          </ClientServerOffGate>
        </main>
        <Footer />
      </div>
    </ClientSiteNothingGate>
  )
}
