import { Schema, models, model } from "mongoose"
import { v4 as uuidv4 } from "uuid"

export interface ISavedNews {
  _id: string
  userId: string
  newsId: string
  newsSlug?: string
  createdAt: Date
  updatedAt: Date
}

const SavedNewsSchema = new Schema<ISavedNews>(
  {
    _id: { type: String, required: true, unique: true, default: () => uuidv4() },
    userId: { type: String, required: true, index: true },
    newsId: { type: String, required: true, index: true },
    newsSlug: { type: String, index: true },
  },
  { timestamps: true }
)

SavedNewsSchema.index({ userId: 1, newsId: 1 }, { unique: true })

export const SavedNewsModel = models.SavedNews || model<ISavedNews>("SavedNews", SavedNewsSchema)