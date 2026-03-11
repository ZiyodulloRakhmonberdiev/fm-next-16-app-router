import { Schema, models, model } from 'mongoose'
import { v4 as uuidv4 } from 'uuid'
import type { LocaleMap } from '@/shared/common/lib/locale-types'

export interface ICategory {
  _id: string
  slug: string
  href: string
  name: LocaleMap
  priority: number
  createdAt: Date
  updatedAt: Date
}

const CategorySchema = new Schema<ICategory>(
  {
    _id: { type: String, required: true, unique: true, default: () => uuidv4() },
    slug: { type: String, required: true, unique: true },
    href: { type: String, required: true },
    name: {
      uz: { type: String, required: true },
      uzb: { type: String, required: true },
      ru: { type: String, required: true },
      en: { type: String, required: true },
    },
    priority: { type: Number, default: 0 },
  },
  { timestamps: true }
)

export const CategoryModel =
  models.Category || model<ICategory>('Category', CategorySchema)
