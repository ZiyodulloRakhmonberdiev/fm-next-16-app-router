'use client'

import { Link } from '@/i18n/navigation'
import { usePathname } from '@/i18n/navigation'
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarSeparator,
} from '@/shared/common/components/ui/sidebar'
import { LogOut } from 'lucide-react'
import { useTheme } from 'next-themes'
import Image from 'next/image'
import { useEffect, useMemo, useState } from 'react'
import { signOut, useSession } from 'next-auth/react'
import { normalizeRole } from '@/shared/common/lib/rbac'
import { Button } from '@/shared/common/components/ui/button'
import {
  adminMainNavItems,
  adminSystemNavItems,
  filterAdminNavByRole,
} from '../config/admin-nav-items'

export default function AdminSidebar() {
  const pathname = usePathname()
  const { data: session } = useSession()
  const { resolvedTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])
  const role = normalizeRole(session?.user?.role)
  const visibleNavItems = useMemo(() => filterAdminNavByRole(adminMainNavItems, role), [role])
  const visibleBottomItems = useMemo(() => filterAdminNavByRole(adminSystemNavItems, role), [role])

  const logoSrc =
    mounted && resolvedTheme === 'light' ? '/images/fm-logo-dark.svg' : '/images/fm-logo.svg'

  const isItemActive = (href: string) => {
    if (href === '/dashboard') {
      return pathname === '/dashboard'
    }
    if (href === '/dashboard/ads') {
      return pathname === '/dashboard/ads'
    }
    return pathname === href || pathname.startsWith(`${href}/`)
  }

  return (
    <Sidebar collapsible="icon" className="border-r border-border">
      <SidebarHeader className="border-b border-border">
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
        <SidebarGroup>
          <SidebarGroupLabel>Asosiy</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {visibleNavItems.map((item) => (
                <SidebarMenuItem key={item.href}>
                  <SidebarMenuButton asChild isActive={isItemActive(item.href)}>
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
        <SidebarSeparator />
        <SidebarGroup>
          <SidebarGroupLabel>Tizim</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {visibleBottomItems.map((item) => (
                <SidebarMenuItem key={item.href}>
                  <SidebarMenuButton asChild isActive={isItemActive(item.href)}>
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
      <SidebarFooter className="border-t border-border min-w-0 overflow-hidden shrink-0">
        <div className="px-2 py-2 space-y-2">
          <Button
            variant="outline"
            size="sm"
            className="w-full gap-2 justify-start group-data-[state=collapsed]:justify-center"
            onClick={() => void signOut({ callbackUrl: '/auth/login' })}
          >
            <LogOut className="size-4" />
            <span className="group-data-[state=collapsed]:hidden">Chiqish</span>
          </Button>
          <div className="text-xs text-muted-foreground truncate group-data-[state=collapsed]:hidden">
            Admin panel v1.0
          </div>
        </div>
      </SidebarFooter>
    </Sidebar>
  )
}
