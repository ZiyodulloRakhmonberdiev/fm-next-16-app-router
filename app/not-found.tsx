import { Footer } from "@/widgets/client-footer"
import ClientSiteNothingGate from "./[locale]/_components/client-site-nothing-gate"
import { ClientSidebar } from "@/widgets/client-sidebar"
import { Header } from "@/widgets/client-header"
import Link from "next/link"
import { Button } from "@/shared/common/components/ui/button"

export default async function NotFound() {
  return (
    <ClientSiteNothingGate>
      <div className="block md:hidden">
        {/* <ClientSidebar /> */}
      </div>
      <div className="flex w-full flex-1 flex-col">
        <main className="flex-1 px-4 md:px-6 py-10 md:py-16">
          <div className="mx-auto flex min-h-[60vh] max-w-5xl items-center justify-center">
            <div className="relative w-full overflow-hidden rounded-2xl border border-border/60 to-muted/40 px-6 py-10 md:px-10 md:py-14 shadow-sm">
              <div className="pointer-events-none absolute inset-0  opacity-60" />
              <div className="relative flex flex-col items-center text-center gap-4 md:gap-6">
                <p className="text-xs uppercase tracking-[0.25em] text-primary/70">
                 Page not found
                </p>
                <h1 className="text-4xl sm:text-5xl md:text-6xl font-semibold tracking-tight">
                  404
                </h1>
                <p className="max-w-xl text-sm md:text-base text-muted-foreground">
                  The page or news you are looking for does not exist.
                </p>
                <div className="mt-2 flex flex-wrap items-center justify-center gap-3">
                  <Link href="/">
                    <Button size="sm" className="px-5">
                      Go back to the home page
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </main>
        {/* <Footer /> */}
      </div>
    </ClientSiteNothingGate>
  )
}