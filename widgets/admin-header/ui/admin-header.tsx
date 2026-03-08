'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { Link } from '@/i18n/navigation'
import { useLocale } from 'next-intl'
import { SidebarTrigger } from '@/shared/common/components/ui/sidebar'
import { Button } from '@/shared/common/components/ui/button'
import { Bell, LayoutDashboard, LogOut, Search } from 'lucide-react'
import type { NewsItem } from '@/features/news/model'

const DEBOUNCE_MS = 200

export default function AdminHeader() {
  const locale = useLocale()
  const [searchQuery, setSearchQuery] = useState('')
  const [results, setResults] = useState<NewsItem[]>([])
  const [isOpen, setIsOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const wrapperRef = useRef<HTMLDivElement>(null)

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
      <div className="flex flex-1 items-center gap-4">
        <div className="hidden md:flex items-center gap-2 text-sm font-medium text-muted-foreground">
          <LayoutDashboard className="size-4" />
          Admin panel
        </div>
        <div className="flex-1 max-w-md relative" ref={wrapperRef}>
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
                        href={`/news/${item.slug}`}
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
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="size-4" />
          <span className="absolute right-1 top-1 h-2 w-2 rounded-full bg-destructive" />
          <span className="sr-only">Bildirishnomalar</span>
        </Button>
        <Button variant="ghost" size="icon" asChild>
          <Link href="/">
            <LogOut className="size-4" />
            <span className="sr-only">Chiqish</span>
          </Link>
        </Button>
      </div>
    </header>
  )
}
