'use client'

import { Link } from '@/i18n/navigation'
import { usePathname } from '@/i18n/navigation'
import { useMemo } from 'react'
import { ChevronRight } from 'lucide-react'
import { ThemeSwitcher } from '@/widgets/theme-switcher'
import { useSession } from 'next-auth/react'
import { normalizeRole } from '@/shared/common/lib/rbac'
import { ADMIN_MENU_HUB_ORDER, adminMainNavMeta } from '@/widgets/admin-sidebar/config/admin-nav-meta'
import { adminNavIcons } from '@/widgets/admin-sidebar/config/admin-nav-items'
import { cn } from '@/shared/common/lib/utils'
import { ThemeSwitcherForHeader } from '@/widgets/theme-switcher'

function sortMenuItemsByHubOrder<T extends { href: string }>(items: T[]): T[] {
  const idx = (href: string) => {
    const i = ADMIN_MENU_HUB_ORDER.indexOf(href)
    return i === -1 ? 999 : i
  }
  return [...items].sort((a, b) => idx(a.href) - idx(b.href) || a.href.localeCompare(b.href))
}

export function DashboardUserSettingsPage() {
  const pathname = usePathname()
  const { data: session } = useSession()
  const role = normalizeRole(session?.user?.role)

  const links = useMemo(() => {
    const filtered = adminMainNavMeta.filter((m) => m.roles.includes(role))
    return sortMenuItemsByHubOrder(filtered)
  }, [role])

  const linkActive = (href: string) => {
    if (href === '/dashboard') return pathname === '/dashboard'
    if (href === '/dashboard/ads') return pathname === '/dashboard/ads'
    if (href.startsWith('/dashboard/configs')) {
      return pathname === href || pathname.startsWith(`${href}/`)
    }
    if (href === '/dashboard/settings') {
      return pathname === '/dashboard/settings' || pathname.startsWith('/dashboard/settings/')
    }
    return pathname === href || pathname.startsWith(`${href}/`)
  }

  return (
    <div className="mx-auto w-full max-w-md pb-8 pt-1">
      <section className="mb-6 rounded-2xl border border-border/80 bg-card/50 p-4 shadow-sm">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-sm font-medium">Mavzu</p>
          </div>
          <ThemeSwitcherForHeader />
        </div>
      </section>

      <nav aria-label="Boshqaruv menyusi">
        <ul className="divide-y divide-border/80 overflow-hidden rounded-2xl border border-border/80 bg-card shadow-sm">
          {links.map((item) => {
            const active = linkActive(item.href)
            const Icon = adminNavIcons[item.iconKey]
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={cn(
                    'flex items-center gap-3 px-4 py-3.5 transition-colors hover:bg-muted/50 active:bg-muted/70',
                    active && 'bg-muted/40'
                  )}
                >
                  <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-muted/60 text-muted-foreground">
                    <Icon className="size-[18px]" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-sm font-medium leading-snug">{item.label}</span>
                    {item.description ? (
                      <span className="mt-0.5 block text-xs text-muted-foreground leading-snug">
                        {item.description}
                      </span>
                    ) : null}
                  </span>
                  <ChevronRight className="size-4 shrink-0 text-muted-foreground/70" aria-hidden />
                </Link>
              </li>
            )
          })}
        </ul>
      </nav>
    </div>
  )
}
