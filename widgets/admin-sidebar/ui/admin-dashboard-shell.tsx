'use client'

import { usePathname } from '@/i18n/navigation'
import { useRouter } from '@/i18n/navigation'
import { Button } from '@/shared/common/components/ui/button'
import { useIsMobile } from '@/shared/hooks/use-mobile'
import { SidebarInset } from '@/shared/common/components/ui/sidebar'
import AdminSidebar from './admin-sidebar'
import { AdminNavMobile } from './admin-nav-mobile'
import { AdminHeader } from '@/widgets/admin-header'
import { AdminFooter } from '@/widgets/admin-footer'
import { ArrowLeft } from 'lucide-react'

export function AdminDashboardShell({
  children,
}: {
  children: React.ReactNode
}) {
  const isMobile = useIsMobile()
  const router = useRouter()
  const pathname = usePathname()
  const isMainDashboard = pathname === '/dashboard' || pathname?.endsWith('/dashboard')

  return (
    <>
      {!isMobile && <AdminSidebar />}
      <SidebarInset className="overflow-x-hidden">
        <div className="w-full z-20 bg-background flex flex-col flex-1 min-h-0 min-w-0 overflow-x-hidden">
          <AdminHeader />
          <div className="mx-auto w-full max-w-[1240px] flex flex-1 flex-col min-h-[calc(100vh-3.5rem)] min-w-0 overflow-x-hidden">
            <main className="flex-1 p-4 md:p-6 pb-20 md:pb-6 min-w-0 overflow-x-hidden">
              {!isMainDashboard && (
                <div className="mb-3">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="gap-2"
                    onClick={() => router.back()}
                  >
                    <ArrowLeft className="size-4" />
                    Back
                  </Button>
                </div>
              )}
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
