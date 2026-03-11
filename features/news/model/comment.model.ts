import { Schema, models, model } from "mongoose"
import { v4 as uuidv4 } from "uuid"

export type CommentStatus = "pending" | "confirmed" | "rejected" | "approved"

export interface INewsComment {
  _id: string
  newsSlug: string
  userId: string
  userName: string
  userLogin?: string
  userPosition?: string
  userImage?: string | null
  content: string
  status: CommentStatus
  confirmedAt?: Date
  replyToCommentId?: string
  replyToUserLogin?: string
  createdAt: Date
  updatedAt: Date
}

const NewsCommentSchema = new Schema<INewsComment>(
  {
    _id: { type: String, required: true, unique: true, default: () => uuidv4() },
    newsSlug: { type: String, required: true, index: true },
    userId: { type: String, required: true, index: true },
    userName: { type: String, required: true },
    userLogin: String,
    userPosition: String,
    userImage: String,
    content: { type: String, required: true },
    status: {
      type: String,
      enum: ["pending", "confirmed", "rejected", "approved"],
      default: "pending",
      index: true,
    },
    confirmedAt: Date,
    replyToCommentId: String,
    replyToUserLogin: String,
  },
  { timestamps: true }
)

export const NewsCommentModel =
  models.NewsComment || model<INewsComment>("NewsComment", NewsCommentSchema)
