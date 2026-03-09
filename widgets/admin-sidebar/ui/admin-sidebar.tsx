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
import {
  LayoutDashboard,
  FileText,
  FolderTree,
  Settings,
  Users,
  Newspaper,
  Tag,
} from 'lucide-react'

const navItems = [
  { href: '/dashboard', label: 'Boshqaruv paneli', icon: LayoutDashboard },
  { href: '/dashboard/news', label: 'Yangiliklar', icon: Newspaper },
  { href: '/dashboard/categories', label: 'Kategoriyalar', icon: FolderTree },
  { href: '/dashboard/tags', label: 'Teglar', icon: Tag },
  { href: '/dashboard/pages', label: 'Sahifalar', icon: FileText },
  { href: '/dashboard/users', label: 'Foydalanuvchilar', icon: Users },
]

const bottomItems = [
  { href: '/dashboard/settings', label: 'Sozlamalar', icon: Settings },
]

export default function AdminSidebar() {
  const pathname = usePathname()

  return (
    <Sidebar collapsible="icon" className="border-r border-border">
      <SidebarHeader className="border-b border-border min-w-0 overflow-hidden shrink-0">
        <div className="flex h-12 items-center gap-2 px-2 min-w-0">
          <span className="font-semibold text-lg truncate group-data-[state=collapsed]:hidden">
            Admin
          </span>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Asosiy</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navItems.map((item) => (
                <SidebarMenuItem key={item.href}>
                  <SidebarMenuButton asChild isActive={pathname === item.href || pathname.startsWith(item.href + '/')}>
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
              {bottomItems.map((item) => (
                <SidebarMenuItem key={item.href}>
                  <SidebarMenuButton asChild isActive={pathname === item.href || pathname.startsWith(item.href + '/')}>
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
        <div className="px-2 py-2 text-xs text-muted-foreground truncate group-data-[state=collapsed]:hidden">
          Admin panel v1.0
        </div>
      </SidebarFooter>
    </Sidebar>
  )
}
