
import { getServerApiUrl } from "@/shared/common/lib/server-api-url"
import { BadgeCheck } from "lucide-react"
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
  // const teamT = await getTranslations("teamPage")
  const url = await getServerApiUrl("/api/team?public=1")
  const res = await fetch(url, { next: { revalidate: 300 } })
  if (!res.ok) {
    throw new Error("Jamoa ma'lumotlarini yuklab bo'lmadi")
  }
  const items = (await res.json()) as TeamRow[]

  return (
    <ClientSiteNothingGate>
      <div className="block md:hidden">
        <ClientSidebar />
      </div>
      <div className="flex w-full flex-1 flex-col bg-background">
        <Header />
        <main className="flex-1 py-4 md:py-16 px-4 md:px-6">
          <ClientServerOffGate model="categories">
            <div className="max-w-7xl mx-auto space-y-6 md:space-y-20">

              {/* Minimalist Header */}
              <section className="space-y-6">
                {/* <h1 className="text-4xl font-light tracking-tight text-foreground md:text-6xl">
                </h1> */}
                <div className="border-b flex justify-center">
                  <h1 className="text-xl font-bold md:text-3xl text-center bg-brand text-white inline-block px-3 py-2 rounded-xs">
                    {/* {title} */}
                    {t("team_title")}
                  </h1>
                </div>
                {/* <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-8 border-b border-border">
                  <p className="max-w-2xl text-lg font-light leading-relaxed text-muted-foreground md:text-xl">
                    {items.length > 0
                      ? teamT("intro", { count: items.length })
                      : teamT("empty")}
                  </p>
                </div> */}
              </section>

              {/* Minimalist Member Grid */}
              <div className="grid gap-x-6 gap-y-4 md:gap-y-6 sm:grid-cols-2 lg:grid-cols-4">
                {items.map((m) => (
                  <div
                    key={m._id}
                    className="group"
                  >
                    <div className="relative overflow-hidden rounded-xl border border-border bg-muted/10 transition-colors duration-500 group-hover:border-foreground/20">
                      {(m.image || m.badgeImage) ? (
                        <img
                          src={m.image || m.badgeImage}
                          alt={m.fullName}
                          className="w-full h-auto transition-transform duration-700 group-hover:scale-105"
                        />
                      ) : (
                        <div className="flex aspect-[4/5] w-full items-center justify-center text-4xl font-light text-muted-foreground">
                          {m.fullName.slice(0, 1)}
                        </div>
                      )}

                      {/* <div className="absolute top-4 right-4 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                         <div className="bg-background/80 backdrop-blur-sm p-1.5 rounded-full border border-border">
                            <BadgeCheck className="size-4 text-foreground" />
                         </div>
                      </div> */}
                    </div>

                    {/* <div className="space-y-1 px-1">
                      <h3 className="text-lg font-medium tracking-tight text-foreground">
                        {m.fullName}
                      </h3>
                      <p className="text-sm font-light text-muted-foreground">
                        {m.position}
                      </p>
                    </div> */}
                  </div>
                ))}
              </div>

              {/* Subtle Hint */}
              {/* {items.length > 0 && (
                <div className="flex justify-center pt-8 border-t border-border/50">
                  <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground/60 italic">
                    {teamT("hover_hint")}
                  </p>
                </div>
              )} */}

            </div>
          </ClientServerOffGate>
        </main>
        <Footer />
      </div>
    </ClientSiteNothingGate>
  )
}
