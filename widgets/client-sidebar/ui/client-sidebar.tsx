import { Link } from '@/i18n/navigation'
import Image from 'next/image'
import { useTranslations } from 'next-intl'
import { CategoryListForSidebar } from '@/entities/category'
import { Sidebar, SidebarHeader, SidebarContent, SidebarFooter } from '@/shared/common/components/ui/sidebar'
import { SocialMediaButtons } from '@/shared/common/components/ui/social-media-buttons'
import { LanguageSwitcherForSidebar } from '@/widgets/language-switcher'
import { ThemeSwitcherForSidebar } from '@/widgets/theme-switcher'
import { seed } from '@/scripts/seed'
import { useLocale } from 'next-intl'
import type { AppLocale } from '@/shared/common/lib/locale-api'

export default function ClientSidebar() {
  const t = useTranslations("common")
  const locale = useLocale() as AppLocale
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
                {item.name[locale]}
              </Link>
            )
          })}
        </div>


        <div className='flex items-start px-4 w-full gap-2 flex-col border-t border-border pt-2'>
          <span className='text-sm font-medium'>{t("follow_us")}:</span>
          <SocialMediaButtons
            variant="icon-only"
            className="flex items-center justify-end flex-wrap gap-2"
          />
        </div>
      </SidebarContent>
      <SidebarFooter>
        <p className="text-sm text-foreground/70 max-w-sm border-t border-border py-4 text-center">{seed.copyright[locale]}</p>
      </SidebarFooter>
    </Sidebar>
  )
}
