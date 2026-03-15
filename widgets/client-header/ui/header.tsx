'use client'
import { useState, useEffect, useRef } from 'react'
import Image from 'next/image'
import { SearchIcon } from 'lucide-react'
import { Link } from '@/i18n/navigation'
import { useTheme } from 'next-themes'
import Headline from './headline'
import { ThemeSwitcherForHeader } from '@/widgets/theme-switcher'
import CategoryList from '@/entities/category/ui/category-list'
import { SidebarTrigger } from '@/shared/common/components/ui/sidebar'
import { CategoryListForMobile } from '@/entities/category'
import { SearchBar } from '@/widgets/client-searchbar'
import { AdSlot } from '@/shared/common/components/molecules'
import { ClientUserMenu } from '@/widgets/client-header/ui/client-user-menu'
import { cn } from '@/shared/common/lib/utils'
import { Button } from '@/shared/common/components/ui/button'

function AdSlotHeader() {
  return (
    <div className="border-b border-border bg-background">
      <div className="max-w-7xl mx-auto px-4 md:px-6 py-2">
        <AdSlot placement="header_top_full" />
      </div>
    </div>
  )
}

export default function Header() {
  const [searchOpen, setSearchOpen] = useState(false)
  const { resolvedTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  const [isPinned, setIsPinned] = useState(false)
  const [barHeight, setBarHeight] = useState(0)
  const adRef = useRef<HTMLDivElement | null>(null)
  const barRef = useRef<HTMLDivElement | null>(null)
  useEffect(() => setMounted(true), [])

  useEffect(() => {
    const updatePinnedState = () => {
      const adHeight = adRef.current?.offsetHeight ?? 0
      const nextPinned = window.scrollY > adHeight
      setIsPinned(nextPinned)
      setBarHeight(barRef.current?.offsetHeight ?? 0)
    }

    updatePinnedState()
    window.addEventListener('scroll', updatePinnedState, { passive: true })
    window.addEventListener('resize', updatePinnedState)

    return () => {
      window.removeEventListener('scroll', updatePinnedState)
      window.removeEventListener('resize', updatePinnedState)
    }
  }, [])

  const logoSrc =
    mounted && resolvedTheme === 'light'
      ? '/images/fm-logo-dark.svg'
      : '/images/fm-logo.svg'

  return (
    <div>
      <div ref={adRef}>
        <AdSlotHeader />
      </div>
      {isPinned ? <div style={{ height: barHeight }} aria-hidden /> : null}
      <div
        ref={barRef}
        className={cn(
          'bg-background border-b border-border shadow-sm',
          isPinned ? 'fixed inset-x-0 top-0 z-50' : 'relative'
        )}
      >
        <div className="flex items-center justify-between">
          <Headline />
        </div>
        <div className="max-w-7xl mx-auto flex items-center justify-between py-2 px-4 md:px-6 border-b md:border-none border-border">
          <div className="flex items-center gap-8">
            <Link href="/" className="flex h-8 shrink-0 items-center md:h-10">
              <Image
                src={mounted ? logoSrc : '/images/fm-logo-dark.svg'}
                alt="Logo"
                width={130}
                height={40}
                className="h-6 w-auto max-h-6 object-contain object-left md:h-8 md:max-h-8"
                sizes="(max-width: 768px) 100px, 130px"
                priority
              />
            </Link>
            <div className="ml-12 md:ml-16 hidden md:block">
              <CategoryList />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="icon" className="" onClick={() => setSearchOpen(true)} aria-label="Qidiruv">
                <SearchIcon className="w-4 h-4" />
              </Button>
              <ClientUserMenu />
              <div className="hidden md:block">
                {/* <ThemeSwitcher /> */}
                <ThemeSwitcherForHeader />
              </div>
            </div>
            <div className="block md:hidden">
              <SidebarTrigger />
            </div>
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-4 md:px-6">
          <CategoryListForMobile />
        </div>
      </div>
      <SearchBar open={searchOpen} onClose={() => setSearchOpen(false)} />
    </div>
  )
}
