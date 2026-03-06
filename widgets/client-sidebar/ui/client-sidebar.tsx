import CategoryListForSidebar from '@/entities/category/ui/category-list-for-sidebar'
import { Link } from '@/i18n/navigation'
import { Sidebar, SidebarHeader, SidebarContent } from '@/shared/common/components/ui/sidebar'
import LanguageSwitcherForMobile from '@/widgets/language-switcher/ui/language-switcher-for-mobile'
import { ThemeSwitcher, ThemeSwitcherForSidebar } from '@/widgets/theme-switcher'
import Image from 'next/image'

export default function ClientSidebar() {
  return (
    <Sidebar>
      <SidebarHeader>
        <div className='flex items-center justify-between w-full gap-2'>
          <Image src="/images/logo.png" alt="logo" width={100} height={100} />
          <div className="flex items-center gap-1">
            <LanguageSwitcherForMobile />
          </div>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <span className='text-sm font-medium px-2 border-b border-border pb-2'>Categories</span>
        <CategoryListForSidebar />
        <span className='text-sm font-medium px-2 border-b border-border pb-2 mt-3'>Quick links</span>
        <div className='grid grid-cols-1 gap-2 px-2 text-sm'>
          <Link href="/">
            <span>Home</span>
          </Link>
          <Link href="/">
            <span>About</span>
          </Link>
          <Link href="/">
            <span>Contact</span>
          </Link>
        </div>
        <div className='font-medium px-2 border-b border-border pb-2 mt-3'>
          <ThemeSwitcherForSidebar   />
        </div>
      </SidebarContent>

    </Sidebar>
  )
}
