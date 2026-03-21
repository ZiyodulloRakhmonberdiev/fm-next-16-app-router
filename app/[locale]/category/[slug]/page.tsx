import type { AppLocale } from "@/shared/common/lib/formatter"
import { isAppLocale } from "@/shared/common/lib/locale-api"
import { NewsListingPage } from "../../news/_components/news-listing-page"

type Props = {
  params: Promise<{ locale: string; slug: string }>
}

export default async function CategoryPage({ params }: Props) {
  const { locale, slug } = await params
  const currentLocale = (isAppLocale(locale) ? locale : "uz") as AppLocale
  return <NewsListingPage locale={currentLocale} variant="latest" initialCategorySlug={slug} />
}
