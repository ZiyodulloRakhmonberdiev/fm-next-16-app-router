import type { NormalizedRole } from '@/shared/common/lib/rbac'

export type AdminNavIconKey =
  | 'LayoutDashboard'
  | 'Newspaper'
  | 'FolderTree'
  | 'Tag'
  | 'Users'
  | 'UserSquare'
  | 'MessageSquare'
  | 'Heart'
  | 'Megaphone'
  | 'ClipboardList'
  | 'Sparkles'
  | 'Building2'
  | 'Share2'
  | 'Send'
  | 'CloudCog'
  | 'LayoutGrid'
  | 'PlusCircle'

export type AdminMainNavMeta = {
  href: string
  label: string
  roles: NormalizedRole[]
  description?: string
  iconKey: AdminNavIconKey
  /** Desktop sidebar da ko‘rinmasin (masalan Menu — header orqali). */
  hideFromSidebar?: boolean
}

/** Sidebar, Menu sahifasi — tartib saqlanadi. */
export const adminMainNavMeta: AdminMainNavMeta[] = [
  {
    href: '/dashboard',
    label: 'Boshqaruv paneli',
    roles: ['ceo', 'administrator'],
    // description: 'Umumiy ko‘rinish',
    iconKey: 'LayoutDashboard',
  },
  {
    href: '/dashboard/news',
    label: 'Yangiliklar',
    roles: ['ceo', 'administrator', 'moderator'],
    // description: 'Ro‘yxat va tahrirlash',
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
    href: '/dashboard/comments',
    label: 'Izohlar',
    roles: ['ceo', 'administrator', 'moderator'],
    iconKey: 'MessageSquare',
  },
  {
    href: '/dashboard/contact-messages',
    label: 'Xabarlar',
    roles: ['ceo', 'administrator', 'moderator'],
    iconKey: 'Send',
  },
  {
    href: '/dashboard/reactions',
    label: 'Reaksiyalar',
    roles: ['ceo', 'administrator', 'moderator'],
    iconKey: 'Heart',
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
    href: '/dashboard/ads',
    label: 'Reklama',
    roles: ['ceo', 'administrator', 'ads_manager'],
    iconKey: 'Megaphone',
  },
  {
    href: '/dashboard/ads/feedback',
    label: 'Reklama statistikasi',
    roles: ['ceo', 'administrator', 'ads_manager'],
    iconKey: 'ClipboardList',
  },
  {
    href: '/dashboard/configs/site',
    label: 'Sayt sozlamalari',
    roles: ['ceo', 'administrator'],
    // description: 'Headline, sayt haqida, ijtimoiy tarmoqlar',
    iconKey: 'Building2',
  },
  {
    href: '/dashboard/configs/delivery',
    label: "Ma'lumot uzatish",
    roles: ['ceo'],
    // description: 'Telegram va client uzatish — faqat CEO',
    iconKey: 'CloudCog',
  },
  {
    href: '/dashboard/settings',
    label: 'Sozlamalar',
    roles: ['ceo', 'administrator'],
    // description: 'Boshqaruv ro‘yxati',
    iconKey: 'LayoutGrid',
  },
]

export const ADMIN_MENU_HUB_ORDER: string[] = adminMainNavMeta.map((m) => m.href)

export function filterAdminNavMetaByRole<T extends { roles: NormalizedRole[] }>(
  items: readonly T[],
  role: NormalizedRole
): T[] {
  return items.filter((item) => item.roles.includes(role))
}
