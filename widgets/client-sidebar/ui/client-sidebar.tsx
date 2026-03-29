import { Link } from '@/i18n/navigation'
import Image from 'next/image'
import { useTranslations, useLocale } from 'next-intl'
import { Volume2 } from 'lucide-react'
import { CategoryListForSidebar } from '@/entities/category'
import { Sidebar, SidebarHeader, SidebarContent, SidebarFooter } from '@/shared/common/components/ui/sidebar'
import { StayConnectedSidebar } from '@/shared/common/components/organisms'
import { LanguageSwitcherForSidebar } from '@/widgets/language-switcher'
import { ThemeSwitcherForHeader } from '@/widgets/theme-switcher'
import type { AppLocale } from '@/shared/common/lib/locale-api'
import { Label } from '@/shared/common/components/ui/label'

export default function ClientSidebar() {
  const t = useTranslations("common")
  const locale = useLocale() as AppLocale
  return (
    <Sidebar className='bg-background'>
      <SidebarHeader>
        <div className='flex items-center justify-center w-full gap-2 px-2 border-b border-border py-4'>
          <Image src="/images/fm-logo.svg" alt="logo" width={100} height={100} className="hidden dark:block h-8 w-auto object-contain" priority />
          <Image src="/images/fm-logo-dark.svg" alt="logo" width={100} height={100} className="block dark:hidden h-8 w-auto object-contain" priority />
        </div>
      </SidebarHeader>
      <SidebarContent>
        <div className='flex justify-center gap-6 scroll-auto items-center p-2 pb-4 border-b border-border'>
          <Label htmlFor="theme-switcher">{t("dark_mode")}</Label>
          <ThemeSwitcherForHeader />
        </div>
        <div className='font-medium px-4 border-b border-border pb-2'>
          <LanguageSwitcherForSidebar />
        </div>
        {/* <div className="px-4 py-2 border-b border-border">
          <Link href="/news/audio" className="flex items-center gap-3 text-sm font-medium hover:text-brand transition-colors">
            <Volume2 className="size-4" />
            Audio
          </Link>
        </div> */}
        <CategoryListForSidebar />
        <div className='text-center flex flex-col gap-2 border-t border-border py-4'>
          <Link href="/about">
            <span className="">{t("about_us")}</span>
          </Link>
          <Link href="/contact">
            <span className="">{t("contact_us")}</span>
          </Link>
          <Link href="/privacy">
            <span className="">{t("privacy_policy")}</span>
          </Link>
          <Link href="/terms">
            <span className="">{t("terms_of_service")}</span>
          </Link>
        </div>


        <StayConnectedSidebar />
      </SidebarContent>
      <SidebarFooter>
        <p className="text-sm text-foreground/70 max-w-sm border-t border-border py-4 text-center">© Fergana Media</p>
      </SidebarFooter>
    </Sidebar>
  )
}
