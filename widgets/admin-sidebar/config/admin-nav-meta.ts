import type { NormalizedRole } from '@/shared/common/lib/rbac'

export type AdminNavIconKey =
  | 'LayoutDashboard'
  | 'Newspaper'
  | 'FolderTree'
  | 'Tag'
  | 'Users'
  | 'UserSquare'
  | 'UserRoundPen'
  | 'MessageCircle'
  | 'Heart'
  | 'Megaphone'
  | 'ChartPie'
  | 'BookOpen'
  | 'Building2'
  | 'Share2'
  | 'Mail'
  | 'WifiCog'
  | 'Ellipsis'
  | 'PlusCircle'
  | 'MonitorCog'
export type AdminMainNavMeta = {
  href: string
  label: string
  roles: NormalizedRole[]
  description?: string
  iconKey: AdminNavIconKey
  hideFromSidebar?: boolean
}

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
    href: '/dashboard/themes',
    label: 'Mavzular',
    roles: ['ceo', 'administrator', 'moderator'],
    iconKey: 'BookOpen',
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
    iconKey: 'MessageCircle',
  },
  {
    href: '/dashboard/contact-messages',
    label: 'Xabarlar',
    roles: ['ceo', 'administrator', 'moderator'],
    iconKey: 'Mail',
  },
  // {
  //   href: '/dashboard/reactions',
  //   label: 'Reaksiyalar',
  //   roles: ['ceo', 'administrator', 'moderator'],
  //   iconKey: 'Heart',
  // },
  {
    href: '/dashboard/users',
    label: 'Foydalanuvchilar',
    roles: ['ceo', 'administrator'],
    iconKey: 'Users',
  },
  {
    href: '/dashboard/authors',
    label: 'Mualliflar',
    roles: ['ceo', 'administrator', 'moderator'],
    iconKey: 'UserRoundPen',
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
    iconKey: 'ChartPie',
  },
  {
    href: '/dashboard/configs/site',
    label: 'Sayt sozlamalari',
    roles: ['ceo', 'administrator'],
    // description: 'Headline, sayt haqida, ijtimoiy tarmoqlar',
    iconKey: 'MonitorCog',
  },
  {
    href: '/dashboard/configs/delivery',
    label: "Ma'lumot uzatish",
    roles: ['ceo'],
    // description: 'Telegram va client uzatish — faqat CEO',
    iconKey: 'WifiCog',
  },
  {
    href: '/dashboard/settings',
    label: 'Boshqalar',
    roles: ['ceo', 'administrator'],
    // description: 'Boshqaruv ro‘yxati',
    iconKey: 'Ellipsis',
  },
]

export const ADMIN_MENU_HUB_ORDER: string[] = adminMainNavMeta.map((m) => m.href)

export function filterAdminNavMetaByRole<T extends { roles: NormalizedRole[] }>(
  items: readonly T[],
  role: NormalizedRole
): T[] {
  return items.filter((item) => item.roles.includes(role))
}
