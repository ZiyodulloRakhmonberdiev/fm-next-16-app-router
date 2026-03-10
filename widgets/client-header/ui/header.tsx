'use client'
import { useState, useEffect } from 'react'
import Image from 'next/image'
import { SearchIcon } from 'lucide-react'
import { Link } from '@/i18n/navigation'
import { useTheme } from 'next-themes'
import Headline from './headline'
import { ThemeSwitcher } from '@/widgets/theme-switcher'
import CategoryList from '@/entities/category/ui/category-list'
import { SidebarTrigger } from '@/shared/common/components/ui/sidebar'
import { CategoryListForMobile } from '@/entities/category'
import { SearchBar } from '@/widgets/client-searchbar'

export default function Header() {
  const [searchOpen, setSearchOpen] = useState(false)
  const { resolvedTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])

  const logoSrc =
    mounted && resolvedTheme === 'light'
      ? '/images/fm-logo-dark.svg'
      : '/images/fm-logo.svg'

  return (
    <div className='sticky top-0 z-10 bg-background border-b border-border shadow-sm'>
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
        <div className="flex items-center gap-4">
          <SearchIcon className="w-4 h-4" onClick={() => setSearchOpen(true)} />
          <div className="hidden md:block">
            <ThemeSwitcher />
          </div>
          <div className="block md:hidden">
            <SidebarTrigger />
          </div>
        </div>
      </div>
      <div className="max-w-7xl mx-auto px-4 md:px-6">
        <CategoryListForMobile />
      </div>
      <SearchBar open={searchOpen} onClose={() => setSearchOpen(false)} />
    </div>
  )
}
