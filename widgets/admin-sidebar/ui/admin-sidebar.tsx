'use client'

import { Link } from '@/i18n/navigation'
import { usePathname } from '@/i18n/navigation'
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/shared/common/components/ui/sidebar'
import { useTheme } from 'next-themes'
import Image from 'next/image'
import { useEffect, useMemo, useState } from 'react'
import { useSession } from 'next-auth/react'
import { normalizeRole } from '@/shared/common/lib/rbac'
import { adminMainNavItems, filterAdminNavByRole } from '../config/admin-nav-items'
import { useIsMobile } from '@/shared/hooks/use-mobile'

export default function AdminSidebar() {
  const pathname = usePathname()
  const { data: session } = useSession()
  const { resolvedTheme } = useTheme()
  const isMobile = useIsMobile()
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])
  const role = normalizeRole(session?.user?.role)
  const visibleNavItems = useMemo(
    () =>
      filterAdminNavByRole(adminMainNavItems, role)
        .filter((item) => !item.hideFromSidebar)
        .filter((item) => {
          // Settings sahifasida mobile’da pastdagi/oxirgi "Sozlamalar" linkni ko‘rsatmaymiz.
          if (!isMobile) return true
          if (!pathname.startsWith('/dashboard/settings')) return true
          return item.href !== '/dashboard/settings'
        }),
    [role, pathname, isMobile]
  )

  const logoSrc =
    mounted && resolvedTheme === 'light' ? '/images/fm-logo-dark.svg' : '/images/fm-logo.svg'

  const isItemActive = (href: string) => {
    if (href === '/dashboard') {
      return pathname === '/dashboard'
    }
    if (href === '/dashboard/ads') {
      return pathname === '/dashboard/ads'
    }
    if (href.startsWith('/dashboard/configs')) {
      return pathname === href || pathname.startsWith(`${href}/`)
    }
    if (href === '/dashboard/settings') {
      return pathname === '/dashboard/settings' || pathname.startsWith('/dashboard/settings/')
    }
    return pathname === href || pathname.startsWith(`${href}/`)
  }

  return (
    <Sidebar
      collapsible="icon"
      className="border-r border-border bg-background/70 backdrop-blur supports-backdrop-filter:bg-background/60"
    >
      <SidebarHeader className="border-b border-border bg-background/60 backdrop-blur supports-backdrop-filter:bg-background/50">
        <div className="flex h-12 items-center gap-2 px-2">
          <span className="font-semibold text-lg truncate group-data-[state=collapsed]:hidden">
            <Link href="/dashboard" className="hidden md:flex items-center gap-2 shrink-0">
              <Image
                src={mounted ? logoSrc : '/images/fm-logo-dark.svg'}
                alt="Fergana Media"
                width={120}
                height={32}
                className="h-7 w-auto object-contain"
                priority
              />
            </Link>
          </span>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup className="px-1">
          <SidebarGroupContent>
            <SidebarMenu>
              {visibleNavItems.map((item) => (
                <SidebarMenuItem key={item.href}>
                  <SidebarMenuButton asChild isActive={isItemActive(item.href)} tooltip={item.label}>
                    <Link href={item.href}>
                      <item.icon className="size-4" />
                      <span>{item.label}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  )
}
