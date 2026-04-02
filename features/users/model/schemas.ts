import { z } from 'zod'

export const userRoleSchema = z.enum(['ceo', 'administrator', 'moderator', 'ads_manager', 'user'])

const fullNameLocaleSchema = z.object({
  uz: z.string().max(128, "To‘liq ism 128 ta belgidan oshmasligi kerak"),
  uzb: z.string().max(128, "To‘liq ism 128 ta belgidan oshmasligi kerak"),
  ru: z.string().max(128, "To‘liq ism 128 ta belgidan oshmasligi kerak"),
  en: z.string().max(128, "To‘liq ism 128 ta belgidan oshmasligi kerak"),
})

const descriptionLocaleSchema = z.object({
  uz: z.string().max(512, "Tavsif 512 ta belgidan oshmasligi kerak"),
  uzb: z.string().max(512, "Tavsif 512 ta belgidan oshmasligi kerak"),
  ru: z.string().max(512, "Tavsif 512 ta belgidan oshmasligi kerak"),
  en: z.string().max(512, "Tavsif 512 ta belgidan oshmasligi kerak"),
})

const fullNameSchema = z
  .union([
    z
      .string()
      .min(3, "To‘liq ism kamida 3 ta belgi bo‘lishi kerak")
      .max(128, "To‘liq ism 128 ta belgidan oshmasligi kerak"),
    fullNameLocaleSchema,
  ])
  .refine((value) => {
    if (typeof value === 'string') return value.trim().length >= 3
    return Object.values(value).some((v) => v.trim().length >= 3)
  }, "To‘liq ism kamida bitta tilda 3+ belgi bo‘lishi kerak")

export const baseUserSchema = z.object({
  full_name: fullNameSchema,
  description: descriptionLocaleSchema.optional(),
  image: z
    .string()
    .url('Rasm URL noto‘g‘ri')
    .optional()
    .nullable(),
  role: userRoleSchema,
  position: z
    .string()
    .max(128, 'Lavozim 128 ta belgidan oshmasligi kerak')
    .optional()
    .nullable(),
  login: z
    .string()
    .min(3, 'Login kamida 3 ta belgi bo‘lishi kerak')
    .max(64, 'Login 64 ta belgidan oshmasligi kerak'),
  password: z
    .string()
    .min(6, 'Parol kamida 6 ta belgi bo‘lishi kerak')
    .max(128, 'Parol 128 ta belgidan oshmasligi kerak'),
})

export const createUserSchema = baseUserSchema

export type CreateUserInput = z.infer<typeof createUserSchema>

