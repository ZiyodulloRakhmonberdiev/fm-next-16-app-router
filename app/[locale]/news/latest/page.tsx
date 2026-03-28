import { NewsListingPage } from "../_components/news-listing-page"
import type { AppLocale } from "@/shared/common/lib/formatter"

export default async function LatestNewsPage({
  params,
}: {
  params: Promise<{ locale: AppLocale }>
}) {
  const { locale } = await params
  return <NewsListingPage locale={locale} variant="latest" />
}

