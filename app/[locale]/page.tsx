import { Suspense } from "react";
import { Footer } from "@/widgets/client-footer";
import { Header } from "@/widgets/client-header";
import ClientSidebar from "@/widgets/client-sidebar/ui/client-sidebar";
import HomeMainContent from "./_components/home-main-content";
import HomePageSkeleton from "./_components/home-page-skeleton";
import ClientSiteNothingGate from "./_components/client-site-nothing-gate";
import ClientServerOffGate from "./_components/client-server-off-gate";
import { setPageLocale, type LocalePageProps } from "@/i18n/set-page-locale";

export default async function HomePage({ params }: LocalePageProps) {
  setPageLocale((await params).locale);
  return (
    <ClientSiteNothingGate>
      <div className="block md:hidden">
        <ClientSidebar />
      </div>
      <div className="flex w-full flex-1 flex-col">
        <Header />
        <main className="flex-1 pb-4">
          <ClientServerOffGate model="news">
            <div className="max-w-7xl mx-auto">
              <Suspense fallback={<HomePageSkeleton />}>
                <HomeMainContent />
              </Suspense>
            </div>
          </ClientServerOffGate>
        </main>
        <Footer />
      </div>
    </ClientSiteNothingGate>
  );
}
