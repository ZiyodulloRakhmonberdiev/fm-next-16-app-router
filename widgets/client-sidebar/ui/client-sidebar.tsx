"use client"
import { Link } from '@/i18n/navigation'
import { useTranslations } from 'next-intl'
import { XIcon } from 'lucide-react'
import { CategoryListForSidebar } from '@/entities/category'
import { Sidebar, SidebarHeader, SidebarContent, SidebarFooter, useSidebar } from '@/shared/common/components/ui/sidebar'
import { StayConnectedSidebar } from '@/shared/common/components/organisms'
import { LanguageSwitcherForSidebar } from '@/widgets/language-switcher'
import { ThemeSwitcherForHeader } from '@/widgets/theme-switcher'
import { Toggle } from '@/shared/common/components/ui/toggle'
import { WeatherWidget } from '@/shared/common/components/market/weather-widget'
import { CurrencyWidget } from '@/shared/common/components/market/currency-widget'
import Image from 'next/image'
import { Label } from '@/shared/common/components/ui/label'

export default function ClientSidebar() {
  const t = useTranslations("common")
  const { isMobile, open, openMobile, setOpen, setOpenMobile } = useSidebar()
  const isPressed = isMobile ? openMobile : open

  const handleSidebarToggle = (pressed: boolean) => {
    // Controlled toggle: explicit state writes are safer than invert-only toggles.
    if (isMobile) {
      setOpenMobile(pressed)
      return
    }
    setOpen(pressed)
  }
  return (
    <Sidebar className=''>
      <SidebarHeader>
        <div className='flex items-center justify-between w-full gap-2 px-6 border-b border-border py-4'>
          <Image src="/images/fm-logo.svg" alt="logo" width={100} height={100} className="hidden dark:block h-8 w-auto object-contain" priority />
          <Image src="/images/fm-logo-dark.svg" alt="logo" width={100} height={100} className="block dark:hidden h-8 w-auto object-contain" priority />
          <Toggle
            variant="outline"
            size="sm"
            className='shadow-sm'
            pressed={isPressed}
            onPressedChange={handleSidebarToggle}
            aria-label={isPressed ? 'Close sidebar' : 'Open sidebar'}
            title={isPressed ? 'Close sidebar' : 'Open sidebar'}
          >
            <XIcon className="size-4" />
          </Toggle>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <div className='px-8 flex justify-between gap-6 scroll-auto items-center pb-2 border-b border-border'>
          <Label htmlFor="theme-switcher">{t("dark_mode")}</Label>
          <ThemeSwitcherForHeader />
        </div>
        <div className="px-8 py-1 border-b border-border">
          <CurrencyWidget variant="mobile" />
        </div>
        <div className='font-medium px-4 border-b border-border pb-2'>
          <LanguageSwitcherForSidebar />
        </div>

        <div className="px-4 py-3 mx-auto border-b border-border">
          <WeatherWidget compact />
        </div>
        <CategoryListForSidebar />
        <div className='text-center flex flex-col gap-2 border-t border-border py-4'>
          <Link href="/about">
            <span className="">{t("about_us")}</span>
          </Link>
          <Link href="/contact">
            <span className="">{t("contact_us")}</span>
          </Link>
          {/* <Link href="/privacy">
            <span className="">{t("privacy_policy")}</span>
          </Link>
          <Link href="/terms">
            <span className="">{t("terms_of_service")}</span>
          </Link> */}
        </div>


        <StayConnectedSidebar />
      </SidebarContent>
      <SidebarFooter>
        <p className="text-sm text-foreground/70 max-w-sm border-t border-border py-4 text-center">© Fergana Media</p>
      </SidebarFooter>
    </Sidebar>
  )
}
