"use client"

import { AlertOctagon } from "lucide-react"
import { SocialMediaButtons } from "@/shared/common/components/ui/social-media-buttons"
import { useLocale } from "next-intl"
import type { AppLocale } from "@/shared/common/lib/locale-api"
import { usePublicSiteSettingsQuery } from "@/shared/server/public-site-settings-query"
import { WeatherWidget } from "@/shared/common/components/market/weather-widget"
import { CurrencyWidget } from "@/shared/common/components/market/currency-widget"

export default function Headline() {
  const locale = useLocale() as AppLocale
  const { data: settings } = usePublicSiteSettingsQuery()
  const enabled = settings?.headline.enabled ?? true
  const headline =
    settings?.headline.message[locale] ??
    settings?.headline.message.uz ??
    ""

  return (
    <div className="w-full py-2 bg-foreground/10 hidden md:block space-y-2">
      <div className="max-w-7xl mx-auto flex items-center px-4 md:px-6 justify-between">
        <div className="min-h-5 flex items-center gap-4">
          <WeatherWidget compact />
          {enabled && headline.trim() ? (
            <p className="text-sm text-foreground font-normal flex items-center">
              <AlertOctagon className="w-4 h-4" />
              <span className="ml-2">{headline}</span>
            </p>
          ) : null}
        </div>
        <div className="flex items-center gap-3">
          <CurrencyWidget variant="desktop" />
          <SocialMediaButtons variant="icon-only" />
        </div>
      </div>
    </div>
  )
}
