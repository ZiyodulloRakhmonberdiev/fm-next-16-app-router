import type { LucideIcon } from 'lucide-react'
import {
  ClipboardList,
  FolderTree,
  KeyRound,
  LayoutDashboard,
  Megaphone,
  MessageSquare,
  Newspaper,
  PlusCircle,
  Settings,
  Tag,
  UserSquare,
  Users,
} from 'lucide-react'
import type { NormalizedRole } from '@/shared/common/lib/rbac'
import type { AdminNavIconKey } from './admin-nav-meta'
import { adminMainNavMeta, adminSystemNavMeta } from './admin-nav-meta'

const NAV_ICONS: Record<AdminNavIconKey, LucideIcon> = {
  LayoutDashboard,
  Newspaper,
  FolderTree,
  Tag,
  Users,
  UserSquare,
  MessageSquare,
  Megaphone,
  ClipboardList,
  KeyRound,
  Settings,
  PlusCircle,
}

/** Sozlamalar (Menu) sahifasidagi qatorlar uchun */
export const adminNavIcons: Record<AdminNavIconKey, LucideIcon> = NAV_ICONS

export type AdminNavItemConfig = {
  href: string
  label: string
  icon: LucideIcon
  roles: NormalizedRole[]
  description?: string
}

export const adminMainNavItems: AdminNavItemConfig[] = adminMainNavMeta.map((m) => ({
  href: m.href,
  label: m.label,
  roles: m.roles,
  description: m.description,
  icon: NAV_ICONS[m.iconKey],
}))

export const adminSystemNavItems: AdminNavItemConfig[] = adminSystemNavMeta.map((m) => ({
  href: m.href,
  label: m.label,
  roles: m.roles,
  description: m.description,
  icon: NAV_ICONS[m.iconKey],
}))

export function filterAdminNavByRole(items: AdminNavItemConfig[], role: NormalizedRole) {
  return items.filter((item) => item.roles.includes(role))
}

export type MobileBottomNavItem = {
  href: string
  label: string
  icon: LucideIcon
}

/** Pastki mobil tabbar: oxirgi element doim Menu. */
export function getMobileBottomNavItems(role: NormalizedRole): MobileBottomNavItem[] {
  const settings: MobileBottomNavItem = {
    href: '/dashboard/settings',
    label: 'Menu',
    icon: Settings,
  }

  if (role === 'ceo' || role === 'administrator') {
    return [
      { href: '/dashboard', label: 'Bosh sahifa', icon: LayoutDashboard },
      { href: '/dashboard/news', label: 'Yangiliklar', icon: Newspaper },
      { href: '/dashboard/news/create', label: 'Yangi', icon: PlusCircle },
      { href: '/dashboard/users', label: 'Foydalanuvchilar', icon: Users },
      settings,
    ]
  }

  if (role === 'moderator') {
    return [
      { href: '/dashboard/news', label: 'Yangiliklar', icon: Newspaper },
      { href: '/dashboard/news/create', label: 'Yangi', icon: PlusCircle },
      { href: '/dashboard/categories', label: 'Kategoriya', icon: FolderTree },
      { href: '/dashboard/tags', label: 'Teglar', icon: Tag },
      settings,
    ]
  }

  if (role === 'ads_manager') {
    return [
      { href: '/dashboard/ads', label: 'Reklama', icon: Megaphone },
      { href: '/dashboard/ads/feedback', label: 'Fikrlar', icon: ClipboardList },
      settings,
    ]
  }

  return [settings]
}
