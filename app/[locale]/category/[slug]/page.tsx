import { Footer } from "@/widgets/client-footer"
import { Header } from "@/widgets/client-header"
import {ClientSidebar} from "@/widgets/client-sidebar"
import { CategoryPageContent } from "@/features/category/ui/category-page-content"
import ClientSiteNothingGate from "../../_components/client-site-nothing-gate"
import ClientServerOffGate from "../../_components/client-server-off-gate"

type Props = {
  params: Promise<{ slug: string }>
}

export default async function CategoryPage({ params }: Props) {
  const { slug } = await params
  return (
    <ClientSiteNothingGate>
      <div className="block md:hidden">
        <ClientSidebar />
      </div>
      <div className="flex w-full flex-1 flex-col">
        <Header />
        <main className="flex-1 py-4 px-4 md:px-6">
          <ClientServerOffGate model="categories">
            <div className="max-w-7xl mx-auto">
              <CategoryPageContent slug={slug} />
            </div>
          </ClientServerOffGate>
        </main>
        <Footer />
      </div>
    </ClientSiteNothingGate>
  )
}
