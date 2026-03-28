import type { LucideIcon } from 'lucide-react'
import {
  Building2,
  ClipboardList,
  CloudCog,
  FolderTree,
  Heart,
  LayoutDashboard,
  LayoutGrid,
  Megaphone,
  MessageSquare,
  Newspaper,
  PlusCircle,
  Send,
  Share2,
  Sparkles,
  Tag,
  UserCircle,
  UserSquare,
  Users,
} from 'lucide-react'
import type { NormalizedRole } from '@/shared/common/lib/rbac'
import type { AdminNavIconKey } from './admin-nav-meta'
import { adminMainNavMeta } from './admin-nav-meta'

const NAV_ICONS: Record<AdminNavIconKey, LucideIcon> = {
  LayoutDashboard,
  Newspaper,
  FolderTree,
  Tag,
  Users,
  UserSquare,
  MessageSquare,
  Heart,
  Megaphone,
  ClipboardList,
  Sparkles,
  Building2,
  Share2,
  Send,
  CloudCog,
  LayoutGrid,
  PlusCircle,
}

export const adminNavIcons: Record<AdminNavIconKey, LucideIcon> = NAV_ICONS

export type AdminNavItemConfig = {
  href: string
  label: string
  icon: LucideIcon
  roles: NormalizedRole[]
  description?: string
  hideFromSidebar?: boolean
}

export const adminMainNavItems: AdminNavItemConfig[] = adminMainNavMeta.map((m) => ({
  href: m.href,
  label: m.label,
  roles: m.roles,
  description: m.description,
  icon: NAV_ICONS[m.iconKey],
  hideFromSidebar: m.hideFromSidebar,
}))

export function filterAdminNavByRole(items: AdminNavItemConfig[], role: NormalizedRole) {
  return items.filter((item) => item.roles.includes(role))
}

export type MobileBottomNavItem = {
  href: string
  label: string
  icon: LucideIcon
}

export function getMobileBottomNavItems(role: NormalizedRole): MobileBottomNavItem[] {
  if (role === 'ceo' || role === 'administrator') {
    return [
      { href: '/dashboard', label: 'Bosh sahifa', icon: LayoutDashboard },
      { href: '/dashboard/news', label: 'Yangiliklar', icon: Newspaper },
      { href: '/dashboard/news/create', label: 'Yangi', icon: PlusCircle },
      { href: '/dashboard/comments', label: 'Izohlar', icon: MessageSquare },
      { href: '/dashboard/contact-messages', label: 'Contact', icon: Send },
      { href: '/dashboard/settings', label: 'Kabinet', icon: UserCircle },
    ]
  }

  if (role === 'moderator') {
    return [
      { href: '/dashboard/categories', label: 'Kategoriya', icon: FolderTree },
      { href: '/dashboard/tags', label: 'Teglar', icon: Tag },
      { href: '/dashboard/news', label: 'Yangiliklar', icon: Newspaper },
      { href: '/dashboard/comments', label: 'Izohlar', icon: MessageSquare },
      { href: '/dashboard/contact-messages', label: 'Contact', icon: Send },
      { href: '/dashboard/reactions', label: 'Reaksiya', icon: Heart },
    ]
  }

  if (role === 'ads_manager') {
    return [
      { href: '/dashboard/ads', label: 'Reklama', icon: Megaphone },
      { href: '/dashboard/ads/feedback', label: 'Fikrlar', icon: ClipboardList },
    ]
  }

  return []
}
