import type { LucideIcon } from 'lucide-react'
import {
  MonitorCog,
  Building2,
  ChartPie,
  WifiCog,
  FolderTree,
  Heart,
  LayoutDashboard,
  Ellipsis,
  Megaphone,
  MessageCircle,
  Newspaper,
  PlusCircle,
  Mail,
  Share2,
  BookOpen,
  Tag,
  UserRoundPen,
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
  UserRoundPen,
  MessageCircle,
  Heart,
  Megaphone,
  ChartPie,
  BookOpen,
  Building2,
  Share2,
  Mail,
  WifiCog,
  Ellipsis,
  PlusCircle,
  MonitorCog,
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
      { href: '/dashboard/comments', label: 'Izohlar', icon: MessageCircle },
      // { href: '/dashboard/contact-messages', label: 'Contact', icon: Send },
      { href: '/dashboard/settings', label: 'Kabinet', icon: UserRoundPen },
    ]
  }

  if (role === 'moderator') {
    return [
      { href: '/dashboard/categories', label: 'Kategoriya', icon: FolderTree },
      { href: '/dashboard/tags', label: 'Teglar', icon: Tag },
      { href: '/dashboard/news', label: 'Yangiliklar', icon: Newspaper },
      { href: '/dashboard/comments', label: 'Izohlar', icon: MessageCircle },
      { href: '/dashboard/contact-messages', label: 'Contact', icon: Mail },
      { href: '/dashboard/reactions', label: 'Reaksiya', icon: Heart },
    ]
  }

  if (role === 'ads_manager') {
    return [
      { href: '/dashboard/ads', label: 'Reklama', icon: Megaphone },
      { href: '/dashboard/ads/feedback', label: 'Fikrlar', icon: ChartPie },
    ]
  }

  return []
}
