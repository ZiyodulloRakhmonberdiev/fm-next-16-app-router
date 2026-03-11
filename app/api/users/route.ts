import { NextRequest } from 'next/server'
import { hash } from 'bcryptjs'
import { dbConnect } from '@/shared/common/lib/db'
import { requireAdminSession } from '@/shared/common/lib/require-admin-session'
import { UserModel } from '@/features/users/model/user.model'
import { createUserSchema } from '@/features/users/model/schemas'

export async function GET() {
  const unauthorized = await requireAdminSession(['ceo', 'administrator', 'moderator'])
  if (unauthorized) return unauthorized

  try {
    await dbConnect()
    const users = await UserModel.find().lean()
    return Response.json(users)
  } catch (err) {
    const message = err instanceof Error ? err.message : 'DB xatosi'
    console.error('[api/users GET]', message)
    return Response.json(
      { error: 'MongoDB ga ulanish amalga oshmadi', details: message },
      { status: 503 }
    )
  }
}

export async function POST(req: NextRequest) {
  const unauthorized = await requireAdminSession(['ceo', 'administrator'])
  if (unauthorized) return unauthorized

  try {
    await dbConnect()
    const json = await req.json()

    const parsed = createUserSchema.safeParse(json)
    if (!parsed.success) {
      return Response.json(
        {
          error: 'Validation error',
          issues: parsed.error.flatten(),
        },
        { status: 400 }
      )
    }

    const hashedPassword = await hash(parsed.data.password, 10)
    const user = await UserModel.create({
      ...parsed.data,
      password: hashedPassword,
    })
    return Response.json(user, { status: 201 })
  } catch (err) {
    const anyErr = err as any

    // Duplicate key (masalan, login unique) xatosi
    if (anyErr && (anyErr.code === 11000 || anyErr.code === 'E11000')) {
      const field = Object.keys(anyErr.keyPattern ?? anyErr.keyValue ?? {})[0] ?? 'login'
      const fieldLabel = field === 'login' ? 'Login' : field
      return Response.json(
        {
          error: 'Unique constraint',
          message: `${fieldLabel} allaqachon mavjud. Iltimos, boshqasini tanlang.`,
        },
        { status: 409 }
      )
    }

    const message = err instanceof Error ? err.message : 'DB xatosi'
    console.error('[api/users POST]', message)
    return Response.json(
      { error: 'Foydalanuvchini yaratib bo‘lmadi', details: message },
      { status: 500 }
    )
  }
}