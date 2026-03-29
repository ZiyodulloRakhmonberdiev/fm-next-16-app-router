import { Schema, models, model } from 'mongoose'
import { v4 as uuidv4 } from 'uuid'
import type { NewsTitleLocale, NewsOptionalLocale } from '@/shared/common/lib/locale-types'
import type { NewsContent } from './content'
import type { NewsStatus } from './types'

export interface INews {
  _id: string
  slug: string
  title: NewsTitleLocale
  description?: NewsOptionalLocale<string>
  content?: NewsOptionalLocale<NewsContent>
  categoryId: string
  categorySlug: string
  themeId?: string
  tagIds: string[]
  tagSlugs: string[]
  images: string[]
  authorId?: string | null
  author?: string | null
  minutes: number
  views: number
  publishedAt: Date
  status: NewsStatus
  type?: string
  authorsChoice?: boolean
  isTrending?: boolean
  isLatest?: boolean
  isPopular?: boolean
  isTop?: boolean
  isBreaking?: boolean
  pushedToTelegram?: boolean
  pushedToTelegramAt?: Date
  telegramMessageId?: number
  telegramMessageLink?: string
  telegramPushStatus?: 'sent' | 'failed'
  telegramPushReason?: string
  telegramLastAttemptAt?: Date
  videoUrl?: string
  audioSource?: 'local' | 'external'
  audioUrl?: string
  /** Yangilikni yaratgan admin foydalanuvchi */
  createdBy?: { userId: string; name: string }
  createdAt: Date
  updatedAt: Date
}

const localeOptionalString = {
  uz: String,
  uzb: String,
  ru: String,
  en: String,
}

const NewsSchema = new Schema<INews>(
  {
    _id: { type: String, required: true, default: () => uuidv4() },
    slug: { type: String, required: true, unique: true },
    title: {
      uz: { type: String, required: true },
      uzb: String,
      ru: String,
      en: String,
    },
    description: localeOptionalString,
    content: {
      uz: Schema.Types.Mixed,
      uzb: Schema.Types.Mixed,
      ru: Schema.Types.Mixed,
      en: Schema.Types.Mixed,
    },
    categoryId: { type: String, required: true, index: true },
    categorySlug: { type: String, required: true },
    themeId: { type: String, required: false },
    tagIds: { type: [String], default: [], index: true },
    tagSlugs: { type: [String], default: [] },
    images: { type: [String], default: [] },
    authorId: { type: String, required: false, index: true },
    author: { type: String, required: false },
    minutes: { type: Number, default: 1 },
    views: { type: Number, default: 0 },
    publishedAt: { type: Date, default: Date.now },
    status: {
      type: String,
      enum: ['pending', 'published', 'cancelled', 'deleted', 'archived'],
      default: 'pending',
    },
    type: String,
    authorsChoice: { type: Boolean, default: false },
    isTrending: { type: Boolean, default: false },
    isLatest: { type: Boolean, default: false },
    isPopular: { type: Boolean, default: false },
    isTop: { type: Boolean, default: false },
    isBreaking: { type: Boolean, default: false },
    pushedToTelegram: { type: Boolean, default: false },
    pushedToTelegramAt: Date,
    telegramMessageId: Number,
    telegramMessageLink: String,
    telegramPushStatus: { type: String, enum: ['sent', 'failed'] },
    telegramPushReason: String,
    telegramLastAttemptAt: Date,
    videoUrl: String,
    audioSource: { type: String, enum: ['local', 'external'] },
    audioUrl: String,
    createdBy: {
      userId: { type: String },
      name: { type: String },
    },
  },
  { timestamps: true }
)

NewsSchema.index({ categorySlug: 1 })
NewsSchema.index({ categoryId: 1 })
NewsSchema.index({ themeId: 1 })
NewsSchema.index({ status: 1, publishedAt: -1 })
NewsSchema.index({ tagIds: 1 })
NewsSchema.index({ tagSlugs: 1 })
NewsSchema.index({ authorId: 1 })
NewsSchema.index({ telegramMessageId: 1 })

const existingNewsModel = models.News
if (
  existingNewsModel &&
  (
    !existingNewsModel.schema.path('themeId') ||
    !existingNewsModel.schema.path('categoryId') ||
    !existingNewsModel.schema.path('tagIds') ||
    !existingNewsModel.schema.path('authorId')
  )
) {
  delete models.News
}

export const NewsModel = models.News || model<INews>('News', NewsSchema)
