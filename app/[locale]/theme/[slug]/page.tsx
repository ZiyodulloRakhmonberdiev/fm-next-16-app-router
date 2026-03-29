import { Metadata } from "next"
import type { AppLocale } from "@/shared/common/lib/formatter"
import { isAppLocale } from "@/shared/common/lib/locale-api"
import { NewsListingPage } from "../../news/_components/news-listing-page"
import { getCachedThemeBySlug } from "@/shared/server/public-data-server"
import { notFound } from "next/navigation"

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
  return <NewsListingPage locale={currentLocale} variant="latest" initialThemeId={theme?._id} />
}

