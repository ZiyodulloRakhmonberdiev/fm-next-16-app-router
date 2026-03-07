import { Footer } from "@/widgets/client-footer"
import { Header } from "@/widgets/client-header"
import {ClientSidebar} from "@/widgets/client-sidebar"
import { CategoryPageContent } from "@/features/category/ui/category-page-content"

type Props = {
  params: Promise<{ slug: string }>
}

export default async function CategoryPage({ params }: Props) {
  const { slug } = await params
  return (
    <>
      <div className="block md:hidden">
        <ClientSidebar />
      </div>
      <div className="flex w-full flex-1 flex-col">
        <Header />
        <main className="flex-1 py-4 px-4 md:px-6">
          <div className="max-w-7xl mx-auto">
            <CategoryPageContent slug={slug} />
          </div>
        </main>
        <Footer />
      </div>
    </>
  )
}
