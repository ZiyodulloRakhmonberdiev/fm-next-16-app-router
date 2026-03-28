import { NextRequest } from 'next/server'
import { dbConnect } from '@/shared/common/lib/db'
import { AdminLogModel } from '@/features/admin-logs/model/admin-log.model'
import { requireAdminSession } from '@/shared/server/require-admin-session'

export async function GET(req: NextRequest) {
  const unauthorized = await requireAdminSession(['ceo', 'administrator', 'moderator'])
  if (unauthorized) return unauthorized

  try {
    await dbConnect()

    const { searchParams } = new URL(req.url)
    const limit = Math.min(100, Math.max(1, Number(searchParams.get('limit') ?? 30)))
    const page = Math.max(1, Number(searchParams.get('page') ?? 1))
    const skip = (page - 1) * limit

    const [logs, total] = await Promise.all([
      AdminLogModel.find({})
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      AdminLogModel.countDocuments({}),
    ])

    return Response.json({
      data: logs,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'DB xatosi'
    console.error('[api/dashboard/logs GET]', message)
    return Response.json(
      { error: "Faoliyat tarixini yuklashda xatolik yuz berdi", details: message },
      { status: 500 }
    )
  }
}
