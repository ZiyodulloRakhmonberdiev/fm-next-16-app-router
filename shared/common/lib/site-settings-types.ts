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
  comments: boolean
  reactions: boolean
  ads: boolean
  team: boolean
  users: boolean
}

export type ClientDeliveryControl = {
  mode: ClientDeliveryMode
  title: string
  description: string
  models: ClientModelSwitches
}

/** Ma’lumotlar bazasi arxivi — alohida bot / chat (yangiliklar Telegramidan mustaqil) */
export type DatabaseBackupSettings = {
  enabled: boolean
  botToken: string
  chatId: string
  threadId?: string
  /** Pending izohlar alerti uchun alohida thread */
  commentThreadId?: string
  /** Contact form xabarlari uchun alohida thread */
  contactThreadId?: string
}

export type SiteSettingsPayload = {
  headline: HeadlineSettings
  description: LocaleMap
  socialMedia: SocialMediaItem[]
  siteConfig: SiteConfigSettings
  telegram: TelegramCredentials
  clientDelivery: ClientDeliveryControl
  databaseBackup: DatabaseBackupSettings
}
