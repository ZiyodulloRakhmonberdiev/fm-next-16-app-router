import { z } from 'zod'

const localeMapSchema = z.object({
  uz: z.string().min(1, "O'zbekcha nomi majburiy").max(128, "O'zbekcha nomi 128 ta belgidan oshmasligi kerak"),
  uzb: z.string().min(1, 'Kirill nomi majburiy').max(128, 'Kirill nomi 128 ta belgidan oshmasligi kerak'),
  ru: z.string().min(1, 'Ruscha nomi majburiy').max(128, 'Ruscha nomi 128 ta belgidan oshmasligi kerak'),
  en: z.string().min(1, 'Inglizcha nomi majburiy').max(128, 'Inglizcha nomi 128 ta belgidan oshmasligi kerak'),
})

export const createCategorySchema = z.object({
  slug: z
    .string()
    .min(2, 'Slug kamida 2 ta belgi bo\'lishi kerak')
    .max(64, 'Slug 64 ta belgidan oshmasligi kerak')
    .regex(/^[a-z0-9-]+$/, 'Slug faqat kichik harflar, raqamlar va chiziqcha bo\'lishi mumkin'),
  href: z
    .string()
    .min(1, 'Havola majburiy').max(128, 'Havola 128 ta belgidan oshmasligi kerak')
    .max(256, 'Havola 256 ta belgidan oshmasligi kerak'),
  name: localeMapSchema,
  priority: z.number().int().default(0),
})

export type CreateCategoryInput = z.infer<typeof createCategorySchema>
