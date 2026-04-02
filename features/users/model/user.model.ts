import { Schema, models, model } from 'mongoose'
import { v4 as uuidv4 } from 'uuid'
import type { LocaleMap } from '@/shared/common/lib/locale-types'

export type UserRole = 'ceo' | 'administrator' | 'moderator' | 'ads_manager' | 'user'

export interface IUser {
  _id: string
  full_name: string | LocaleMap
  description?: LocaleMap
  image?: string | null
  role: UserRole
  position?: string
  login: string
  password: string
  createdAt: Date
  updatedAt: Date
}

const UserSchema = new Schema<IUser>(
  {
    _id: { type: String, required: true, default: () => uuidv4() },
    full_name: { type: Schema.Types.Mixed, required: true },
    description: { type: Schema.Types.Mixed },
    image: String,
    role: { type: String, required: true },
    position: String,
    login: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },    
  },
  { timestamps: true }
)

export const UserModel =
  models.User || model<IUser>('User', UserSchema)