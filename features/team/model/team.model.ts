import { Schema, model, models } from "mongoose"
import { v4 as uuidv4 } from "uuid"

export interface ITeamMember {
  _id: string
  order: number
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
    order: { type: Number, required: true, default: 0, index: true },
    image: { type: String },
    fullName: { type: String, required: true },
    position: { type: String, required: true },
    qrCode: { type: String },
    badgeImage: { type: String },
  },
  { timestamps: true }
)

export const TeamMemberModel =
  models.TeamMember || model<ITeamMember>("TeamMember", TeamMemberSchema)