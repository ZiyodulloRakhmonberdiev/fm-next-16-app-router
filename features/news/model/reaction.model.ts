import { Schema, models, model } from "mongoose"
import { v4 as uuidv4 } from "uuid"

export type ReactionType = "like" | "love" | "laugh" | "sad" | "angry"

export interface INewsReaction {
  _id: string
  newsSlug: string
  userId?: string
  anonId?: string
  userKey: string
  userName: string
  type: ReactionType
  createdAt: Date
  updatedAt: Date
}

const NewsReactionSchema = new Schema<INewsReaction>(
  {
    _id: { type: String, required: true, unique: true, default: () => uuidv4() },
    newsSlug: { type: String, required: true, index: true },
    userId: { type: String, index: true },
    anonId: { type: String, index: true },
    userKey: { type: String, required: true, index: true },
    userName: { type: String, required: true },
    type: {
      type: String,
      enum: ["like", "love", "laugh", "sad", "angry"],
      required: true,
      index: true,
    },
  },
  { timestamps: true }
)

NewsReactionSchema.index({ newsSlug: 1, userKey: 1 }, { unique: true })

export const NewsReactionModel =
  models.NewsReaction || model<INewsReaction>("NewsReaction", NewsReactionSchema)
