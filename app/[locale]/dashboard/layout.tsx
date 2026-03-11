import { getServerSession } from 'next-auth'
import { getLocale } from 'next-intl/server'
import { redirect } from 'next/navigation'
import { SidebarProvider } from '@/shared/common/components/ui/sidebar'
import { AdminDashboardShell } from '@/widgets/admin-sidebar'
import { authOptions } from '@/shared/common/lib/auth-options'

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    const locale = await getLocale()
    redirect(`/${locale}/auth/login`)
  }

  return (
    <SidebarProvider>
      <AdminDashboardShell>{children}</AdminDashboardShell>
    </SidebarProvider>
  )
}