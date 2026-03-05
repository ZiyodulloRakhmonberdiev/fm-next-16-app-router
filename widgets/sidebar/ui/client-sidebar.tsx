import CategoryList from '@/entities/category/ui/category-list'
import { Button } from '@/shared/common/components/ui/button'
import { Sidebar, SidebarHeader, SidebarContent, SidebarFooter } from '@/shared/common/components/ui/sidebar'
import LanguageSwitcherForMobile from '@/widgets/language-switcher/ui/language-switcher-for-mobile'
import { ThemeSwitcher } from '@/widgets/theme-switcher'
import { XIcon } from 'lucide-react'
import Image from 'next/image'
import React from 'react'

export default function ClientSidebar({ onClose }: { onClose: () => void }) {
  return (
    <Sidebar>
      <SidebarHeader>
        <div className='flex items-center justify-between w-full gap-2'>
          <Image src="/images/logo.png" alt="logo" width={100} height={100} />
          <div className="flex items-center gap-1">
            <LanguageSwitcherForMobile />
            <ThemeSwitcher />
          </div>
        </div>
      </SidebarHeader>
      <SidebarContent className='p-2'>
        SidebarContent
      </SidebarContent>
     
    </Sidebar>
  )
}
