import { NewsListingPage } from "../_components/news-listing-page"
import type { AppLocale } from "@/shared/common/lib/formatter"

export default async function AuthorsChoiceNewsPage({
  params,
}: {
  params: Promise<{ locale: AppLocale }>
}) {
  const { locale } = await params
  // Bu sahifada filter UI orqali "Muallif tanlovi"ni tanlab olish mumkin;
  // boshlang'ich ko'rinish uchun ham shu turdagi filter ishlaydi.
  return <NewsListingPage locale={locale} variant="latest" />
}
