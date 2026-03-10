'use client'

import { Link } from '@/i18n/navigation'
import { usePathname } from '@/i18n/navigation'
import { cn } from '@/shared/common/lib/utils'
import {
  LayoutDashboard,
  Users,
  Newspaper,
  PlusCircle,
  Settings2,
} from 'lucide-react'

const navItems = [
  { href: '/dashboard', label: 'Bosh sahifa', icon: LayoutDashboard },
  { href: '/dashboard/news', label: 'Yangiliklar', icon: Newspaper },
  { href: '/dashboard/news/create', label: 'Yangi', icon: PlusCircle },
  { href: '/dashboard/users', label: 'Foydalanuvchilar', icon: Users },
  { href: '/dashboard/configs', label: 'Ma\'lumotlar', icon: Settings2 },
]

export function AdminNavMobile() {
  const pathname = usePathname()

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 md:hidden border-t border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80 safe-area-pb"
      style={{ paddingBottom: 'max(env(safe-area-inset-bottom), 0.5rem)' }}
    >
      <div className="flex items-center justify-around h-14 px-1">
        {navItems.map((item) => {
          const isActive =
            pathname === item.href || pathname.startsWith(item.href + '/')
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex flex-col items-center justify-center gap-0.5 min-w-[56px] py-2 rounded-md transition-colors',
                isActive
                  ? 'text-primary'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              <item.icon className="size-5 shrink-0" />
              <span className="text-[10px] font-medium truncate max-w-[64px]">
                {item.label}
              </span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
