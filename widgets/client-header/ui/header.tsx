'use client'
import { Link } from '@/i18n/navigation'
import { Button } from '@/shared/common/components/ui/button'
import { ThemeSwitcher } from '@/widgets/theme-switcher'
import { MenuIcon, SearchIcon } from 'lucide-react'
import Image from 'next/image'
import CategoryList from '@/entities/category/ui/category-list'
import Headline from './headline'
import { useState } from 'react'
import { SidebarTrigger } from '@/shared/common/components/ui/sidebar'
import CategoryListForMobile from '@/entities/category/ui/category-list-for-mobile'

export default function Header() {
  return (
    <div className='sticky top-0 z-10 bg-accent border-b border-border shadow-sm'>
      <div className="flex items-center justify-between">
        <Headline />
      </div>
      <div className="max-w-7xl mx-auto flex items-center justify-between py-2 px-4 md:px-6 border-b border-border">
        <div className="flex items-center gap-8">
          <Link href="/">
            <Image src="/images/logo.png" alt="logo" className="min-w-28" width={100} height={100} />
          </Link>
          <div className="ml-12 md:ml-16 hidden md:block">
            <CategoryList />
          </div>
        </div>
        <div className="flex items-center gap-4">
          <SearchIcon className="w-4 h-4" />
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
    </div>
  )
}
