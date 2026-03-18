import { NewsListingPage } from "../_components/news-listing-page"
import type { AppLocale } from "@/shared/common/lib/formatter"

export default async function AuthorsChoiceNewsPage({
  params,
}: {
  params: { locale: AppLocale }
}) {
  // Bu sahifada filter UI orqali "Muallif tanlovi"ni tanlab olish mumkin;
  // boshlang'ich ko'rinish uchun ham shu turdagi filter ishlaydi.
  return <NewsListingPage locale={params.locale} variant="latest" />
}

