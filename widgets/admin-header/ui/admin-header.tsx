'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { Link } from '@/i18n/navigation'
import { useLocale } from 'next-intl'
import Image from 'next/image'
import { SidebarTrigger } from '@/shared/common/components/ui/sidebar'
import { Button } from '@/shared/common/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/shared/common/components/ui/dropdown-menu'
import { Bell, LogOut, Search, User, ExternalLink, Settings } from 'lucide-react'
import type { NewsItem } from '@/features/news/model'
import { useTheme } from 'next-themes'
import { signOut } from 'next-auth/react'

const DEBOUNCE_MS = 200

const MOCK_USER = {
  full_name: 'Admin Foydalanuvchi',
  role: 'Administrator',
  image: null as string | null,
}

export default function AdminHeader() {
  const locale = useLocale()
  const [searchQuery, setSearchQuery] = useState('')
  const [results, setResults] = useState<NewsItem[]>([])
  const [isOpen, setIsOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const wrapperRef = useRef<HTMLDivElement>(null)

  const { resolvedTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])

  const logoSrc =
    mounted && resolvedTheme === 'light'
      ? '/images/fm-logo-dark.svg'
      : '/images/fm-logo.svg'

  useEffect(() => {
    if (!searchQuery.trim()) {
      setResults([])
      setIsOpen(false)
      return
    }
    const t = setTimeout(async () => {
      setLoading(true)
      try {
        const res = await fetch(
          `/api/dashboard/search?q=${encodeURIComponent(searchQuery)}&locale=${locale}`
        )
        const data = await res.json()
        setResults(data.results ?? [])
        setIsOpen(true)
      } catch {
        setResults([])
      } finally {
        setLoading(false)
      }
    }, DEBOUNCE_MS)
    return () => clearTimeout(t)
  }, [searchQuery, locale])

  const handleClickOutside = useCallback((e: MouseEvent) => {
    if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
      setIsOpen(false)
    }
  }, [])

  useEffect(() => {
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [handleClickOutside])

  return (
    <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b border-border bg-background px-4 md:px-6">
      <SidebarTrigger className="-ml-1 hidden md:flex" />
      <Link href="/dashboard" className="flex md:hidden items-center gap-2 shrink-0">
        <Image
          src={mounted ? logoSrc : '/images/fm-logo-dark.svg'}
          alt="Fergana Media"
          width={120}
          height={32}
          className="h-7 w-auto object-contain"
          priority
        />
      </Link>
      <div className="flex flex-1 items-center gap-4">
        <div className="hidden md:block flex-1 max-w-md relative" ref={wrapperRef}>
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="search"
              placeholder="Sarlavha yoki tavsif bo‘yicha qidirish..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => searchQuery.trim() && results.length > 0 && setIsOpen(true)}
              className="w-full rounded-md border border-input bg-background py-2 pl-8 pr-3 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            />
          </div>
          {isOpen && searchQuery.trim() && (
            <div className="absolute top-full left-0 right-0 mt-1 rounded-md border border-border bg-popover text-popover-foreground shadow-md z-50 max-h-[280px] overflow-auto">
              {loading ? (
                <div className="py-4 px-3 text-sm text-muted-foreground">Qidirilmoqda...</div>
              ) : results.length === 0 ? (
                <div className="py-4 px-3 text-sm text-muted-foreground">
                  Hech narsa topilmadi
                </div>
              ) : (
                <ul className="py-1">
                  {results.map((item) => (
                    <li key={item.slug}>
                      <Link
                        href={`/dashboard/news/${item.slug}/edit`}
                        className="block px-3 py-2 text-sm hover:bg-accent hover:text-accent-foreground truncate"
                        onClick={() => {
                          setIsOpen(false)
                          setSearchQuery('')
                        }}
                      >
                        {item.title}
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}
        </div>
      </div>
      <div className="flex items-center gap-2">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="rounded-full">
              {MOCK_USER.image ? (
                <Image
                  src={MOCK_USER.image}
                  alt={MOCK_USER.full_name}
                  width={32}
                  height={32}
                  className="rounded-full size-8 object-cover"
                />
              ) : (
                <span className="flex size-8 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <User className="size-4" />
                </span>
              )}
              <span className="sr-only">Foydalanuvchi menyu</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <div className="flex items-center gap-3 px-2 py-2">
              {MOCK_USER.image ? (
                <Image
                  src={MOCK_USER.image}
                  alt={MOCK_USER.full_name}
                  width={40}
                  height={40}
                  className="rounded-full size-10 object-cover"
                />
              ) : (
                <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <User className="size-5" />
                </span>
              )}
              <div className="flex flex-col min-w-0">
                <p className="text-sm font-medium truncate">{MOCK_USER.full_name}</p>
                <p className="text-xs text-muted-foreground">{MOCK_USER.role}</p>
              </div>
            </div>
            <DropdownMenuSeparator />
            <DropdownMenuItem className='my-2 w-full justify-start' asChild>
              <Button variant="outline">
                <Link href="/uz" className="flex items-center gap-2 cursor-pointer">
                  <ExternalLink className="size-4" />
                  Saytga qaytish
                </Link>
              </Button>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Button
                variant="outline"
                size="sm"
                className="w-full gap-2 justify-start group-data-[state=collapsed]:justify-center"
                onClick={() => void signOut({ callbackUrl: '/auth/login' })}
              >
                <LogOut className="size-4" />
                <span className="group-data-[state=collapsed]:hidden">Chiqish</span>
              </Button>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        <Button
          variant="outline"
          size="icon"
          className=""
          asChild
        >
          <Link href="/dashboard/settings" aria-label="Sozlamalar">
            <Settings className="size-4" />
          </Link>
        </Button>
      </div>
    </header>
  )
}
