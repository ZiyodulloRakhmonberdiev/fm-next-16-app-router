import { z } from "zod"

export const adPlacementSchema = z.enum([
  "header_top_full",
  "sidebar_widget",
  "home_bottom_full",
  "article_bottom_full",
])

export const adTypeSchema = z.enum(["content", "image"])

export const createAdSchema = z.object({
  type: adTypeSchema.default("content"),
  placement: adPlacementSchema.default("header_top_full"),
  media: z
    .union([
      z.string().min(1, "Media majburiy"),
      z.array(z.string().min(1, "Media URL majburiy")).min(1, "Kamida bitta media").max(10, "Maksimum 10 ta media"),
    ])
    .transform((v) => (Array.isArray(v) ? v : [v])),
  mediaMobile: z
    .union([
      z.string().min(1),
      z.array(z.string().min(1)).max(10),
    ])
    .optional()
    .transform((v) => (v == null || (Array.isArray(v) && v.length === 0) ? undefined : Array.isArray(v) ? v : [v])),
  adUrl: z.string().min(1, "Reklama URL majburiy"),
  logo: z.string().min(1, "Logo majburiy"),
  siteName: z.string().min(1, "Sayt nomi majburiy"),
  title: z.string().min(1, "Sarlavha majburiy"),
  description: z.string().min(1, "Tavsif majburiy"),
  links: z
    .array(
      z.object({
        label: z.string().optional().default(""),
        href: z.string().optional().default(""),
      })
    )
    .default([])
    .transform((arr) => arr.filter((l) => (l.label ?? "").trim() && (l.href ?? "").trim())),
  advertiserUrl: z.string().optional().or(z.literal("")),
  adInfoUrl: z.string().optional().or(z.literal("")),
  advertiseWithUsUrl: z.string().optional().or(z.literal("")),
  active: z.boolean().default(true),
  priority: z.coerce.number().int().default(0),
  displaySeconds: z.coerce.number().int().min(3).max(120).default(12),
  startAt: z.coerce.date().optional(),
  endAt: z.coerce.date().optional(),
})

export type CreateAdInput = z.infer<typeof createAdSchema>
