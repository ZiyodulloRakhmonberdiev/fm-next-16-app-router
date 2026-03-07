import { Link } from '@/i18n/navigation'
import { seed } from '@/scripts/seed'
import { SocialMediaButtons } from '@/shared/common/components/ui/social-media-buttons'
import Image from 'next/image'
import { useTranslations } from 'next-intl'
import { Mail, MapPin, Phone } from 'lucide-react'

export default function Footer() {
  const t = useTranslations("common")
  return (
    <div className="py-4 border-t border-border shadow-sm">
      <div className="max-w-7xl mx-auto px-4 md:px-6">
        <div className="flex items-start md:items-center justify-between gap-2 flex-col md:flex-row mb-2">
          <Link href="/">
            <Image src="/images/logo.png" alt="logo" width={100} height={100} />
          </Link>
          <SocialMediaButtons
            variant="button"
            className="flex items-center flex-wrap gap-2"
            linkClassName="text-xs md:text-sm"
          />
        </div>
        <div className='w-full border-b border-border pb-2 flex gap-2 flex-col'>
          <p className="text-sm text-foreground/70 max-w-md">{seed.description}</p>
          <div className="flex items-center gap-2 text-sm text-foreground/70">
            <Mail className="size-4 text-foreground/70" />
            <a href={`mailto:${seed.siteConfig.email}`}>{seed.siteConfig.email}</a>
          </div>
          <div className="flex items-center gap-2 text-sm text-foreground/70">
            <Phone className="size-4 text-foreground/70" />
            <a href={`tel:${seed.siteConfig.phone}`}>{seed.siteConfig.phone}</a>
          </div>
          <div className="flex items-center gap-2">
            <MapPin className="size-4 text-foreground/70" />
            <span className="text-sm text-foreground/70">{seed.siteConfig.address}</span>
          </div>
        <div className="text-sm text-foreground/70 pb-1 ">
          <span className="font-bold">{t("note")}</span> {t("note_desc")} <Link href={`mailto:${seed.siteConfig.email}`} className="text-blue-500 hover:text-blue-600">{seed.siteConfig.email}</Link>
        </div>
        </div>
        <div className="flex items-center gap-x-4 gap-y-1 text-sm py-4 text-foreground/70 border-b border-border flex-wrap">
          {seed.links.map((item) => {
            return (
              <Link key={item.href} href={item.href} target='_blank'>
                {t(item.name)}
              </Link>
            )
          })}
        </div>
        <div className="flex items-center gap-2 py-4">
          <p className="text-sm text-foreground/70">{t("copyright", { name: "Fergana Media" })} {t("powered_by")}<Link href="https://www.google.com" className="text-blue-500 hover:text-blue-600">Turon.io</Link></p>
        </div>
      </div>
    </div>
  )
}
