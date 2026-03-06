import { Link } from '@/i18n/navigation'
import Image from 'next/image'
import { CategoryListForSidebar } from '@/entities/category'
import { Sidebar, SidebarHeader, SidebarContent, SidebarFooter, SidebarGroup } from '@/shared/common/components/ui/sidebar'
import { LanguageSwitcherForMobile } from '@/widgets/language-switcher'
import { ThemeSwitcherForSidebar } from '@/widgets/theme-switcher'
import { seed } from '@/scripts/seed'
import { getSocialPlatformStyle } from '@/shared/config/social-platforms'
import { Button } from '@/shared/common/components/ui/button'
import { cn } from '@/shared/common/lib/utils'

export default function ClientSidebar() {
  return (
    <Sidebar>
      <SidebarHeader>
        <div className='flex items-center justify-center w-full gap-2 px-2'>
          <Image src="/images/logo.png" alt="logo" width={100} height={100} />
        </div>
      </SidebarHeader>
      <SidebarContent>
        <span className='text-sm font-medium px-4 border-b border-border pb-2'>Categories</span>
        <CategoryListForSidebar />
        <span className='text-sm font-medium px-4 border-b border-border pb-2 mt-3'>Quick links</span>
        <div className='grid grid-cols-1 gap-2 px-4 text-sm'>
          {seed.links.map((item) => {
            return (
              <Link key={item.href} href={item.href}>
                {item.name}
              </Link>
            )
          })}
        </div>
        <div className='font-medium px-4 border-b border-border pb-2 mt-3'>
          <ThemeSwitcherForSidebar />
        </div>
        <div className='font-medium px-4 border-b border-border pb-2 mt-3'>
          <LanguageSwitcherForMobile />
        </div>
        <div className='flex items-center justify-center w-full gap-2 px-2 flex-col'>
          <span className='text-sm font-medium'>Follow us on:</span>
          <div className="flex items-center justify-end flex-wrap gap-2">
            {seed.socialMedia.map((item) => {
              const style = getSocialPlatformStyle(item.name)
              return (
                <Link key={item.href} href={item.href}>
                  {style ? (
                    <Button
                      variant="ghost"
                      className={cn(
                        'flex items-center gap-2 border-0 text-white shadow-sm text-xs md:text-sm',
                        style.bgColor
                      )}
                    >
                      <style.Icon className="size-4 md:size-4 text-white" />
                      <span className="text-white hidden md:block">{item.name}</span>
                    </Button>
                  ) : (
                    <Button variant="outline" className="flex items-center gap-2">
                      <span>{item.name}</span>
                    </Button>
                  )}
                </Link>
              )
            })}
          </div>
        </div>
      </SidebarContent>
      <SidebarFooter>
        <p className="text-sm text-foreground/70 max-w-sm border-t border-border py-4 text-center">{seed.copyright}</p>
      </SidebarFooter>
    </Sidebar>
  )
}
