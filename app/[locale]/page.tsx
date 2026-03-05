import { SidebarProvider, SidebarTrigger } from "@/shared/common/components/ui/sidebar";
import { Footer } from "@/widgets/footer";
import { Header } from "@/widgets/header";
import ClientSidebar from "@/widgets/sidebar/ui/client-sidebar";
import Image from "next/image";

export default function HomePage() {
  return (
    <SidebarProvider>
      <ClientSidebar />
      <div className="flex w-full flex-1 flex-col">
        <Header />
        <main className="flex-1 py-4 px-4 md:px-6">
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="bg-muted/80 p-2 md:p-4 rounded-lg border border-border">
                <Image src="/images/logo.png" alt="News 1" width={100} height={100} />
                <h2 className="text-2xl font-bold">News 1</h2>
                <p className="text-sm text-foreground/80">Lorem ipsum dolor sit amet consectetur adipisicing elit. Quisquam, quos.</p>
              </div>
              <div className="bg-muted/80 p-2 md:p-4 rounded-lg border border-border">
                <Image src="/images/logo.png" alt="News 1" width={100} height={100} />
                <h2 className="text-2xl font-bold">News 1</h2>
                <p className="text-sm text-foreground/80">Lorem ipsum dolor sit amet consectetur adipisicing elit. Quisquam, quos.</p>
              </div>
              <div className="bg-muted/80 p-2 md:p-4 rounded-lg border border-border">
                <Image src="/images/logo.png" alt="News 1" width={100} height={100} />
                <h2 className="text-2xl font-bold">News 1</h2>
                <p className="text-sm text-foreground/80">Lorem ipsum dolor sit amet consectetur adipisicing elit. Quisquam, quos.</p>
              </div>
              <div className="bg-muted/80 p-2 md:p-4 rounded-lg border border-border">
                <Image src="/images/logo.png" alt="News 1" width={100} height={100} />
                <h2 className="text-2xl font-bold">News 1</h2>
                <p className="text-sm text-foreground/80">Lorem ipsum dolor sit amet consectetur adipisicing elit. Quisquam, quos.</p>
              </div>
              <div className="bg-muted/80 p-2 md:p-4 rounded-lg border border-border">
                <Image src="/images/logo.png" alt="News 1" width={100} height={100} />
                <h2 className="text-2xl font-bold">News 1</h2>
                <p className="text-sm text-foreground/80">Lorem ipsum dolor sit amet consectetur adipisicing elit. Quisquam, quos.</p>
              </div>
              <div className="bg-muted/80 p-4 rounded-lg border border-border">
                <Image src="/images/logo.png" alt="News 1" width={100} height={100} />
                <h2 className="text-2xl font-bold">News 1</h2>
                <p className="text-sm text-foreground/80">Lorem ipsum dolor sit amet consectetur adipisicing elit. Quisquam, quos.</p>
              </div>
              <div className="bg-muted/80 p-2 md:p-4 rounded-lg border border-border">
                <Image src="/images/logo.png" alt="News 1" width={100} height={100} />
                <h2 className="text-2xl font-bold">News 1</h2>
                <p className="text-sm text-foreground/80">Lorem ipsum dolor sit amet consectetur adipisicing elit. Quisquam, quos.</p>
              </div>
              <div className="bg-muted/80 p-2 md:p-4 rounded-lg border border-border">
                <Image src="/images/logo.png" alt="News 1" width={100} height={100} />
                <h2 className="text-2xl font-bold">News 1</h2>
                <p className="text-sm text-foreground/80">Lorem ipsum dolor sit amet consectetur adipisicing elit. Quisquam, quos.</p>
              </div>
              <div className="bg-muted/80 p-4 rounded-lg border border-border">
                <Image src="/images/logo.png" alt="News 1" width={100} height={100} />
                <h2 className="text-2xl font-bold">News 1</h2>
                <p className="text-sm text-foreground/80">Lorem ipsum dolor sit amet consectetur adipisicing elit. Quisquam, quos.</p>
              </div>
              <div className="bg-muted/80 p-2 md:p-4 rounded-lg border border-border">
                <Image src="/images/logo.png" alt="News 1" width={100} height={100} />
                <h2 className="text-2xl font-bold">News 1</h2>
                <p className="text-sm text-foreground/80">Lorem ipsum dolor sit amet consectetur adipisicing elit. Quisquam, quos.</p>
              </div>
              <div className="bg-muted/80 p-2 md:p-4 rounded-lg border border-border">
                <Image src="/images/logo.png" alt="News 1" width={100} height={100} />
                <h2 className="text-2xl font-bold">News 1</h2>
                <p className="text-sm text-foreground/80">Lorem ipsum dolor sit amet consectetur adipisicing elit. Quisquam, quos.</p>
              </div>
              <div className="bg-muted/80 p-4 rounded-lg border border-border">
                <Image src="/images/logo.png" alt="News 1" width={100} height={100} />
                <h2 className="text-2xl font-bold">News 1</h2>
                <p className="text-sm text-foreground/80">Lorem ipsum dolor sit amet consectetur adipisicing elit. Quisquam, quos.</p>
              </div>
              <div className="bg-muted/80 p-2 md:p-4 rounded-lg border border-border">
                <Image src="/images/logo.png" alt="News 1" width={100} height={100} />
                <h2 className="text-2xl font-bold">News 1</h2>
                <p className="text-sm text-foreground/80">Lorem ipsum dolor sit amet consectetur adipisicing elit. Quisquam, quos.</p>
              </div>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    </SidebarProvider>
  );
}