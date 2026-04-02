import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { getTranslations } from "next-intl/server"
import ClientSiteNothingGate from "../../_components/client-site-nothing-gate"
import ClientServerOffGate from "../../_components/client-server-off-gate"
import { Footer } from "@/widgets/client-footer"
import ClientSidebar from "@/widgets/client-sidebar/ui/client-sidebar"
import { Header } from "@/widgets/client-header"
import { dbConnect } from "@/shared/common/lib/db"
import { UserModel } from "@/features/users/model/user.model"
import { NewsModel } from "@/features/news/model/news.model"
import { SpecialNewsPageContent } from "@/features/news/ui/special-news-page-content"
import { LatestNews } from "@/shared/common/components/news-sections"
import { getCachedPublicNews } from "@/shared/server/public-data-server"
import { isAppLocale, type AppLocale } from "@/shared/common/lib/locale-api"
import { pickUserLocaleText } from "@/features/users/lib/user-locale"

type Props = {
  params: Promise<{ locale: string; id: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, id } = await params
  const currentLocale: AppLocale = isAppLocale(locale) ? locale : "uz"
  await dbConnect()
  const author = await UserModel.findById(id).select({ full_name: 1 }).lean()
  if (!author) return {}
  const name = pickUserLocaleText(author.full_name, currentLocale) || "Author"
  return { title: name }
}

export default async function AuthorPage({ params }: Props) {
  const { locale, id } = await params
  const currentLocale: AppLocale = isAppLocale(locale) ? locale : "uz"
  const t = await getTranslations("common")

  await dbConnect()
  const author = await UserModel.findById(id)
    .select({ _id: 1, full_name: 1, description: 1, image: 1 })
    .lean()
  if (!author) notFound()

  const filter = { status: "published", authorId: id }
  const [rows, total] = await Promise.all([
    NewsModel.find(filter).sort({ publishedAt: -1 }).limit(20).lean(),
    NewsModel.countDocuments(filter),
  ])
  const list = JSON.parse(JSON.stringify(rows))
  const totalPages = Math.max(1, Math.ceil(total / 10))
  const initialPage = totalPages >= 2 ? 2 : 1

  const authorName = pickUserLocaleText(author.full_name, currentLocale)
  const authorDescription = pickUserLocaleText(author.description, currentLocale)
  const authorImage = typeof author.image === "string" ? author.image : undefined

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
                  title={authorName}
                  headerImageUrl={authorImage}
                  // headerSubtitle={authorName}
                  headerDescription={authorDescription}
                  initialNews={list}
                  initialPage={initialPage}
                  initialTotalPages={totalPages}
                  enableLoadMore
                  loadMoreQuery={{ authorId: id }}
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
