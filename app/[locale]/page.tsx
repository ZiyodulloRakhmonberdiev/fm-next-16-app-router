import { Footer } from "@/widgets/client-footer";
import { Header } from "@/widgets/client-header";
import ClientSidebar from "@/widgets/client-sidebar/ui/client-sidebar";
import { TopBanner } from "@/shared/common/components/organisms";

export default function HomePage() {
  return (
    <>
      <div className="block md:hidden">
        <ClientSidebar />
      </div>
      <div className="flex w-full flex-1 flex-col">
        <Header />
        <main className="flex-1 py-4 px-4 md:px-6">
          <div className="max-w-7xl mx-auto">
            <TopBanner />
          </div>
        </main>
        <Footer />
      </div>
    </>
  );
}