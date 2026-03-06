import { Link } from '@/i18n/navigation'
import { seed } from '@/scripts/seed'
import { getSocialPlatformStyle } from '@/shared/config/social-platforms'
import { Button } from '@/shared/common/components/ui/button'
import { cn } from '@/shared/common/lib/utils'
import Image from 'next/image'
import { useTranslations } from 'next-intl'

export default function Footer() {
  const t = useTranslations("common")
  return (
    <div className="bg-accent py-4 border-t border-border shadow-sm">
      <div className="max-w-7xl mx-auto px-4 md:px-6">
        <div className="flex items-start md:items-center justify-between gap-2 flex-col md:flex-row mb-2">
          <Link href="/">
            <Image src="/images/logo.png" alt="logo" width={100} height={100} />
          </Link>
          <div className="flex items-start md:items-center flex-wrap gap-2">
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
                      <span className="text-white hidden md:block">{t(item.name)}</span>
                    </Button>
                  ) : (
                    <Button variant="outline" className="flex items-center gap-2">
                      <span>{t(item.name)}</span>
                    </Button>
                  )}
                </Link>
              )
            })}
          </div>
        </div>
        <div className='w-full border-b border-border pb-4'>
        <p className="text-sm text-foreground/70 max-w-sm">{seed.description}</p>
        </div>
        <div className="flex items-center gap-x-4 gap-y-1 text-sm py-4 text-foreground/70 border-b border-border flex-wrap">
          {seed.links.map((item) => {
            return (
              <Link key={item.href} href={item.href}>
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
