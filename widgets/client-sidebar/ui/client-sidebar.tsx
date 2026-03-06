import { Link } from '@/i18n/navigation'
import Image from 'next/image'
import { useTranslations } from 'next-intl'
import { CategoryListForSidebar } from '@/entities/category'
import { Sidebar, SidebarHeader, SidebarContent, SidebarFooter } from '@/shared/common/components/ui/sidebar'
import { LanguageSwitcherForSidebar } from '@/widgets/language-switcher'
import { ThemeSwitcherForSidebar } from '@/widgets/theme-switcher'
import { seed } from '@/scripts/seed'
import { getSocialPlatformStyle } from '@/shared/config/social-platforms'
import { Button } from '@/shared/common/components/ui/button'
import { cn } from '@/shared/common/lib/utils'

export default function ClientSidebar() {
  const t = useTranslations("common")
  return (
    <Sidebar className='bg-background'>
      <SidebarHeader>
        <div className='flex items-start w-full gap-2 px-2'>
          <Image src="/images/logo.png" alt="logo" width={100} height={100} />
        </div>
      </SidebarHeader>
      <SidebarContent>
        <div className='font-medium px-4 border-b border-border pb-2'>
          <LanguageSwitcherForSidebar />
        </div>
        <div className='font-medium px-4 border-b border-border pb-2'>
          <ThemeSwitcherForSidebar />
        </div>
        <span className='text-sm font-medium px-4'>{t("categories")}</span>
        <CategoryListForSidebar />
        <span className='text-sm font-medium px-4 border-t border-border pt-2'>{t("quick_links")}</span>
        <div className='grid grid-cols-1 gap-2 px-4 text-sm'>
          {seed.links.map((item) => {
            return (
              <Link key={item.href} href={item.href}>
                {t(item.name)}
              </Link>
            )
          })}
        </div>


        <div className='flex items-start px-4 w-full gap-2 flex-col border-t border-border pt-2'>
          <span className='text-sm font-medium'>{t("follow_us")}:</span>
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
        <p className="text-sm text-foreground/70 max-w-sm border-t border-border py-4 text-center">{t("copyright", { name: "Fergana Media" })}</p>
      </SidebarFooter>
    </Sidebar>
  )
}
