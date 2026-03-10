import { NextRequest } from 'next/server'
import { dbConnect } from '@/shared/common/lib/db'
import { TagModel } from '@/features/tags/model/tag.model'
import { createTagSchema } from '@/features/tags/model/schemas'

export async function GET() {
  try {
    await dbConnect()
    const tags = await TagModel.find().lean()
    return Response.json(tags)
  } catch (err) {
    const message = err instanceof Error ? err.message : 'DB xatosi'
    console.error('[api/tags GET]', message)
    return Response.json(
      { error: 'MongoDB ga ulanish amalga oshmadi', details: message },
      { status: 503 }
    )
  }
}

export async function POST(req: NextRequest) {
  try {
    await dbConnect()
    const json = await req.json()

    const parsed = createTagSchema.safeParse(json)
    if (!parsed.success) {
      return Response.json(
        { error: 'Validation error', issues: parsed.error.flatten() },
        { status: 400 }
      )
    }

    const tag = await TagModel.create(parsed.data)
    return Response.json(tag, { status: 201 })
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
    console.error('[api/tags POST]', message)
    return Response.json(
      { error: "Tegni yaratib bo'lmadi", details: message },
      { status: 500 }
    )
  }
}
