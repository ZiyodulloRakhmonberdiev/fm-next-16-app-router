import { Schema, model, models } from 'mongoose'
import type { SiteSettingsPayload } from '@/shared/common/lib/site-settings-types'

/** Bitta global sozlamalar hujjati */
export const SITE_SETTINGS_DOCUMENT_ID = 'singleton'

const localeMapSchema = {
  uz: { type: String, default: '' },
  uzb: { type: String, default: '' },
  ru: { type: String, default: '' },
  en: { type: String, default: '' },
}

export type SiteSettingsDoc = SiteSettingsPayload & {
  _id: string
  createdAt?: Date
  updatedAt?: Date
}

const SiteSettingsSchema = new Schema<SiteSettingsDoc>(
  {
    _id: { type: String, required: true },
    headline: {
      enabled: { type: Boolean, default: true },
      message: localeMapSchema,
    },
    description: localeMapSchema,
    socialMedia: [
      {
        slug: { type: String, required: true },
        name: { type: String, required: true },
        href: { type: String, required: true },
      },
    ],
    siteConfig: {
      email: { type: String, default: '' },
      phone: { type: String, default: '' },
      address: localeMapSchema,
    },
    telegram: {
      enabled: { type: Boolean, default: false },
      botToken: { type: String, default: '' },
      chatId: { type: String, default: '' },
      threadId: { type: String },
    },
    clientDelivery: {
      mode: {
        type: String,
        enum: ['normal', 'nothing', 'server-off'],
        default: 'normal',
      },
      title: { type: String, default: '' },
      description: { type: String, default: '' },
      models: {
        news: { type: Boolean, default: true },
        categories: { type: Boolean, default: true },
        tags: { type: Boolean, default: true },
        comments: { type: Boolean, default: true },
        reactions: { type: Boolean, default: true },
        ads: { type: Boolean, default: true },
        team: { type: Boolean, default: true },
        users: { type: Boolean, default: true },
      },
    },
    databaseBackup: {
      enabled: { type: Boolean, default: false },
      botToken: { type: String, default: '' },
      chatId: { type: String, default: '' },
      threadId: { type: String },
      commentThreadId: { type: String },
    },
  },
  { timestamps: true }
)

export const SiteSettingsModel =
  models.SiteSettings ?? model<SiteSettingsDoc>('SiteSettings', SiteSettingsSchema)

const defaultDatabaseBackup = (): SiteSettingsPayload['databaseBackup'] => ({
  enabled: false,
  botToken: '',
  chatId: '',
  threadId: undefined,
  commentThreadId: undefined,
})

export function leanDocToPayload(doc: SiteSettingsDoc | null | undefined): SiteSettingsPayload | null {
  if (!doc) return null
  const dbBackup = doc.databaseBackup
  return {
    headline: doc.headline,
    description: doc.description,
    socialMedia: Array.isArray(doc.socialMedia) ? doc.socialMedia : [],
    siteConfig: doc.siteConfig,
    telegram: doc.telegram,
    clientDelivery: doc.clientDelivery,
    databaseBackup: dbBackup
      ? {
          enabled: Boolean(dbBackup.enabled),
          botToken: dbBackup.botToken ?? '',
          chatId: dbBackup.chatId ?? '',
          threadId: dbBackup.threadId?.trim() ? dbBackup.threadId : undefined,
          commentThreadId: dbBackup.commentThreadId?.trim()
            ? dbBackup.commentThreadId
            : undefined,
        }
      : defaultDatabaseBackup(),
  }
}
