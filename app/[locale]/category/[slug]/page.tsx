import { Metadata } from "next"
import type { AppLocale } from "@/shared/common/lib/formatter"
import { isAppLocale } from "@/shared/common/lib/locale-api"
import { NewsListingPage } from "../../news/_components/news-listing-page"
import { getCachedCategoryBySlug } from "@/shared/common/lib/public-data-server"

type Props = {
  params: Promise<{ locale: string; slug: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, slug } = await params
  const currentLocale = (isAppLocale(locale) ? locale : "uz") as AppLocale
  const category = await getCachedCategoryBySlug(slug)
  
  const name = category?.name?.[currentLocale] || category?.name?.uz || slug
  const title = `${name} | Fergana Media`
  const description = `${name} rukni bo'yicha eng so'nggi yangiliklar - Fergana Media.`
  const url = `https://ferganamedia.uz/${locale}/category/${slug}`
  
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

export default async function CategoryPage({ params }: Props) {
  const { locale, slug } = await params
  const currentLocale = (isAppLocale(locale) ? locale : "uz") as AppLocale
  return <NewsListingPage locale={currentLocale} variant="latest" initialCategorySlug={slug} />
}
