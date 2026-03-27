import { z } from "zod"

export const adPlacementSchema = z.enum([
  "header_top_full",
  "sidebar_widget",
  "home_bottom_full",
  "article_bottom_full",
])

export const adTypeSchema = z.enum(["content", "image"])

export const createAdSchemaInput = z.object({
  type: adTypeSchema.default("content"),
  placement: adPlacementSchema.optional(),
  placements: z
    .union([adPlacementSchema, z.array(adPlacementSchema).min(1)])
    .optional()
    .transform((v) => {
      if (!v) return undefined
      return Array.isArray(v) ? v : [v]
    }),
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

export const createAdSchema = createAdSchemaInput.superRefine((value, ctx) => {
  const hasPlacement = Boolean(value.placement)
  const hasPlacements = Array.isArray(value.placements) && value.placements.length > 0
  if (!hasPlacement && !hasPlacements) {
    ctx.addIssue({
      code: "custom",
      path: ["placements"],
      message: "Kamida bitta placement tanlang",
    })
  }
}).transform((value) => {
  const source = (value.placements?.length ? value.placements : value.placement ? [value.placement] : []) as Array<
    z.infer<typeof adPlacementSchema>
  >
  const placements = Array.from(new Set(source))
  return {
    ...value,
    placements,
    placement: placements[0] ?? "header_top_full",
  }
})

export type CreateAdInput = z.infer<typeof createAdSchema>
