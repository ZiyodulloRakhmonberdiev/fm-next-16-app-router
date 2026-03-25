'use client'

import { Link } from '@/i18n/navigation'
import { usePathname } from '@/i18n/navigation'
import { cn } from '@/shared/common/lib/utils'
import { useMemo } from 'react'
import { useSession } from 'next-auth/react'
import { normalizeRole } from '@/shared/common/lib/rbac'
import { getMobileBottomNavItems } from '../config/admin-nav-items'

export function AdminNavMobile() {
  const pathname = usePathname()
  const { data: session } = useSession()
  const role = normalizeRole(session?.user?.role)
  const visibleItems = useMemo(() => getMobileBottomNavItems(role), [role])

  if (visibleItems.length === 0) {
    return null
  }

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 md:hidden border-t border-border bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/80 safe-area-pb"
      style={{ paddingBottom: 'max(env(safe-area-inset-bottom), 0.5rem)' }}
    >
      <div className="flex h-14 items-center justify-around px-1">
        {visibleItems.map((item) => {
          const isActive =
            item.href === '/dashboard'
              ? pathname === '/dashboard'
              : item.href === '/dashboard/ads'
                ? pathname === '/dashboard/ads'
                : item.href === '/dashboard/settings'
                  ? pathname === '/dashboard/settings' ||
                    pathname?.startsWith('/dashboard/settings/')
                  : item.href === '/dashboard/reactions'
                    ? pathname === '/dashboard/reactions' ||
                      pathname?.startsWith('/dashboard/reactions/')
                    : pathname === item.href || pathname.startsWith(`${item.href}/`)
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex min-w-0 flex-1 flex-col items-center justify-center gap-0.5 rounded-md py-2 transition-colors',
                isActive ? 'text-primary' : 'text-muted-foreground hover:text-foreground'
              )}
            >
              <item.icon className="size-5 shrink-0" />
              <span className="max-w-[72px] truncate text-center text-[10px] font-medium">{item.label}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
