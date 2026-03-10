import { Footer } from "@/widgets/client-footer";
import { Header } from "@/widgets/client-header";
import ClientSidebar from "@/widgets/client-sidebar/ui/client-sidebar";
import { Analytics } from "@vercel/analytics/next"
import HomeMainContent from "./_components/home-main-content";

export default function HomePage() {
  return (
    <>
      <Analytics />
      <div className="block md:hidden">
        <ClientSidebar />
      </div>
      <div className="flex w-full flex-1 flex-col">
        <Header />
        <main className="flex-1 py-4">
          <div className="max-w-7xl mx-auto">
            <HomeMainContent />
          </div>
        </main>
        <Footer />
      </div>
    </>
  );
}