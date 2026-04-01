import { z } from 'zod'

const richContentBlockSchema = z.discriminatedUnion('type', [
  z.object({ type: z.literal('paragraph'), text: z.string() }),
  z.object({ type: z.literal('image'), src: z.string(), alt: z.string().optional() }),
  z.object({
    type: z.literal('video'),
    source: z.enum(['local', 'youtube']),
    url: z.string(),
    poster: z.string().optional(),
  }),
  z.object({ type: z.literal('quote'), text: z.string(), author: z.string().optional() }),
  z.object({ type: z.literal('link'), href: z.string(), text: z.string() }),
  z.object({ type: z.literal('youtube'), url: z.string() }),
])

const newsContentSchema = z.union([
  z.string(),
  z.array(richContentBlockSchema),
])

const newsTitleLocaleSchema = z.object({
  uz: z.string().min(1, "O'zbekcha sarlavha majburiy"),
  uzb: z.string().optional(),
  ru: z.string().optional(),
  en: z.string().optional(),
})

const newsOptionalLocaleStringSchema = z
  .object({
    uz: z.string().optional(),
    uzb: z.string().optional(),
    ru: z.string().optional(),
    en: z.string().optional(),
  })
  .optional()

const newsOptionalLocaleContentSchema = z
  .object({
    uz: newsContentSchema.optional(),
    uzb: newsContentSchema.optional(),
    ru: newsContentSchema.optional(),
    en: newsContentSchema.optional(),
  })
  .optional()

export const newsStatusSchema = z.enum([
  'pending',
  'published',
  'cancelled',
  'deleted',
  'archived',
])

const imageUrlSchema = z
  .string()
  .min(1, "Rasm URL noto'g'ri")

export const createNewsSchema = z.object({
  slug: z
    .string()
    .min(1, 'Slug majburiy')
    .max(256, 'Slug 256 ta belgidan oshmasligi kerak')
    .regex(/^[a-z0-9-]+$/, "Slug faqat kichik harflar, raqamlar va chiziqcha bo'lishi mumkin"),
  title: newsTitleLocaleSchema,
  description: newsOptionalLocaleStringSchema,
  content: newsOptionalLocaleContentSchema,
  categoryId: z.string().min(1, 'Kategoriya majburiy'),
  themeId: z.string().min(1, 'Tema noto\'g\'ri').nullable().optional(),
  tagIds: z.array(z.string()).default([]),
  images: z.array(imageUrlSchema).default([]),
  authorId: z.string().optional().nullable(),
  minutes: z.number().int().min(0).default(3),
  views: z.number().int().min(0).default(0),
  publishedAt: z.coerce.date().optional(),
  status: newsStatusSchema.default('pending'),
  type: z.string().optional(),
  hasText: z.boolean().optional(),
  hasImage: z.boolean().optional(),
  hasVideo: z.boolean().optional(),
  hasAudio: z.boolean().optional(),
  authorsChoice: z.boolean().default(false),
  isTrending: z.boolean().default(false),
  isLatest: z.boolean().default(false),
  isPopular: z.boolean().default(false),
  isTop: z.boolean().default(false),
  isBreaking: z.boolean().default(false),
  ad: z.boolean().default(false),
  stats: z.boolean().default(false),
  pushedToTelegram: z.boolean().default(false),
  pushedToTelegramAt: z.coerce.date().optional(),
  telegramMessageId: z.number().int().optional(),
  telegramMessageLink: z.string().url().optional(),
  telegramPushStatus: z.enum(['sent', 'failed']).optional(),
  telegramPushReason: z.string().optional(),
  telegramLastAttemptAt: z.coerce.date().optional(),
  videoSource: z.enum(['youtube', 'local']).optional().nullable(),
  // To'liq URL (Cloudinary, YouTube) yoki relative yo'l (/uploads/videos/...)
  videoUrl: z
    .string()
    .min(1, "Video URL bo'sh bo'lmasligi kerak")
    .refine(
      (v) => v.startsWith("/") || v.startsWith("http://") || v.startsWith("https://"),
      "Video URL to'liq (http/https) yoki / bilan boshlanuvchi yo'l bo'lishi kerak"
    )
    .optional()
    .nullable(),
  videoCaption: z.string().optional(),
  audioSource: z.enum(['local', 'external']).optional().nullable(),
  audioUrl: z
    .string()
    .min(1, "Audio URL bo'sh bo'lmasligi kerak")
    .optional()
    .nullable(),
  audioCaption: z.string().optional(),
  imageCaption: z.string().optional(),
})

export type CreateNewsInput = z.infer<typeof createNewsSchema>
