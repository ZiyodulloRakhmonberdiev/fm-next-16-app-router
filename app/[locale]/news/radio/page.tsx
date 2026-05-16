import { Footer } from "@/widgets/client-footer"
import { Header } from "@/widgets/client-header"
import { ClientSidebar } from "@/widgets/client-sidebar"
import ClientSiteNothingGate from "../../_components/client-site-nothing-gate"
import ClientServerOffGate from "../../_components/client-server-off-gate"
import { RadioNewsPageClient } from "./radio-page-client"

export default async function RadioNewsPage() {
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
              <RadioNewsPageClient />
            </div>
          </ClientServerOffGate>
        </main>
        <Footer />
      </div>
    </ClientSiteNothingGate>
  )
}
