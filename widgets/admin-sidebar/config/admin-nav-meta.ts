import type { NormalizedRole } from '@/shared/common/lib/rbac'

export type AdminNavIconKey =
  | 'LayoutDashboard'
  | 'Newspaper'
  | 'FolderTree'
  | 'Tag'
  | 'Users'
  | 'UserSquare'
  | 'MessageSquare'
  | 'Megaphone'
  | 'ClipboardList'
  | 'KeyRound'
  | 'Settings'
  | 'PlusCircle'

export type AdminMainNavMeta = {
  href: string
  label: string
  roles: NormalizedRole[]
  description?: string
  iconKey: AdminNavIconKey
}

export const adminMainNavMeta: AdminMainNavMeta[] = [
  {
    href: '/dashboard',
    label: 'Boshqaruv paneli',
    roles: ['ceo', 'administrator'],
    description: 'Umumiy ko‘rinish',
    iconKey: 'LayoutDashboard',
  },
  {
    href: '/dashboard/news',
    label: 'Yangiliklar',
    roles: ['ceo', 'administrator', 'moderator'],
    description: 'Ro‘yxat va tahrirlash',
    iconKey: 'Newspaper',
  },
  {
    href: '/dashboard/categories',
    label: 'Kategoriyalar',
    roles: ['ceo', 'administrator', 'moderator'],
    iconKey: 'FolderTree',
  },
  {
    href: '/dashboard/tags',
    label: 'Teglar',
    roles: ['ceo', 'administrator', 'moderator'],
    iconKey: 'Tag',
  },
  {
    href: '/dashboard/users',
    label: 'Foydalanuvchilar',
    roles: ['ceo', 'administrator'],
    iconKey: 'Users',
  },
  {
    href: '/dashboard/team',
    label: 'Jamoa',
    roles: ['ceo', 'administrator'],
    iconKey: 'UserSquare',
  },
  {
    href: '/dashboard/comments',
    label: 'Izohlar',
    roles: ['ceo', 'administrator', 'moderator'],
    iconKey: 'MessageSquare',
  },
  {
    href: '/dashboard/ads',
    label: 'Reklama',
    roles: ['ceo', 'administrator', 'ads_manager'],
    iconKey: 'Megaphone',
  },
  {
    href: '/dashboard/ads/feedback',
    label: 'Reklama fikrlari',
    roles: ['ceo', 'administrator', 'ads_manager'],
    iconKey: 'ClipboardList',
  },
  {
    href: '/dashboard/configs',
    label: 'Maxfiylik',
    roles: ['ceo', 'administrator'],
    description: 'Cookie va maxfiylik matnlari',
    iconKey: 'KeyRound',
  },
]

export type AdminSystemNavMeta = {
  href: string
  label: string
  roles: NormalizedRole[]
  description?: string
  iconKey: AdminNavIconKey
}

export const adminSystemNavMeta: AdminSystemNavMeta[] = [
  {
    href: '/dashboard/settings',
    label: 'Menu',
    roles: ['ceo', 'administrator', 'moderator', 'ads_manager'],
    description: 'Bo‘limlar va navigatsiya',
    iconKey: 'Settings',
  },
]

export function filterAdminNavMetaByRole<T extends { roles: NormalizedRole[] }>(
  items: readonly T[],
  role: NormalizedRole
): T[] {
  return items.filter((item) => item.roles.includes(role))
}
