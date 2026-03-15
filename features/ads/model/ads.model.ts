import { Schema, models, model } from "mongoose"
import { v4 as uuidv4 } from "uuid"

export type AdPlacement =
  | "header_top_full"
  | "sidebar_widget"
  | "home_bottom_full"
  | "article_bottom_full"

export type AdType = "content" | "image"

export interface IAd {
  _id: string
  type: AdType
  placement: AdPlacement
  media?: string | string[]
  mediaMobile?: string | string[]
  logo?: string
  siteName?: string
  title?: string
  description?: string
  links: Array<{
    label: string
    href: string
  }>
  adUrl?: string
  advertiserUrl?: string
  adInfoUrl?: string
  advertiseWithUsUrl?: string
  active: boolean
  priority: number
  displaySeconds: number
  startAt?: Date
  endAt?: Date
  createdAt: Date
  updatedAt: Date
}

const AdSchema = new Schema<IAd>(
  {
    _id: { type: String, required: true, unique: true, default: () => uuidv4() },
    type: { type: String, enum: ["content", "image"], default: "content", required: true },
    placement: {
      type: String,
      enum: ["header_top_full", "sidebar_widget", "home_bottom_full", "article_bottom_full"],
      required: true,
    },
    media: [String],
    mediaMobile: [String],
    logo: String,
    siteName: String,
    title: String,
    description: String,
    links: {
      type: [
        new Schema(
          {
            label: { type: String, required: true },
            href: { type: String, required: true },
          },
          { _id: false }
        ),
      ],
      default: [],
    },
    adUrl: String,
    advertiserUrl: String,
    adInfoUrl: String,
    advertiseWithUsUrl: String,
    active: { type: Boolean, default: true },
    priority: { type: Number, default: 0 },
    displaySeconds: { type: Number, default: 12, min: 3, max: 120 },
    startAt: Date,
    endAt: Date,
  },
  { timestamps: true }
)

AdSchema.index({ placement: 1, active: 1, priority: -1 })

export const AdModel = models.Ad || model<IAd>("Ad", AdSchema)
