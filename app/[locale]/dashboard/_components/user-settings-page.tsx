'use client'

import { Link } from '@/i18n/navigation'
import { usePathname } from '@/i18n/navigation'
import { ThemeSwitcher } from '@/widgets/theme-switcher'
import { useSession } from 'next-auth/react'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/shared/common/components/ui/card'
import { normalizeRole } from '@/shared/common/lib/rbac'
import type { AdminMainNavMeta } from '@/widgets/admin-sidebar/config/admin-nav-meta'
import { adminMainNavMeta } from '@/widgets/admin-sidebar/config/admin-nav-meta'
import { adminNavIcons } from '@/widgets/admin-sidebar/config/admin-nav-items'
import { cn } from '@/shared/common/lib/utils'

const SETTINGS_HUB_GROUPS: { title: string; hrefs: readonly string[] }[] = [
  {
    title: 'Yangiliklar, kategoriyalar va teglar',
    hrefs: ['/dashboard/news', '/dashboard/categories', '/dashboard/tags'],
  },
  {
    title: 'Foydalanuvchilar va jamoa',
    hrefs: ['/dashboard/users', '/dashboard/team'],
  },
  {
    title: 'Izohlar',
    hrefs: ['/dashboard/comments'],
  },
  {
    title: 'Reklamalar',
    hrefs: ['/dashboard/ads', '/dashboard/ads/feedback'],
  },
]

function visibleItemsForGroup(
  hrefs: readonly string[],
  role: ReturnType<typeof normalizeRole>
): AdminMainNavMeta[] {
  const out: AdminMainNavMeta[] = []
  for (const href of hrefs) {
    const meta = adminMainNavMeta.find((m) => m.href === href)
    if (meta && meta.roles.includes(role)) out.push(meta)
  }
  return out
}

function SettingsSectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="mb-2 px-1 text-xs font-medium uppercase tracking-wide text-muted-foreground">{children}</p>
  )
}

export function DashboardUserSettingsPage() {
  const pathname = usePathname()
  const { data: session } = useSession()
  const role = normalizeRole(session?.user?.role)

  const privacyMeta = adminMainNavMeta.find((m) => m.href === '/dashboard/configs')
  const showPrivacy = privacyMeta && privacyMeta.roles.includes(role)
  const PrivacyIcon = privacyMeta ? adminNavIcons[privacyMeta.iconKey] : null

  const linkActive = (href: string) => {
    if (href === '/dashboard') return pathname === '/dashboard'
    if (href === '/dashboard/ads') return pathname === '/dashboard/ads'
    return pathname === href || pathname.startsWith(`${href}/`)
  }

  return (
    <div className="mx-auto w-full max-w-lg space-y-6 pb-4 md:max-w-xl md:space-y-8">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Ilova</CardTitle>
          <CardDescription>Yorug‘ yoki qorong‘i mavzu.</CardDescription>
        </CardHeader>
        <CardContent className="flex items-center gap-4 pt-0">
          <ThemeSwitcher />
        </CardContent>
      </Card>

      <div>
        <h1 className="text-xl font-semibold tracking-tight md:text-2xl">Menu</h1>
        <p className="mt-1 text-sm text-muted-foreground">Boshqaruv bo‘limlari — rolingizga mos ko‘rinadi.</p>
      </div>

      {showPrivacy && privacyMeta && PrivacyIcon ? (
        <div>
          <SettingsSectionLabel>Maxfiylik</SettingsSectionLabel>
          <div className="overflow-hidden rounded-xl border bg-card shadow-sm">
            <Link
              href={privacyMeta.href}
              className={cn(
                'flex items-center gap-3 px-4 py-3.5 transition-colors hover:bg-muted/60 active:bg-muted/80',
                linkActive(privacyMeta.href) && 'bg-muted/40'
              )}
            >
              <div className="min-w-0 flex-1">
                <div className="font-medium leading-tight">{privacyMeta.label}</div>
                {privacyMeta.description ? (
                  <div className="mt-0.5 text-xs text-muted-foreground">{privacyMeta.description}</div>
                ) : null}
              </div>
              <PrivacyIcon className="size-5 shrink-0 text-muted-foreground" />
            </Link>
          </div>
        </div>
      ) : null}

      {SETTINGS_HUB_GROUPS.map((group) => {
        const items = visibleItemsForGroup(group.hrefs, role)
        if (items.length === 0) return null
        return (
          <div key={group.title}>
            <SettingsSectionLabel>{group.title}</SettingsSectionLabel>
            <div className="overflow-hidden rounded-xl border bg-card shadow-sm">
              {items.map((item) => {
                const active = linkActive(item.href)
                const RowIcon = adminNavIcons[item.iconKey]
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      'flex items-center gap-3 border-b border-border px-4 py-3.5 transition-colors last:border-b-0 hover:bg-muted/60 active:bg-muted/80',
                      active && 'bg-muted/40'
                    )}
                  >
                    <div className="min-w-0 flex-1">
                      <div className="font-medium leading-tight">{item.label}</div>
                      {item.description ? (
                        <div className="mt-0.5 text-xs text-muted-foreground">{item.description}</div>
                      ) : null}
                    </div>
                    <RowIcon className="size-5 shrink-0 text-muted-foreground" />
                  </Link>
                )
              })}
            </div>
          </div>
        )
      })}
    </div>
  )
}
