import { Footer } from "@/widgets/client-footer"
import { Header } from "@/widgets/client-header"
import ClientSidebar from "@/widgets/client-sidebar/ui/client-sidebar"
import ClientSiteNothingGate from "./_components/client-site-nothing-gate"
import ServerLoading from "@/shared/common/components/molecules/server-loading"

export default function LocaleLoading() {
  return (
    <ClientSiteNothingGate>
      <div className="block md:hidden">
        <ClientSidebar />
      </div>
      <div className="flex w-full flex-1 flex-col">
        <Header />
        <main className="flex-1 pb-4">
          <div className="max-w-7xl mx-auto">
            <ServerLoading />
          </div>
        </main>
        <Footer />
      </div>
    </ClientSiteNothingGate>
  )
}
