import { SavedNewsPageContent } from "@/features/news/ui/saved-news-page-content"
import { Header } from "@/widgets/client-header"
import { Footer } from "@/widgets/client-footer"

export default function SavedNewsPage() {
  return (
    <div className="flex w-full flex-1 flex-col">
      <Header />
      <main className="flex-1 py-4 px-4 md:px-6">
        <div className="max-w-7xl mx-auto">
          <SavedNewsPageContent title="Saqlangan yangiliklar" />
        </div>
      </main>
      <Footer />
    </div>
  )
}
