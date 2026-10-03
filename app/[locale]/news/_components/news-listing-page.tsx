import { Footer } from "@/widgets/client-footer"
import { Header } from "@/widgets/client-header"
import { ClientSidebar } from "@/widgets/client-sidebar"
import ClientSiteNothingGate from "../../_components/client-site-nothing-gate"
import ClientServerOffGate from "../../_components/client-server-off-gate"
import { NewsListingPageContent } from "@/features/news/ui/news-listing-page-content"
import type { NewsListingVariant } from "@/features/news/ui/news-listing-page-content"
import type { AppLocale } from "@/shared/common/lib/formatter"
import { getPublicNewsPage } from "@/shared/server/public-news-list"
import { setPageLocale } from "@/i18n/set-page-locale"

export async function NewsListingPage({
  locale,
  variant = "latest",
  initialCategorySlug,
  initialThemeId,
}: {
  locale: AppLocale
  variant?: NewsListingVariant
  initialCategorySlug?: string
  initialThemeId?: string
}) {
  setPageLocale(locale)
  const categorySlugs = initialCategorySlug ? [initialCategorySlug] : undefined
  const themeIds = initialThemeId ? [initialThemeId] : undefined
  const initial = await getPublicNewsPage({
    locale, pageSize: 10, pageCount: 2, categorySlugs, themeIds,
    sortBy: variant === "trending" ? "views" : "publishedAt",
  })
  return (
    <ClientSiteNothingGate>
      <div className="block md:hidden">
        <ClientSidebar />
      </div>
      <div className="flex w-full flex-1 flex-col">
        <Header />
        <main className="flex-1">
          <ClientServerOffGate model="news">
            <div className="max-w-7xl mx-auto">
              <NewsListingPageContent
                variant={variant}
                initial={initial}
                initialCategorySlug={initialCategorySlug}
                initialThemeId={initialThemeId}
                pageSize={10}
              />
            </div>
          </ClientServerOffGate>
        </main>
        <Footer />
      </div>
    </ClientSiteNothingGate>
  )
}

