import { NewsListingPage } from "../_components/news-listing-page"
import type { AppLocale } from "@/shared/common/lib/formatter"

export default async function LatestNewsPage({
  params,
}: {
  params: { locale: AppLocale }
}) {
  return <NewsListingPage locale={params.locale} variant="latest" />
}

