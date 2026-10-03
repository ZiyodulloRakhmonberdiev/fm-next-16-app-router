import { Metadata } from "next"
import { notFound } from "next/navigation"
import { Footer } from "@/widgets/client-footer"
import { Header } from "@/widgets/client-header"
import ClientSidebar from "@/widgets/client-sidebar/ui/client-sidebar"
import { NewsSlugPageContent, NewsSlugSidebar } from "@/entities/news/slug/_components"
import { pickNewsForLocale, type RawNewsItem } from "@/features/news/model"
import LatestNews from "@/entities/news/lists/latest-news"
import { isAppLocale } from "@/shared/common/lib/locale-api"
import { getPublishedNewsBySlug } from "@/shared/server/public-news-detail"
import { setPageLocale } from "@/i18n/set-page-locale"
import { UserModel } from "@/features/users/model/user.model"
import ClientSiteNothingGate from "../../_components/client-site-nothing-gate"
import ClientServerOffGate from "../../_components/client-server-off-gate"
import { getPublicSidebarNews } from "@/shared/server/public-data-server"
import { pickUserLocaleText } from "@/features/users/lib/user-locale"

type Props = {
  params: Promise<{ locale: string; slug: string }>
}

export function generateStaticParams() { return [] }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, slug } = await params
  setPageLocale(locale)
  const currentLocale = isAppLocale(locale) ? locale : "uz"

  const raw = await getPublishedNewsBySlug(slug)
  if (!raw) return {}

  const news = pickNewsForLocale(raw as RawNewsItem, currentLocale)
  if (!news) return {}

  const description = news.description || news.title || ""
  const url = `https://ferganamedia.uz/${locale}/news/${slug}`

  return {
    title: `${news.title} | Fergana Media`,
    description: description.slice(0, 160),
    alternates: {
      canonical: url,
    },
    openGraph: {
      title: news.title,
      description: description.slice(0, 160),
      url: url,
      siteName: "Fergana Media",
      images: news.images?.[0] ? [{ url: news.images[0] }] : [],
      type: "article",
      publishedTime: news.publishedAt?.toString(),
    },
    twitter: {
      card: "summary_large_image",
      title: news.title,
      description: description.slice(0, 160),
      images: news.images?.[0] ? [news.images[0]] : [],
    },
  }
}

export default async function NewsPage({ params }: Props) {
  const { locale, slug } = await params
  setPageLocale(locale)
  const currentLocale = isAppLocale(locale) ? locale : "uz"
  const cachedRaw = await getPublishedNewsBySlug(slug)
  if (!cachedRaw) notFound()
  const raw = { ...cachedRaw }
  if (raw.authorId) {
    const author = await UserModel.findById(raw.authorId).select({ _id: 1, full_name: 1, image: 1 }).lean()
    if (author?.full_name) {
      ;(raw as RawNewsItem).author = pickUserLocaleText(author.full_name, currentLocale)
      ;(raw as RawNewsItem).authorImage = typeof author.image === "string" ? author.image : null
    }
  }
  const news = pickNewsForLocale(raw as RawNewsItem, currentLocale)
  if (!news) notFound()

  const rawObj = raw as Record<string, unknown>
  const newsId =
    rawObj._id != null && rawObj._id !== ""
      ? String(rawObj._id)
      : undefined
  

  return (
    <ClientSiteNothingGate>
      <div className="block md:hidden">
        <ClientSidebar />
      </div>
      <div className="flex w-full flex-1 flex-col">
        <div className="md:hidden">
          <Header variant="news-page-header" shareTitle={news.title} />
        </div>
        <div className="hidden md:block">
          <Header />
        </div>
        <main className="flex-1 md:py-4">
          <ClientServerOffGate model="news">
            <div className="mx-auto max-w-7xl grid grid-cols-1 gap-6 lg:grid-cols-7">
              <NewsSlugSidebar />
              <div className="min-w-0 lg:col-span-4">                
                <NewsSlugPageContent news={news} newsId={newsId} />
              </div>
              <aside className="hidden md:flex flex-col gap-6 lg:col-span-2 px-4 md:px-6 pb-16">
                <LatestNews items={await getPublicSidebarNews(currentLocale, news.slug)} />
              </aside>
            </div>
          </ClientServerOffGate>
        </main>
        <div className="bg-background z-100">
          <Footer />
        </div>
      </div>
    </ClientSiteNothingGate>
  )
}
