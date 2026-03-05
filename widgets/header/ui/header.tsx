'use client'
import { Link } from '@/i18n/navigation'
import { Button } from '@/shared/common/components/ui/button'
import { ThemeSwitcher } from '@/widgets/theme-switcher'
import { MenuIcon, SearchIcon } from 'lucide-react'
import Image from 'next/image'
import CategoryList from '@/entities/category/ui/category-list'
import Headline from './headline'

export default function Header() {
  return (
    <div className='sticky top-0 z-10 bg-accent'>
      <div className="flex items-center justify-between">
        <Headline />
      </div>
      <div className="flex items-center justify-between py-2 px-2 max-w-7xl mx-auto">
        <div className="flex items-center gap-8">
          <Link href="/">
            <Image src="/images/logo.png" alt="logo" width={100} height={100} />
          </Link>
          <div className="ml-12 md:ml-16 hidden md:block">
            <CategoryList />
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Button variant="outline">
              <SearchIcon className="w-4 h-4" />
            </Button>
            <div className="hidden md:block">
              <ThemeSwitcher />
            </div>
            <Button variant="outline" className="block md:hidden">
              <MenuIcon className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
