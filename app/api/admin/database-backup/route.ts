import { requireAdminSession } from '@/shared/common/lib/require-admin-session'
import { dbConnect } from '@/shared/common/lib/db'
import { runDatabaseBackupToTelegram } from '@/shared/common/lib/database-backup'
import {
  SiteSettingsModel,
  SITE_SETTINGS_DOCUMENT_ID,
  leanDocToPayload,
} from '@/features/dashboard/configs/site-settings.model'

export const runtime = 'nodejs'
export const maxDuration = 300

export async function POST() {
  const denied = await requireAdminSession(['ceo'])
  if (denied) return denied

  await dbConnect()
  const doc = await SiteSettingsModel.findById(SITE_SETTINGS_DOCUMENT_ID).lean()
  const payload = leanDocToPayload(doc)
  if (!payload) {
    return Response.json({ ok: false, error: 'Sozlamalar topilmadi' }, { status: 500 })
  }

  const result = await runDatabaseBackupToTelegram(payload.databaseBackup, {
    requireScheduledEnabled: false,
  })

  if (result.status === 'sent') {
    return Response.json({
      ok: true,
      filename: result.filename,
      jsonBytes: result.jsonBytes,
      gzipBytes: result.gzipBytes,
    })
  }

  if (result.status === 'failed') {
    return Response.json(
      {
        ok: false,
        error: result.error,
        telegramDescription: result.telegramDescription,
      },
      { status: 502 }
    )
  }

  return Response.json({ ok: false, error: 'Noma\'lum natija' }, { status: 500 })
}
