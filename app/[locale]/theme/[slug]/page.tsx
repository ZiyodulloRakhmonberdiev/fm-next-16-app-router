import { Metadata } from "next"
import type { AppLocale } from "@/shared/common/lib/formatter"
import { isAppLocale } from "@/shared/common/lib/locale-api"
import { getCachedThemeBySlug } from "@/shared/server/public-data-server"
import { notFound } from "next/navigation"
import { SpecialNewsPageContent } from "@/features/news/ui/special-news-page-content"
import ClientSiteNothingGate from "../../_components/client-site-nothing-gate"
import ClientServerOffGate from "../../_components/client-server-off-gate"
import { ClientSidebar } from "@/widgets/client-sidebar"
import { Header } from "@/widgets/client-header"
import { Footer } from "@/widgets/client-footer"
import LatestNews from "@/entities/news/lists/latest-news"
import { dbConnect } from "@/shared/common/lib/db"
import { NewsModel } from "@/features/news/model/news.model"
import { getCachedPublicNews } from "@/shared/server/public-data-server"

type Props = {
  params: Promise<{ locale: string; slug: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, slug } = await params
  const currentLocale = (isAppLocale(locale) ? locale : "uz") as AppLocale
  const theme = await getCachedThemeBySlug(slug)

  const name = theme?.name?.[currentLocale] || theme?.name?.uz || slug
  const title = `${name} | Fergana Media`
  const description = `${name} temasiga oid eng so'nggi yangiliklar - Fergana Media.`
  const url = `https://ferganamedia.uz/${locale}/theme/${slug}`

  return {
    title,
    description,
    alternates: {
      canonical: url,
    },
    openGraph: {
      title,
      description,
      url,
      siteName: "Fergana Media",
      type: "website",
    },
  }
}

export default async function ThemePage({ params }: Props) {
  const { locale, slug } = await params
  const currentLocale = (isAppLocale(locale) ? locale : "uz") as AppLocale
  const theme = await getCachedThemeBySlug(slug)
  if (!theme?._id) notFound()

  const subtitle = (theme?.subtitle?.[currentLocale] ?? theme?.subtitle?.uz ?? "").trim()
  const description = (theme?.description?.[currentLocale] ?? theme?.description?.uz ?? "").trim()
  const title = theme?.name?.[currentLocale] || theme?.name?.uz || slug

  await dbConnect()
  const filter = { status: "published", themeId: theme._id, ad: { $ne: true }, stats: { $ne: true } }
  const [themed, total] = await Promise.all([
    NewsModel.find(filter).sort({ publishedAt: -1 }).limit(20).lean(),
    NewsModel.countDocuments(filter),
  ])
  const totalPages = Math.max(1, Math.ceil(total / 10))
  const initialPage = totalPages >= 2 ? 2 : 1

  return (
    <ClientSiteNothingGate>
      <div className="block md:hidden">
        <ClientSidebar />
      </div>
      <div className="flex w-full flex-1 flex-col">
        <Header />
        <main className="flex-1 py-4">
          <ClientServerOffGate model="news">
            <div className="mx-auto grid max-w-7xl grid-cols-1 gap-6 lg:grid-cols-4">
              <div className="min-w-0 px-4 md:px-6 lg:col-span-3">
                <SpecialNewsPageContent
                  title={title}
                  headerImageUrl={(theme as any).imageUrl || undefined}
                  headerSubtitle={subtitle || undefined}
                  headerDescription={description || undefined}
                  initialNews={themed}
                  initialPage={initialPage}
                  initialTotalPages={totalPages}
                  enableLoadMore
                  loadMoreQuery={{ themeId: theme._id }}
                />
              </div>
              <aside className="hidden md:flex flex-col gap-6 px-4 md:px-6 lg:col-span-1">
                <LatestNews initialNews={await getCachedPublicNews()} />
              </aside>
            </div>
          </ClientServerOffGate>
        </main>
        <Footer />
      </div>
    </ClientSiteNothingGate>
  )
}

