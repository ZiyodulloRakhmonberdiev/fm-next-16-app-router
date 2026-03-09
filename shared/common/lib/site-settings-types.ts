import type { AppLocale } from './locale-api'

export type LocaleMap = Record<AppLocale, string>

export type SocialMediaItem = {
  slug: string
  name: LocaleMap
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
