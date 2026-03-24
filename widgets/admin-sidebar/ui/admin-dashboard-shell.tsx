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
      <SidebarInset className="flex min-w-0 flex-1 flex-col overflow-x-hidden">
        <div className="flex min-w-0 flex-1 flex-col overflow-x-hidden bg-background z-20">
          <AdminHeader />
          <div className="mx-auto w-full max-w-[1240px] min-w-0 flex-1">
            <main className="min-w-0 px-3 py-3 pb-24 md:px-6 md:py-6 md:pb-6">
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
