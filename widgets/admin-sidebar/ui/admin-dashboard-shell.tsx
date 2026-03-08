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
      <SidebarInset>
        <div className="w-full max-w-[1240px] z-20 bg-background mx-auto flex flex-col flex-1 min-h-0 min-w-0">
          <AdminHeader />
          <div className="flex flex-1 flex-col min-h-[calc(100vh-3.5rem)] min-w-0">
            <main className="flex-1 p-4 md:p-6 pb-20 md:pb-6 min-w-0">
              {children}
            </main>
            <AdminFooter />
          </div>
        </div>
      </SidebarInset>
      {isMobile && <AdminNavMobile />}
    </>
  )
}
