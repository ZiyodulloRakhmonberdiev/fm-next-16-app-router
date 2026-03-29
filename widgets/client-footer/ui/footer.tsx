'use client'
import { Link } from '@/i18n/navigation'
import { seed } from '@/scripts/seed'
import { SocialMediaButtons } from '@/shared/common/components/ui/social-media-buttons'
import Image from 'next/image'
import { useTranslations, useLocale } from 'next-intl'
import { Mail, MapPin, Phone } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useTheme } from 'next-themes'
import type { AppLocale } from '@/shared/common/lib/locale-api'
import { usePublicSiteSettingsQuery } from '@/shared/server/public-site-settings-query'
import { Button } from '@/shared/common/components/ui/button'
import { ClientBottomNav } from '@/widgets/client-bottom-nav'

export default function Footer() {
  const { resolvedTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])
  const locale = useLocale() as AppLocale
  const { data: settings } = usePublicSiteSettingsQuery()
  const description = settings?.description?.[locale] ?? seed.description[locale]
  const email = settings?.siteConfig.email ?? seed.siteConfig.email
  const phone = settings?.siteConfig.phone ?? seed.siteConfig.phone
  const address = settings?.siteConfig.address?.[locale] ?? seed.siteConfig.address[locale]

  const logoSrc =
    mounted && resolvedTheme === 'light'
      ? '/images/fm-logo-dark.svg'
      : '/images/fm-logo.svg'

  const t = useTranslations("common")
  return (
    <div className="py-4 border-t border-border shadow-sm mt-4">
      <div className="max-w-7xl mx-auto px-4 md:px-6">
        <Link href="/" className="flex h-8 shrink-0 items-center md:h-10 mb-2">
          <Image
            src={mounted ? logoSrc : '/images/fm-logo-dark.svg'}
            alt="Logo"
            width={130}
            height={40}
            className="h-6 w-auto max-h-6 object-contain object-left md:h-8 md:max-h-8"
            sizes="(max-width: 768px) 100px, 130px"
          />
        </Link>
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-0 md:gap-4 lg:gap-6 items-start justify-between'>
          {/* Description */}
          <div className='w-full border-b md:border-none border-border pb-2 flex gap-2 flex-col'>
            <p className="text-sm text-foreground/70 max-w-md">{description}</p>
            <div className='hidden md:flex flex-col gap-2'>
              <div className="flex items-center gap-2 text-sm text-foreground/70">
                <Mail className="size-4 text-foreground/70" />
                <a href={`mailto:${email}`}>{email}</a>
              </div>
              <div className="flex items-center gap-2 text-sm text-foreground/70">
                <Phone className="size-4 text-foreground/70" />
                <a href={`tel:${phone}`}>{phone}</a>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="size-4 text-foreground/70" />
                <span className="text-sm text-foreground/70">{address}</span>
              </div>
            </div>
          </div>
          {/* Social and links */}
          <div className="hidden md:flex items-center gap-x-4 gap-y-1 text-sm py-4 md:pt-0 md:py-0 text-foreground/70 border-b md:border-none border-border flex-wrap">
            <span className='font-bold'>{t("quick_links")}: </span>{seed.links.map((item) => {
              const isExternal = /^https?:\/\//i.test(item.href)
              return (
                <Link key={item.href} href={item.href} target={isExternal ? '_blank' : undefined}>
                  {item.name[locale]}
                </Link>
              )
            })}
            <div className="text-sm text-foreground/70 mt-2">
              <span className="font-bold">{t("note")}</span> {t("note_desc")} <Link href={`mailto:${email}`} className="text-blue-500 hover:text-blue-600">{email}</Link>
            </div>
          </div>
          <div className="flex items-start pt-2 md:pt-0 flex-col gap-2">
            <span className="hidden md:block font-bold text-sm text-foreground/70">{t("follow_us")}:</span>
            <div className='flex items-center my-2 justify-between gap-2 w-full'>
              <SocialMediaButtons
                variant="icon-only"
                className="flex items-center flex-wrap gap-2 md:hidden"
                linkClassName="text-xs md:text-sm"
              />
              <SocialMediaButtons
                variant="button"
                className="hidden md:flex items-center flex-wrap gap-2"
                linkClassName="text-xs md:text-sm"
              />
              <div className='flex md:hidden ml-auto '>
                <Button className='w-10 font-bold ml-auto bg-white dark:bg-black' size='icon' variant='outline' type='button'
                >16+</Button>
              </div>
            </div>
          </div>
        </div>
        <div className='hidden md:flex items-center jstart justify-end mt-2 md:mt-0'>
          <Button className='w-10 font-bold ml-auto bg-white dark:bg-black' size='icon' variant='outline' type='button'
          >16+</Button>
        </div>
        <div className="flex flex-col items-center justify-center gap-4 py-4 mt-2 md:mt-4 border-t border-border">
          <p className="text-sm text-foreground/70 text-center">{seed.copyright[locale]} </p>
          <Link href="/" className="flex md:hidden">
            <Image
              src={'/images/footer-logo.png'}
              alt="Logo"
              width={60}
              height={60}
              className=""
            />
          </Link>
        </div>
      </div>
      <ClientBottomNav />
    </div>
  )
}
