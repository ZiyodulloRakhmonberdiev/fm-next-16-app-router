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

export type HeadlineSettings = {
  enabled: boolean
  message: LocaleMap
}

export type TelegramCredentials = {
  enabled: boolean
  botToken: string
  chatId: string
  threadId?: string
}

export type ClientDeliveryMode = 'normal' | 'nothing' | 'server-off'

export type ClientModelSwitches = {
  news: boolean
  categories: boolean
  tags: boolean
}

export type ClientDeliveryControl = {
  mode: ClientDeliveryMode
  title: string
  description: string
  models: ClientModelSwitches
}

export type SiteSettingsPayload = {
  headline: HeadlineSettings
  description: LocaleMap
  socialMedia: SocialMediaItem[]
  siteConfig: SiteConfigSettings
  telegram: TelegramCredentials
  clientDelivery: ClientDeliveryControl
}
