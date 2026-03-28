import { AdminLogModel, type AdminActionType } from '../model/admin-log.model'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/shared/common/lib/auth-options'
import { dbConnect } from '@/shared/common/lib/db'
import type { UserRole } from '@/features/users/model/user.model'

interface LogOptions {
  action: AdminActionType
  targetId?: string
  targetName?: string
  details?: string
}

/**
 * Ushbu funksiya Next.js API route yoki Server action ichidan chaqirilishi kerak.
 * U avtomatik ravishda hozirgi API/Server Action'ning `getServerSession` id'sini oladi
 * va background tarzda (await qilish majburiy emas) bazaga log ulaydi.
 */
export async function logAdminAction({ action, targetId, targetName, details }: LogOptions): Promise<void> {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) return // Tizimda kimdir o'zgartirmadi yoki topilmadi

    // Foydalanuvchi joriy roli (any/string hack for session reading if TS complains)
    const role = (session.user as any)?.role as UserRole | undefined
    
    // session name format
    let userName = session.user.name || (session.user as any)?.login || "Noma'lum"

    await dbConnect()
    
    // Asynchronously create the log so it doesn't block the caller too much
    await AdminLogModel.create({
      userId: session.user.id,
      userName,
      userRole: role,
      action,
      targetId,
      targetName,
      details,
    })
  } catch (err) {
    // Log yozolmaganiga qarab asosiy action to'xtamasligi lozim, faqat console da ko'rinadi
    console.error('[logAdminAction error]', err)
  }
}
