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
    !existingThemeModel.schema.path("description")
  )
) {
  delete models.Theme
}

export const ThemeModel = models.Theme || model<ITheme>("Theme", ThemeSchema)

