import { Schema, model, models } from "mongoose"
import { v4 as uuidv4 } from "uuid"

type FeedbackAction = "hide" | "report"

export interface IAdFeedback {
  _id: string
  adId: string
  action: FeedbackAction
  reason: string
  placement?: string
  createdAt: Date
  updatedAt: Date
}

const AdFeedbackSchema = new Schema<IAdFeedback>(
  {
    _id: { type: String, required: true, unique: true, default: () => uuidv4() },
    adId: { type: String, required: true, index: true },
    action: { type: String, required: true, enum: ["hide", "report"] },
    reason: { type: String, required: true },
    placement: { type: String },
  },
  { timestamps: true }
)

export const AdFeedbackModel =
  models.AdFeedback || model<IAdFeedback>("AdFeedback", AdFeedbackSchema)
