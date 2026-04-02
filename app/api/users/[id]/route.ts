import { NextRequest } from 'next/server'
import { hash } from 'bcryptjs'
import { getServerSession } from 'next-auth'
import { dbConnect } from '@/shared/common/lib/db'
import { authOptions } from '@/shared/common/lib/auth-options'
import { normalizeRole } from '@/shared/common/lib/rbac'
import { requireAdminSession } from '@/shared/server/require-admin-session'
import { UserModel } from '@/features/users/model/user.model'
import { createUserSchema } from '@/features/users/model/schemas'
import { logAdminAction } from '@/features/admin-logs/lib/log-action'

export async function GET(
  _req: NextRequest,
  { params }: {params: Promise<{ id: string }> }
) {
  const unauthorized = await requireAdminSession(['ceo', 'administrator'])
  if (unauthorized) return unauthorized

  await dbConnect()
  const user = await UserModel.findById((await params).id).lean()

  if (!user) {
    return Response.json({ error: 'Foydalanuvchi topilmadi' }, { status: 404 })
  }

  return Response.json(user)
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const unauthorized = await requireAdminSession(['ceo', 'administrator'])
  if (unauthorized) return unauthorized

  try {
    await dbConnect()
    const json = await req.json()

    const parsed = createUserSchema.safeParse(json)
    if (!parsed.success) {
      return Response.json(
        { error: 'Validation error', issues: parsed.error.flatten() },
        { status: 400 }
      )
    }

    const session = await getServerSession(authOptions)
    if (normalizeRole(session?.user?.role) === 'administrator' && parsed.data.role === 'ceo') {
      return Response.json(
        { error: 'Administrator foydalanuvchini CEO qilib tayinlay olmaydi' },
        { status: 403 }
      )
    }

    const updated = await UserModel.findByIdAndUpdate(
      (await params).id,
      {
        ...parsed.data,
        password: await hash(parsed.data.password, 10),
      },
      { new: true, runValidators: true }
    ).lean()

    if (!updated) {
      return Response.json({ error: 'Foydalanuvchi topilmadi' }, { status: 404 })
    }

    logAdminAction({
      action: 'UPDATE_USER',
      targetId: updated._id.toString(),
      targetName: updated.login,
    })

    return Response.json(updated)
  } catch (err) {
    const anyErr = err as any
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
    return Response.json(
      { error: 'Foydalanuvchini yangilab bo‘lmadi', details: message },
      { status: 500 }
    )
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const unauthorized = await requireAdminSession(['ceo', 'administrator'])
  if (unauthorized) return unauthorized

  try {
    await dbConnect()
    const json = await req.json()

    const partialSchema = createUserSchema.partial()
    const parsed = partialSchema.safeParse(json)
    if (!parsed.success) {
      return Response.json(
        { error: 'Validation error', issues: parsed.error.flatten() },
        { status: 400 }
      )
    }

    const session = await getServerSession(authOptions)
    if (
      normalizeRole(session?.user?.role) === 'administrator' &&
      parsed.data.role === 'ceo'
    ) {
      return Response.json(
        { error: 'Administrator foydalanuvchini CEO qilib tayinlay olmaydi' },
        { status: 403 }
      )
    }

    const updated = await UserModel.findByIdAndUpdate(
      (await params).id,
      {
        ...parsed.data,
        ...(parsed.data.password
          ? { password: await hash(parsed.data.password, 10) }
          : {}),
      },
      { new: true, runValidators: true }
    ).lean()

    if (!updated) {
      return Response.json({ error: 'Foydalanuvchi topilmadi' }, { status: 404 })
    }

    logAdminAction({
      action: 'UPDATE_USER',
      targetId: updated._id.toString(),
      targetName: updated.login,
    })

    return Response.json(updated)
  } catch (err) {
    const anyErr = err as any
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
    return Response.json(
      { error: 'Foydalanuvchini yangilab bo‘lmadi', details: message },
      { status: 500 }
    )
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const unauthorized = await requireAdminSession(['ceo', 'administrator'])
  if (unauthorized) return unauthorized

  await dbConnect()
  const deleted = await UserModel.findByIdAndDelete((await params).id).lean()

  if (!deleted) {
    return Response.json({ error: 'Foydalanuvchi topilmadi' }, { status: 404 })
  }

  logAdminAction({
    action: 'DELETE_USER',
    targetId: deleted._id.toString(),
    targetName: deleted.login,
  })

  return Response.json({ ok: true })
}