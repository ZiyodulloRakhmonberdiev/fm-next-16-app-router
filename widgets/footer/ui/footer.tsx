import { Link } from '@/i18n/navigation'
import { seed } from '@/scripts/seed'
import { getSocialPlatformStyle } from '@/shared/config/social-platforms'
import { Button } from '@/shared/common/components/ui/button'
import { cn } from '@/shared/common/lib/utils'
import Image from 'next/image'

export default function Footer() {
  return (
    <div className="bg-accent py-4 border-t border-border shadow-sm">
      <div className="max-w-7xl mx-auto px-4 md:px-6">
        <div className="flex items-center justify-between gap-4 flex-nowrap md:flex-wrap">
          <Link href="/">
            <Image src="/images/logo.png" alt="logo" width={100} height={100} />
          </Link>
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
        <p className="text-sm text-foreground/70 max-w-sm border-b border-border pb-4">{seed.description}</p>
        <div className="flex items-center gap-x-4 gap-y-1 text-sm py-4 text-foreground/70 border-b border-border flex-wrap">
          {seed.links.map((item) => {
            return (
              <Link key={item.href} href={item.href}>
                {item.name}
              </Link>
            )
          })}
        </div>
        <div className="flex items-center gap-2 py-4">
          <p className="text-sm text-foreground/70">© 2026 News. All rights reserved. Website powered by <Link href="https://www.google.com" className="text-blue-500 hover:text-blue-600">Turon.io</Link></p>
        </div>
      </div>
    </div>
  )
}
