import { z } from "zod"

const localeMapSchema = z.object({
  uz: z.string().min(1, "O'zbekcha nomi majburiy").max(128, "O'zbekcha nomi 128 ta belgidan oshmasligi kerak"),
  uzb: z.string().min(1, "Kirill nomi majburiy").max(128, "Kirill nomi 128 ta belgidan oshmasligi kerak"),
  ru: z.string().min(1, "Ruscha nomi majburiy").max(128, "Ruscha nomi 128 ta belgidan oshmasligi kerak"),
  en: z.string().min(1, "Inglizcha nomi majburiy").max(128, "Inglizcha nomi 128 ta belgidan oshmasligi kerak"),
})

/** Title (`name`) 4 tilda majburiy; subtitle/description bo'sh qoldirilishi mumkin. */
const localeSubtitleSchema = z.object({
  uz: z.string().max(256, "O'zbekcha subtitle 256 ta belgidan oshmasligi kerak"),
  uzb: z.string().max(256, "Kirill subtitle 256 ta belgidan oshmasligi kerak"),
  ru: z.string().max(256, "Ruscha subtitle 256 ta belgidan oshmasligi kerak"),
  en: z.string().max(256, "Inglizcha subtitle 256 ta belgidan oshmasligi kerak"),
})

const localeDescriptionSchema = z.object({
  uz: z.string().max(4000, "O'zbekcha description juda uzun"),
  uzb: z.string().max(4000, "Kirill description juda uzun"),
  ru: z.string().max(4000, "Ruscha description juda uzun"),
  en: z.string().max(4000, "Inglizcha description juda uzun"),
})

export const themeStatusSchema = z.enum(["active", "inactive"])

export const createThemeSchema = z.object({
  slug: z
    .string()
    .min(2, "Slug kamida 2 ta belgi bo'lishi kerak")
    .max(64, "Slug 64 ta belgidan oshmasligi kerak")
    .regex(/^[a-z0-9-]+$/, "Slug faqat kichik harflar, raqamlar va chiziqcha bo'lishi mumkin"),
  name: localeMapSchema,
  subtitle: localeSubtitleSchema,
  description: localeDescriptionSchema,
  showInHomePage: z.boolean().default(false),
  status: themeStatusSchema.default("active"),
})

export type CreateThemeInput = z.infer<typeof createThemeSchema>

