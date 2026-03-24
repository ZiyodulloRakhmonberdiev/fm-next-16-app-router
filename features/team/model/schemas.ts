import { z } from "zod"

const imageLikeSchema = z.string().min(1, "Rasm URL noto'g'ri")

const CERT_MAX = 24

/** Har qanday JSON qiymatni stringga o'tkazadi (matn input uchun) */
function toCertString(v: unknown): string {
  if (v === undefined || v === null) return ""
  return String(v)
}

const optionalImageField = z.union([imageLikeSchema, z.literal("")]).optional()

/**
 * Bodyda `certificateNumber` yoki (eski) `order` — ikkovidan biri; bazaga faqat string `certificateNumber`.
 */
export const createTeamMemberSchema = z
  .object({
    certificateNumber: z.unknown().optional(),
    order: z.unknown().optional(),
    fullName: z.string().min(1, "To'liq ism majburiy"),
    position: z.string().min(1, "Lavozim majburiy"),
    image: z.union([imageLikeSchema, z.literal("")]).optional(),
    qrCode: z.union([imageLikeSchema, z.literal("")]).optional(),
    badgeImage: z.union([imageLikeSchema, z.literal("")]).optional(),
  })
  .transform((d) => {
    const preferCert =
      d.certificateNumber !== undefined && d.certificateNumber !== null
    const raw = preferCert ? d.certificateNumber : d.order
    const certificateNumber = toCertString(raw)
    return {
      fullName: d.fullName,
      position: d.position,
      certificateNumber,
      image: d.image,
      qrCode: d.qrCode,
      badgeImage: d.badgeImage,
    }
  })
  .superRefine((d, ctx) => {
    if (d.certificateNumber.length > CERT_MAX) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: `Guvohnoma raqami ko'pi bilan ${CERT_MAX} belgi`,
        path: ["certificateNumber"],
      })
    }
  })

export const updateTeamMemberSchema = z
  .object({
    certificateNumber: z.unknown().optional(),
    order: z.unknown().optional(),
    image: optionalImageField,
    fullName: z.string().min(1).optional(),
    position: z.string().min(1).optional(),
    qrCode: optionalImageField,
    badgeImage: optionalImageField,
  })
  .transform((d) => {
    const { certificateNumber: c, order: o, ...rest } = d
    const hasCert = c !== undefined
    const hasOrder = o !== undefined
    if (!hasCert && !hasOrder) {
      return { ...rest }
    }
    const raw = hasCert ? c : o
    return {
      ...rest,
      certificateNumber: toCertString(raw),
    }
  })
  .superRefine((d, ctx) => {
    if (
      typeof d.certificateNumber === "string" &&
      d.certificateNumber.length > CERT_MAX
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: `Guvohnoma raqami ko'pi bilan ${CERT_MAX} belgi`,
        path: ["certificateNumber"],
      })
    }
  })
