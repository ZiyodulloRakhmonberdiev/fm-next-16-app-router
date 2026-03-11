import { NextRequest } from 'next/server'
import { dbConnect } from '@/shared/common/lib/db'
import { requireAdminSession } from '@/shared/common/lib/require-admin-session'
import { CategoryModel } from '@/features/category/model/category.model'
import { createCategorySchema } from '@/features/category/model/schemas'

export async function GET() {
  try {
    await dbConnect()
    const categories = await CategoryModel.find().sort({ priority: -1, createdAt: -1 }).lean()
    return Response.json(categories)
  } catch (err) {
    const message = err instanceof Error ? err.message : 'DB xatosi'
    console.error('[api/categories GET]', message)
    return Response.json(
      { error: 'MongoDB ga ulanish amalga oshmadi', details: message },
      { status: 503 }
    )
  }
}

export async function POST(req: NextRequest) {
  const unauthorized = await requireAdminSession(['ceo', 'administrator', 'moderator'])
  if (unauthorized) return unauthorized

  try {
    await dbConnect()
    const json = await req.json()

    const parsed = createCategorySchema.safeParse(json)
    if (!parsed.success) {
      return Response.json(
        { error: 'Validation error', issues: parsed.error.flatten() },
        { status: 400 }
      )
    }

    const category = await CategoryModel.create(parsed.data)
    return Response.json(category, { status: 201 })
  } catch (err) {
    const anyErr = err as any

    if (anyErr && (anyErr.code === 11000 || anyErr.code === 'E11000')) {
      const field = Object.keys(anyErr.keyPattern ?? anyErr.keyValue ?? {})[0] ?? 'slug'
      return Response.json(
        {
          error: 'Unique constraint',
          message: `${field} allaqachon mavjud. Iltimos, boshqasini tanlang.`,
        },
        { status: 409 }
      )
    }

    const message = err instanceof Error ? err.message : 'DB xatosi'
    console.error('[api/categories POST]', message)
    return Response.json(
      { error: "Kategoriyani yaratib bo'lmadi", details: message },
      { status: 500 }
    )
  }
}
