import type { AppLocale } from "@/shared/common/lib/formatter"
import { NewsListingPage } from "./_components/news-listing-page"

export default async function NewsPage({
  params,
}: {
  params: { locale: AppLocale }
}) {
  return <NewsListingPage locale={params.locale} variant="latest" />
}

