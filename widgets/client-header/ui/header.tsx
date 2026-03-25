'use client'
import { useState, useEffect, useRef } from 'react'
import Image from 'next/image'
import { Link } from '@/i18n/navigation'
import { useTheme } from 'next-themes'
import Headline from './headline'
import CategoryList from '@/entities/category/ui/category-list'
import { SidebarTrigger } from '@/shared/common/components/ui/sidebar'
import { CategoryListForMobile } from '@/entities/category'
import { SearchBar } from '@/widgets/client-searchbar'
import { AdSlot } from '@/features/ads/ui/ad-slot'
import { ClientUserMenu } from '@/widgets/client-header/ui/client-user-menu'
import { Button } from '@/shared/common/components/ui/button'
import { Search } from 'lucide-react'
import { LanguageSwitcher } from '@/widgets/language-switcher'
import { cn } from '@/shared/common/lib/utils'
import { ThemeSwitcherForHeader } from '@/widgets/theme-switcher'

function AdSlotHeader() {
  return (
    <div className="border-b-0 border-border bg-background has-data-ad-slot:border-b">
      <div className="mx-auto max-w-7xl px-4 md:px-6">
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
  const topBlockRef = useRef<HTMLDivElement>(null)
  const barRef = useRef<HTMLDivElement>(null)

  useEffect(() => setMounted(true), [])

  useEffect(() => {
    const updatePinned = () => {
      const topHeight = topBlockRef.current?.offsetHeight ?? 0
      setIsPinned(window.scrollY > topHeight)
      setBarHeight(barRef.current?.offsetHeight ?? 0)
    }
    updatePinned()
    window.addEventListener('scroll', updatePinned, { passive: true })
    window.addEventListener('resize', updatePinned)
    return () => {
      window.removeEventListener('scroll', updatePinned)
      window.removeEventListener('resize', updatePinned)
    }
  }, [])

  const logoSrc =
    mounted && resolvedTheme === 'light'
      ? '/images/fm-logo-dark.svg'
      : '/images/fm-logo.svg'

  return (
    <div>
      {/* Ads + Headline: scroll da yuqoriga ketadi; yuqoriga scroll da yana ko‘rinadi */}
      <div ref={topBlockRef}>
        <AdSlotHeader />
        <div className="border-b border-border bg-background">
          <Headline />
        </div>
      </div>

      {isPinned && <div style={{ height: barHeight }} aria-hidden />}

      <div
        ref={barRef}
        className={cn(
          'bg-background border-b border-border shadow-sm z-50',
          isPinned ? 'fixed inset-x-0 top-0' : 'relative'
        )}
      >
        <div className="relative mx-auto flex w-full max-w-7xl items-center justify-between border-b border-border py-2 px-4 md:border-none md:px-6">
          <div className="hidden items-center gap-8 md:flex">
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
            <div className="ml-12 md:ml-16">
              <CategoryList />
            </div>
          </div>
          <div className="z-[2] flex shrink-0 items-center md:hidden">
            <span className="inline-flex size-9 shrink-0" aria-hidden />
          </div>
          <Link
            href="/"
            className="absolute left-1/2 top-1/2 z-[1] flex h-8 -translate-x-1/2 -translate-y-1/2 items-center md:hidden"
          >
            <Image
              src={mounted ? logoSrc : '/images/fm-logo-dark.svg'}
              alt="Logo"
              width={130}
              height={40}
              className="h-6 w-auto max-h-6 object-contain md:h-8 md:max-h-8"
              sizes="(max-width: 768px) 100px, 130px"
              priority
            />
          </Link>
          <div className="z-[2] flex shrink-0 items-center gap-2">
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="icon" className="" onClick={() => setSearchOpen(true)} aria-label="Qidiruv">
                <Search size="4" />
              </Button>
              <span className="block w-[0.5px] h-5 bg-foreground/10"></span>
              <ClientUserMenu />
              <span className="block w-[0.5px] h-5 bg-foreground/10"></span>
              <div className="hidden md:block">
                <LanguageSwitcher />
              </div>
              <div className="hidden md:block">
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
