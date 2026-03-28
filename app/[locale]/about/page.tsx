import { getTranslations } from "next-intl/server"
import type { Metadata } from "next"
import ClientSiteNothingGate from "../_components/client-site-nothing-gate"
import ClientServerOffGate from "../_components/client-server-off-gate"
import { Footer } from "@/widgets/client-footer"
import { ClientSidebar } from "@/widgets/client-sidebar"
import { Header } from "@/widgets/client-header"
import { InteractiveSectionsPage } from "../_components/interactive-sections-page"

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("aboutPage")
  return {
    title: t("page_title"),
  }
}

export default async function AboutPage() {
  const t = await getTranslations("aboutPage")
  const sections = t.raw("sections") as string[]

  return (
    <ClientSiteNothingGate>
      <div className="block md:hidden">
        <ClientSidebar />
      </div>
      <div className="flex w-full flex-1 flex-col">
        <Header />
        <main className="flex-1 py-6 px-4 md:px-6">
          <ClientServerOffGate model="categories">
            <InteractiveSectionsPage
              title={t("page_title")}
              sections={sections}
              ctaHref="/team"
              ctaLabel={t("team_link")}
            />
          </ClientServerOffGate>
        </main>
        <Footer />
      </div>
    </ClientSiteNothingGate>
  )
}
