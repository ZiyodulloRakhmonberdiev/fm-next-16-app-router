import { getServerSession } from "next-auth"
import { getLocale } from "next-intl/server"
import { redirect } from "next/navigation"
import { authOptions } from "@/shared/common/lib/auth-options"
import { Header } from "@/widgets/client-header"
import { Footer } from "@/widgets/client-footer"

export default async function UserLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    const locale = await getLocale()
    redirect(`/${locale}/auth/login`)
  }
  return (
    <div className="flex w-full flex-1 flex-col">
      <Header />
      <main className="flex-1 py-6 px-4 md:px-6">
        <div className="max-w-7xl mx-auto">{children}</div>
      </main>
      <Footer />
    </div>
  )
}
