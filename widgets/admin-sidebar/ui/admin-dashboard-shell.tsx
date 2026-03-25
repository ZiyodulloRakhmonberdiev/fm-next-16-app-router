'use client'

import { useIsMobile } from '@/shared/hooks/use-mobile'
import { SidebarInset } from '@/shared/common/components/ui/sidebar'
import AdminSidebar from './admin-sidebar'
import { AdminNavMobile } from './admin-nav-mobile'
import { AdminHeader } from '@/widgets/admin-header'
import { AdminFooter } from '@/widgets/admin-footer'

export function AdminDashboardShell({
  children,
}: {
  children: React.ReactNode
}) {
  const isMobile = useIsMobile()

  return (
    <>
      {!isMobile && <AdminSidebar />}
      <SidebarInset className="flex min-w-0 flex-1 flex-col overflow-x-hidden">
        <div className="flex min-w-0 flex-1 flex-col overflow-x-hidden bg-background z-20">
          <AdminHeader />
          <div className="mx-auto w-full min-w-0 flex-1">
            <main className="min-w-0 px-3 py-3 pb-24 md:px-6 md:py-6 md:pb-6">
              {children}
            </main>
            <div className="hidden md:block">
              <AdminFooter />
            </div>
          </div>
        </div>
      </SidebarInset>
      {isMobile && <AdminNavMobile />}
    </>
  )
}
