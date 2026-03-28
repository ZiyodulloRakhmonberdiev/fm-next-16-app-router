import { Metadata } from "next"
import { notFound } from "next/navigation"
import { Footer } from "@/widgets/client-footer"
import { Header } from "@/widgets/client-header"
import ClientSidebar from "@/widgets/client-sidebar/ui/client-sidebar"
import { NewsPageContent } from "@/features/news/ui/news-page-content"
import { pickNewsForLocale, type RawNewsItem } from "@/features/news/model"
import { StayConnectedForNewsPage } from "@/shared/common/components/organisms"
import { LatestNews } from "@/shared/common/components/news-sections"
import { isAppLocale } from "@/shared/common/lib/locale-api"
import { dbConnect } from "@/shared/common/lib/db"
import { NewsModel } from "@/features/news/model/news.model"
import { Link } from "@/i18n/navigation"
import { CategoryListForNewsPage } from "@/entities/category/ui/category-list"
import ClientSiteNothingGate from "../../_components/client-site-nothing-gate"
import ClientServerOffGate from "../../_components/client-server-off-gate"
import { Flame, History, HomeIcon, Lightbulb, TrendingUpIcon, VideoIcon } from "lucide-react"
import { getTranslations } from "next-intl/server"
import {
  SiteSettingsModel,
  SITE_SETTINGS_DOCUMENT_ID,
  leanDocToPayload,
} from "@/features/dashboard/configs/site-settings.model"
import { AdSlot } from "@/features/ads/ui/ad-slot"
import { getCachedPublicNews } from "@/shared/server/public-data-server"

type Props = {
  params: Promise<{ locale: string; slug: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, slug } = await params
  const currentLocale = isAppLocale(locale) ? locale : "uz"
  
  await dbConnect()
  const raw = await NewsModel.findOne({ slug, status: "published" }).lean()
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
  const currentLocale = isAppLocale(locale) ? locale : "uz"
  const t = await getTranslations("common")

  await dbConnect()
  const raw = await NewsModel.findOne({ slug, status: "published" }).lean()
  if (!raw) notFound()
  const news = pickNewsForLocale(raw as RawNewsItem, currentLocale)
  if (!news) notFound()

  const rawObj = raw as Record<string, unknown>
  const newsId =
    rawObj._id != null && rawObj._id !== ""
      ? String(rawObj._id)
      : undefined
  const settingsDoc = await SiteSettingsModel.findById(SITE_SETTINGS_DOCUMENT_ID).lean()
  const settingsPayload = leanDocToPayload(settingsDoc)
  const socialMap = new Map(
    (settingsPayload?.socialMedia ?? []).map((item) => [item.slug, item.href])
  )
  const socialLinks = [
    { label: "Telegram", href: socialMap.get("telegram") ?? "" },
    { label: "Instagram", href: socialMap.get("instagram") ?? "" },
    { label: "Facebook", href: socialMap.get("facebook") ?? "" },
    { label: "YouTube", href: socialMap.get("youtube") ?? "" },
  ].filter((item) => item.href.trim())

  return (
    <ClientSiteNothingGate>
      <div className="block md:hidden">
        <ClientSidebar />
      </div>
      <div className="flex w-full flex-1 flex-col">
        <Header />
        <main className="flex-1 py-4 px-4 md:px-6">
          <ClientServerOffGate model="news">
            <div className="mx-auto max-w-7xl grid grid-cols-1 gap-6 lg:grid-cols-7">
              <aside className="hidden lg:flex lg:flex-col lg:col-span-1 lg:sticky lg:top-20 lg:self-start gap-4">
                <div className="px-4 text-lg">
                  <nav className="flex flex-col gap-4">
                    <Link href="/" className="flex items-center gap-3">
                     <HomeIcon className="w-5 h-5" /> <span className="text-lg">{t("nav_home")}</span>
                    </Link>
                    <Link href="/news/trending" className="flex items-center gap-3">
                      <Flame className="w-5 h-5" /> <span className="text-lg">{t("nav_trending")}</span>
                    </Link>
                    <Link href="/news/latest" className="flex items-center gap-3">
                      <History className="w-5 h-5" /> <span className="text-lg">{t("nav_latest")}</span>
                    </Link>
                    <Link href="/news/video" className="flex items-center gap-3">
                      <VideoIcon className="w-5 h-5" /> <span className="text-lg">{t("nav_video")}</span>
                    </Link>
                  </nav>
                </div>
                <div className="border-t border-b border-border">
                  <CategoryListForNewsPage />
                </div>
                <div className="px-4 text-sm">
                  <nav className="flex flex-col gap-2">
                    {socialLinks.map((item) => (
                      <a key={item.label} href={item.href} target="_blank" rel="noreferrer" className="flex items-center gap-3">
                        <span className="text-lg">{item.label}</span>
                      </a>
                    ))}
                  </nav>
                </div>
              </aside>

              <div className="min-w-0 lg:col-span-4">
                <NewsPageContent news={news} newsId={newsId} />
              </div>

              <aside className="hidden md:flex flex-col gap-6 lg:col-span-2">
                <AdSlot placement="sidebar_widget" />
                <LatestNews excludeSlug={news.slug} initialNews={await getCachedPublicNews()} />
              </aside>
            </div>
          </ClientServerOffGate>
        </main>
        <Footer />
      </div>
    </ClientSiteNothingGate>
  )
}
