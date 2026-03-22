import { Schema, models, model } from 'mongoose'
import { v4 as uuidv4 } from 'uuid'
import type { LocaleMap } from '@/shared/common/lib/locale-types'

export interface ITag {
  _id: string
  slug: string
  name: LocaleMap
  createdAt: Date
  updatedAt: Date
}

const TagSchema = new Schema<ITag>(
  {
    _id: { type: String, required: true, default: () => uuidv4() },
    slug: { type: String, required: true, unique: true },
    name: {
      uz: { type: String, required: true },
      uzb: { type: String, required: true },
      ru: { type: String, required: true },
      en: { type: String, required: true },
    },
  },
  { timestamps: true }
)

export const TagModel =
  models.Tag || model<ITag>('Tag', TagSchema)
