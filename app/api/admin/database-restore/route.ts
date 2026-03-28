import { NextRequest } from 'next/server'
import { requireAdminSession } from '@/shared/server/require-admin-session'
import { restoreDatabase } from '@/shared/infra/database-restore'

export const runtime = 'nodejs'
export const maxDuration = 300

export async function POST(req: NextRequest) {
  const unauthorized = await requireAdminSession(['ceo', 'administrator'])
  if (unauthorized) return unauthorized

  try {
    const formData = await req.formData()
    const file = formData.get('file') as File | null

    if (!file) {
      return Response.json({ error: 'Fayl tanlanmagan' }, { status: 400 })
    }

    const buffer = Buffer.from(await file.arrayBuffer())
    const res = await restoreDatabase({
      buffer,
      filename: file.name,
    })

    if (!res.ok) {
      return Response.json({ error: res.error }, { status: 500 })
    }

    return Response.json({
      message: 'Ma’lumotlar muvaffaqiyatli tiklandi',
      inserted: res.inserted,
    })
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e)
    return Response.json({ error: `Xatolik: ${msg}` }, { status: 500 })
  }
}
