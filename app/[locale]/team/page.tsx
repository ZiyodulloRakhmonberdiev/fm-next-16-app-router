import { Card, CardContent } from "@/shared/common/components/ui/card"
import { getServerApiUrl } from "@/shared/common/lib/server-api-url"
import { BadgeCheck, Users } from "lucide-react"
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
  const t = await getTranslations("common")
  const teamT = await getTranslations("teamPage")
  const url = await getServerApiUrl("/api/team?public=1")
  const res = await fetch(url, { next: { revalidate: 300 } })
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
              <div className="container mx-auto px-4 py-8 space-y-8">
                <section className="overflow-hidden rounded-[28px] border border-brand/15 bg-linear-to-br from-brand/10 via-background to-background px-6 py-8 md:px-10 md:py-12">
                  <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px] lg:items-center">
                    <div className="space-y-4">
                      <span className="inline-flex items-center gap-2 rounded-full bg-brand px-4 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-white">
                        <Users className="size-3.5" />
                        {t("team_title")}
                      </span>
                      <h1 className="text-3xl font-bold tracking-tight text-foreground md:text-5xl">
                        {t("team_title")}
                      </h1>
                      <p className="max-w-2xl text-sm leading-relaxed text-muted-foreground md:text-base">
                        {items.length > 0
                          ? teamT("intro", { count: items.length })
                          : teamT("empty")}
                      </p>
                    </div>
                    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
                      <div className="rounded-2xl border border-brand/15 bg-white/80 p-4 shadow-sm dark:bg-card/80">
                        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand">
                          {teamT("members_label")}
                        </p>
                        <p className="mt-2 text-3xl font-bold text-foreground">{items.length}</p>
                      </div>
                      <div className="rounded-2xl border border-brand/15 bg-white/80 p-4 shadow-sm dark:bg-card/80">
                        <div className="flex items-center gap-3">
                          <span className="rounded-xl bg-brand/10 p-2 text-brand">
                            <BadgeCheck className="size-5" />
                          </span>
                          <p className="text-sm leading-relaxed text-muted-foreground">{teamT("hover_hint")}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </section>

                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                  {items.map((m) => (
                    <Card
                      key={m._id}
                      className="group overflow-hidden border-brand/10 bg-card p-0 transition-all duration-300 hover:-translate-y-1 hover:border-brand/30 hover:shadow-[0_20px_50px_-30px_rgba(209,0,28,0.55)]"
                    >
                      <CardContent className="p-0">
                        <div className="relative overflow-hidden">
                          {m.badgeImage ? (
                            <img
                              src={m.badgeImage}
                              alt={m.fullName}
                              className="block h-auto w-full transition-transform duration-300 group-hover:scale-[1.02]"
                            />
                          ) : (
                            <div className="flex aspect-4/5 items-center justify-center bg-brand/10 text-2xl font-semibold text-brand">
                              {m.fullName.slice(0, 1)}
                            </div>
                          )}
                        </div>
                        <div className="space-y-1 border-t border-brand/10 p-4">
                          <p className="line-clamp-1 font-semibold text-foreground">{m.fullName}</p>
                          <p className="line-clamp-2 text-sm text-muted-foreground">{m.position}</p>
                        </div>
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