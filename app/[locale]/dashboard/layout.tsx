import { SidebarProvider } from '@/shared/common/components/ui/sidebar'
import { AdminDashboardShell } from '@/widgets/admin-sidebar'

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <AdminDashboardShell>{children}</AdminDashboardShell>
    </SidebarProvider>
  )
}