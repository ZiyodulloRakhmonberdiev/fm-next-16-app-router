import { NextRequest } from 'next/server'
import { requireAdminSession } from '@/shared/common/lib/require-admin-session'
import { restoreDatabaseFromArchiveBuffer } from '@/shared/common/lib/database-restore'

export const runtime = 'nodejs'
export const maxDuration = 300

export async function POST(request: NextRequest) {
  const denied = await requireAdminSession(['ceo'])
  if (denied) return denied

  const form = await request.formData()
  const file = form.get('file')
  if (!file || !(file instanceof File)) {
    return Response.json({ ok: false, error: 'Fayl topilmadi. `file` maydoniga backup yuklang.' }, { status: 400 })
  }

  const arrayBuffer = await file.arrayBuffer()
  const buffer = Buffer.from(arrayBuffer)

  const result = await restoreDatabaseFromArchiveBuffer({
    buffer,
    filename: file.name || 'backup',
  })

  if (result.ok) {
    return Response.json({ ok: true, inserted: result.inserted })
  }

  return Response.json({ ok: false, error: result.error }, { status: 500 })
}

