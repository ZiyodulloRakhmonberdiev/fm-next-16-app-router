import mongoose, { Schema, model } from "mongoose"
import { v4 as uuidv4 } from "uuid"

export interface ITeamMember {
  _id: string
  /** Guvohnoma raqami — matn (BSON string) */
  certificateNumber: string
  image?: string | null
  fullName: string
  position: string
  qrCode?: string | null
  badgeImage?: string | null
  createdAt: Date
  updatedAt: Date
}

const TeamMemberSchema = new Schema<ITeamMember>(
  {
    _id: { type: String, required: true, default: () => uuidv4() },
    certificateNumber: {
      type: String,
      required: true,
      default: "",
      maxlength: 24,
      index: true,
    },
    image: { type: String },
    fullName: { type: String, required: true },
    position: { type: String, required: true },
    qrCode: { type: String },
    badgeImage: { type: String },
  },
  { timestamps: true }
)

/** Next.js dev: eski skema keshlangan bo'lsa yangi maydonlar ishlamaydi */
if (mongoose.models.TeamMember) {
  delete mongoose.models.TeamMember
}

export const TeamMemberModel = model<ITeamMember>("TeamMember", TeamMemberSchema)
