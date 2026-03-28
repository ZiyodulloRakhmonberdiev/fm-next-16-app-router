import { NextRequest } from 'next/server'
import { requireAdminSession } from '@/shared/server/require-admin-session'
import { dbConnect } from '@/shared/common/lib/db'
import { runDatabaseBackupTask } from '@/shared/infra/database-backup'
import {
  SiteSettingsModel,
  SITE_SETTINGS_DOCUMENT_ID,
} from '@/features/dashboard/configs/site-settings.model'

export const runtime = 'nodejs'
/** Manuel backup uchun max qilib beramiz */
export const maxDuration = 300

export async function POST(req: NextRequest) {
  const unauthorized = await requireAdminSession(['ceo', 'administrator'])
  if (unauthorized) return unauthorized

  try {
    await dbConnect()

    const settings = await SiteSettingsModel.findById(SITE_SETTINGS_DOCUMENT_ID).lean()
    const backupSettings = settings?.databaseBackup || {
      enabled: false,
      botToken: '',
      chatId: '',
      threadId: '',
    }

    // Manual backup uchun opts.requireScheduledEnabled = false (enabled ni tekshirmaymiz, faqat tokenlarni tekshiramiz)
    const result = await runDatabaseBackupTask(backupSettings as any, {
      requireScheduledEnabled: false,
    })

    if (result.status === 'sent') {
      return Response.json({
        ok: true,
        message: 'Backup yuborildi',
        filename: result.filename,
      })
    }

    return Response.json(
      { ok: false, error: result.status === 'failed' ? result.error : 'Skip qilindi' },
      { status: 500 }
    )
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e)
    return Response.json({ error: `Xatolik: ${msg}` }, { status: 500 })
  }
}
