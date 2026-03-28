import type { AppLocale } from "@/shared/common/lib/formatter"
import { NewsListingPage } from "./_components/news-listing-page"

export default async function NewsPage({
  params,
}: {
  params: Promise<{ locale: AppLocale }>
}) {
  const { locale } = await params
  return <NewsListingPage locale={locale} variant="latest" />
}

