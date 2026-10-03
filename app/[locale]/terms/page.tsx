import { setPageLocale, type LocalePageProps } from "@/i18n/set-page-locale"
import { getTranslations } from "next-intl/server"
import type { Metadata } from "next"
import ClientSiteNothingGate from "../_components/client-site-nothing-gate"
import ClientServerOffGate from "../_components/client-server-off-gate"
import { Footer } from "@/widgets/client-footer"
import { ClientSidebar } from "@/widgets/client-sidebar"
import { Header } from "@/widgets/client-header"
import { InteractiveSectionsPage } from "../_components/interactive-sections-page"

export async function generateMetadata({ params }: LocalePageProps): Promise<Metadata> {
  setPageLocale((await params).locale)
  const t = await getTranslations("termsPage")
  return {
    title: t("title"),
  }
}

export default async function TermsPage({ params }: LocalePageProps) {
  setPageLocale((await params).locale)
  const t = await getTranslations("termsPage")
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
            <InteractiveSectionsPage title={t("title")} sections={sections} />
          </ClientServerOffGate>
        </main>
        <Footer />
      </div>
    </ClientSiteNothingGate>
  )
}
