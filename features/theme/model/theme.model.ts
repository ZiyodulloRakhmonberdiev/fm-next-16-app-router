import { Schema, models, model } from "mongoose"
import { v4 as uuidv4 } from "uuid"
import type { LocaleMap } from "@/shared/common/lib/locale-types"

export type ThemeStatus = "active" | "inactive"

export interface ITheme {
  _id: string
  slug: string
  name: LocaleMap
  subtitle: LocaleMap
  description: LocaleMap
  /** 300x300 logo/avatar (public URL) */
  imageUrl?: string
  showInHomePage?: boolean
  /** Home sahifasidagi yuqori themes scroller’da ko‘rsatish */
  showInHomeList?: boolean
  status: ThemeStatus
  createdAt: Date
  updatedAt: Date
}

const ThemeSchema = new Schema<ITheme>(
  {
    _id: { type: String, required: true, default: () => uuidv4() },
    slug: { type: String, required: true, unique: true },
    name: {
      uz: { type: String, required: true },
      uzb: { type: String, required: true },
      ru: { type: String, required: true },
      en: { type: String, required: true },
    },
    subtitle: {
      uz: { type: String, default: "" },
      uzb: { type: String, default: "" },
      ru: { type: String, default: "" },
      en: { type: String, default: "" },
    },
    description: {
      uz: { type: String, default: "" },
      uzb: { type: String, default: "" },
      ru: { type: String, default: "" },
      en: { type: String, default: "" },
    },
    imageUrl: { type: String, default: "" },
    showInHomePage: { type: Boolean, default: false },
    showInHomeList: { type: Boolean, default: false },
    status: {
      type: String,
      enum: ["active", "inactive"],
      default: "active",
      required: true,
    },
  },
  { timestamps: true }
)

ThemeSchema.index({ status: 1, createdAt: -1 })

const existingThemeModel = models.Theme
if (
  existingThemeModel &&
  (
    !existingThemeModel.schema.path("subtitle") ||
    !existingThemeModel.schema.path("description") ||
    !existingThemeModel.schema.path("imageUrl") ||
    !existingThemeModel.schema.path("showInHomePage") ||
    !existingThemeModel.schema.path("showInHomeList")
  )
) {
  delete models.Theme
}

export const ThemeModel = models.Theme || model<ITheme>("Theme", ThemeSchema)

