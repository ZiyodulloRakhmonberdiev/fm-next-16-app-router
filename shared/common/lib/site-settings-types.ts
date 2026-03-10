import type { AppLocale } from './locale-api'
import type { LocaleMap } from './locale-types'

export type SocialMediaItem = {
  slug: string
  /**
   * Rasmiy nom (faqat bitta tilda, masalan: "Telegram", "YouTube").
   */
  name: string
  href: string
}

export type SiteConfigSettings = {
  email: string
  phone: string
  address: LocaleMap
}

export type SiteSettingsPayload = {
  headline: LocaleMap
  description: LocaleMap
  socialMedia: SocialMediaItem[]
  siteConfig: SiteConfigSettings
}
