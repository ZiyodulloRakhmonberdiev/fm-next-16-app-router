import { Schema, model, models } from "mongoose"
import { v4 as uuidv4 } from "uuid"

export type ContactTelegramStatus = "pending" | "sent" | "failed"
export type ContactAdminStatus = "new" | "in_progress" | "resolved" | "archived"

export interface IContactMessage {
  _id: string
  firstName: string
  lastName?: string
  email: string
  phoneCode?: string
  phoneNumber?: string
  message: string
  locale?: string
  source: "contact-page"
  adminStatus: ContactAdminStatus
  handledByUserId?: string
  handledByUserName?: string
  handledAt?: Date
  telegramStatus: ContactTelegramStatus
  telegramMessageId?: number
  telegramError?: string
  createdAt: Date
  updatedAt: Date
}

const ContactMessageSchema = new Schema<IContactMessage>(
  {
    _id: { type: String, required: true, default: () => uuidv4() },
    firstName: { type: String, required: true, trim: true },
    lastName: { type: String, trim: true },
    email: { type: String, required: true, trim: true, lowercase: true, index: true },
    phoneCode: { type: String, trim: true },
    phoneNumber: { type: String, trim: true },
    message: { type: String, required: true, trim: true },
    locale: { type: String, trim: true },
    source: {
      type: String,
      enum: ["contact-page"],
      default: "contact-page",
      required: true,
    },
    adminStatus: {
      type: String,
      enum: ["new", "in_progress", "resolved", "archived"],
      default: "new",
      index: true,
    },
    handledByUserId: String,
    handledByUserName: String,
    handledAt: Date,
    telegramStatus: {
      type: String,
      enum: ["pending", "sent", "failed"],
      default: "pending",
      index: true,
    },
    telegramMessageId: Number,
    telegramError: String,
  },
  { timestamps: true }
)

ContactMessageSchema.index({ createdAt: -1 })

export const ContactMessageModel =
  models.ContactMessage || model<IContactMessage>("ContactMessage", ContactMessageSchema)
