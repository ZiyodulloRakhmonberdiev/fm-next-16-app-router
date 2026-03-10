import { z } from 'zod'

const localeMapSchema = z.object({
  uz: z.string().min(1, "O'zbekcha nomi majburiy"),
  uzb: z.string().min(1, 'Kirill nomi majburiy'),
  ru: z.string().min(1, 'Ruscha nomi majburiy'),
  en: z.string().min(1, 'Inglizcha nomi majburiy'),
})

export const createTagSchema = z.object({
  slug: z
    .string()
    .min(1, 'Slug majburiy')
    .max(64, 'Slug 64 ta belgidan oshmasligi kerak')
    .regex(/^[a-z0-9-]+$/, 'Slug faqat kichik harflar, raqamlar va chiziqcha bo\'lishi mumkin'),
  name: localeMapSchema,
})

export type CreateTagInput = z.infer<typeof createTagSchema>
