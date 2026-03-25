import { NextRequest } from 'next/server'
import { dbConnect } from '@/shared/common/lib/db'
import { runDatabaseBackupToTelegram } from '@/shared/common/lib/database-backup'
import {
  SiteSettingsModel,
  SITE_SETTINGS_DOCUMENT_ID,
  leanDocToPayload,
} from '@/features/dashboard/configs/site-settings.model'

export const runtime = 'nodejs'
export const maxDuration = 300

function getCronSecret(): string {
  return (
    process.env.BACKUP_CRON_SECRET?.trim() ||
    process.env.CRON_SECRET?.trim() ||
    ''
  )
}

/**
 * Rejadagi backup (masalan har 24 soat).
 * So‘rov: `Authorization: Bearer <BACKUP_CRON_SECRET yoki CRON_SECRET>`
 */
export async function GET(request: NextRequest) {
  const secret = getCronSecret()
  if (!secret) {
    return Response.json(
      { ok: false, error: 'BACKUP_CRON_SECRET yoki CRON_SECRET .env da yoq' },
      { status: 503 }
    )
  }

  const auth = request.headers.get('authorization')
  if (auth !== `Bearer ${secret}`) {
    return Response.json({ ok: false, error: 'Unauthorized' }, { status: 401 })
  }

  await dbConnect()
  const doc = await SiteSettingsModel.findById(SITE_SETTINGS_DOCUMENT_ID).lean()
  const payload = leanDocToPayload(doc)
  if (!payload) {
    return Response.json({ ok: false, error: 'Sozlamalar topilmadi' }, { status: 500 })
  }

  const result = await runDatabaseBackupToTelegram(payload.databaseBackup, {
    requireScheduledEnabled: true,
  })

  if (result.status === 'skipped') {
    return Response.json({ ok: true, skipped: true, reason: result.reason })
  }

  if (result.status === 'sent') {
    return Response.json({
      ok: true,
      filename: result.filename,
      jsonBytes: result.jsonBytes,
      gzipBytes: result.gzipBytes,
    })
  }

  return Response.json(
    {
      ok: false,
      error: result.error,
      telegramDescription: result.telegramDescription,
    },
    { status: 502 }
  )
}
