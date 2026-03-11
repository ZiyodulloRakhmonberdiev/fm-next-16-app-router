import { z } from 'zod'

export const userRoleSchema = z.enum(['ceo', 'administrator', 'moderator', 'ads-manager', 'ads_manager', 'user'])

export const baseUserSchema = z.object({
  full_name: z
    .string()
    .min(3, "To‘liq ism kamida 3 ta belgi bo‘lishi kerak")
    .max(128, "To‘liq ism 128 ta belgidan oshmasligi kerak"),
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

