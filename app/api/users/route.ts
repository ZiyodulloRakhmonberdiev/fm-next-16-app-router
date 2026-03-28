import { NextRequest } from 'next/server'
import { hash } from 'bcryptjs'
import { getServerSession } from 'next-auth'
import { dbConnect } from '@/shared/common/lib/db'
import { authOptions } from '@/shared/common/lib/auth-options'
import { normalizeRole } from '@/shared/common/lib/rbac'
import { requireAdminSession } from '@/shared/common/lib/require-admin-session'
import { UserModel } from '@/features/users/model/user.model'
import { createUserSchema } from '@/features/users/model/schemas'
import { logAdminAction } from '@/features/admin-logs/lib/log-action'

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

    const session = await getServerSession(authOptions)
    if (normalizeRole(session?.user?.role) === 'administrator' && parsed.data.role === 'ceo') {
      return Response.json(
        { error: 'Administrator CEO roli bilan foydalanuvchi yarata olmaydi' },
        { status: 403 }
      )
    }

    const hashedPassword = await hash(parsed.data.password, 10)
    const user = await UserModel.create({
      ...parsed.data,
      password: hashedPassword,
    })
    logAdminAction({
      action: 'CREATE_USER',
      targetId: user._id.toString(),
      targetName: user.login,
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