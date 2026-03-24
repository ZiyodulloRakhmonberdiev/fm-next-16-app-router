import { getLocale } from "next-intl/server"
import type { AppLocale } from "@/shared/common/lib/formatter"
import { Card, CardContent } from "@/shared/common/components/ui/card"
import { getServerApiUrl } from "@/shared/common/lib/server-api-url"
import ClientServerOffGate from "../_components/client-server-off-gate"
import { Footer } from "@/widgets/client-footer"
import ClientSiteNothingGate from "../_components/client-site-nothing-gate"
import { ClientSidebar } from "@/widgets/client-sidebar"
import { Header } from "@/widgets/client-header"
import { getTranslations } from "next-intl/server"

type TeamRow = {
  _id: string
  order: string
  image?: string
  fullName: string
  position: string
  qrCode?: string
  badgeImage?: string
}

export default async function TeamPage() {
  const locale = (await getLocale()) as AppLocale
  const t = await getTranslations("common")
  const url = await getServerApiUrl("/api/team?public=1")
  const res = await fetch(url, { cache: "no-store" })
  if (!res.ok) {
    throw new Error("Team ma'lumotlarini yuklab bo'lmadi")
  }
  const items = (await res.json()) as TeamRow[]

  return (
    <ClientSiteNothingGate>
      <div className="block md:hidden">
        <ClientSidebar />
      </div>
      <div className="flex w-full flex-1 flex-col">
        <Header />
        <main className="flex-1 py-4 px-4 md:px-6">
          <ClientServerOffGate model="categories">
            <div className="max-w-7xl mx-auto">
              <div className="container mx-auto px-4 py-8 space-y-6">
                <h1 className="text-2xl md:text-3xl font-semibold tracking-tight">
                  {t("team_title")}
                </h1>
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                  {items.map((m) => (
                    <Card key={m._id} className="overflow-hidden flex items-center justify-center p-0">
                      <CardContent className="flex items-center justify-center p-0">
                        {m.badgeImage && (
                          <img
                            src={m.badgeImage}
                            alt={m.fullName}
                            className="block h-auto w-auto"
                          />
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            </div>
          </ClientServerOffGate>
        </main>
        <Footer />
      </div>
    </ClientSiteNothingGate>
  )
}