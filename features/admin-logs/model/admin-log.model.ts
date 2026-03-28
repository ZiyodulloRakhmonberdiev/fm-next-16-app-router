import { Schema, models, model } from 'mongoose'
import { v4 as uuidv4 } from 'uuid'
import type { UserRole } from '@/features/users/model/user.model'

export type AdminActionType =
  | 'CREATE_NEWS'
  | 'UPDATE_NEWS'
  | 'DELETE_NEWS'
  | 'CREATE_CATEGORY'
  | 'UPDATE_CATEGORY'
  | 'DELETE_CATEGORY'
  | 'CREATE_USER'
  | 'UPDATE_USER'
  | 'DELETE_USER'
  | 'UPDATE_SETTINGS'
  | 'OTHER'

export interface IAdminLog {
  _id: string
  userId: string
  userName: string
  userRole?: UserRole | string
  action: AdminActionType
  targetId?: string
  targetName?: string // e.g. News title or Category name
  details?: string // any extra info
  createdAt: Date
}

const AdminLogSchema = new Schema<IAdminLog>(
  {
    _id: { type: String, required: true, default: () => uuidv4() },
    userId: { type: String, required: true, index: true },
    userName: { type: String, required: true },
    userRole: { type: String },
    action: { type: String, required: true, index: true },
    targetId: { type: String, index: true },
    targetName: { type: String },
    details: { type: String },
    createdAt: { type: Date, default: Date.now, expires: 60 * 60 * 24 * 90 }, // 90 kun (3 oy) TTL
  },
  { timestamps: false }
)

export const AdminLogModel = models.AdminLog || model<IAdminLog>('AdminLog', AdminLogSchema)
