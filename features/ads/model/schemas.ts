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
  placement: adPlacementSchema,
  media: z.string().min(1, "Media majburiy"),
  adUrl: z.string().min(1, "Reklama URL majburiy"),
  logo: z.string().min(1, "Logo majburiy"),
  siteName: z.string().min(1, "Sayt nomi majburiy"),
  title: z.string().min(1, "Sarlavha majburiy"),
  description: z.string().min(1, "Tavsif majburiy"),
  links: z.array(
    z.object({
      label: z.string().min(1, "Link nomi majburiy"),
      href: z.string().min(1, "Link href majburiy"),
    })
  ).default([]),
  advertiserUrl: z.string().optional().or(z.literal("")),
  adInfoUrl: z.string().optional().or(z.literal("")),
  advertiseWithUsUrl: z.string().optional().or(z.literal("")),
  active: z.boolean().default(true),
  priority: z.number().int(),
  displaySeconds: z.number().int().min(3).max(120),
  startAt: z.coerce.date().optional(),
  endAt: z.coerce.date().optional(),
})

export type CreateAdInput = z.infer<typeof createAdSchema>
