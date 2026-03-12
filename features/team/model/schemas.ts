import { z } from "zod"

const imageLikeSchema = z.string().min(1, "Rasm URL noto'g'ri")

export const createTeamMemberSchema = z.object({
  order: z.number().int().min(0).default(0),
  image: imageLikeSchema.optional().or(z.literal("")),
  fullName: z.string().min(1, "To'liq ism majburiy"),
  position: z.string().min(1, "Lavozim majburiy"),
  qrCode: imageLikeSchema.optional().or(z.literal("")),
  badgeImage: imageLikeSchema.optional().or(z.literal("")),
})

export const updateTeamMemberSchema = createTeamMemberSchema.partial()