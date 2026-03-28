import { NextRequest } from 'next/server'
import { dbConnect } from '@/shared/common/lib/db'
import { requireAdminSession } from '@/shared/server/require-admin-session'
import { CategoryModel } from '@/features/category/model/category.model'
import { createCategorySchema } from '@/features/category/model/schemas'
import { logAdminAction } from '@/features/admin-logs/lib/log-action'
import { protectPublicApi } from '@/shared/server/protect-api'

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const isProtected = await protectPublicApi(req)
  if (isProtected) return isProtected

  await dbConnect()
  const category = await CategoryModel.findById((await params).id).lean()

  if (!category) {
    return Response.json({ error: 'Kategoriya topilmadi' }, { status: 404 })
  }

  return Response.json(category)
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const unauthorized = await requireAdminSession(['ceo', 'administrator', 'moderator'])
  if (unauthorized) return unauthorized

  await dbConnect()
  const json = await req.json()

  const parsed = createCategorySchema.safeParse(json)
  if (!parsed.success) {
    return Response.json(
      { error: 'Validation error', issues: parsed.error.flatten() },
      { status: 400 }
    )
  }

  const updated = await CategoryModel.findByIdAndUpdate(
    (await params).id,
    parsed.data,
    { new: true, runValidators: true }
  ).lean()

  if (!updated) {
    return Response.json({ error: 'Kategoriya topilmadi' }, { status: 404 })
  }

  logAdminAction({
    action: 'UPDATE_CATEGORY',
    targetId: updated._id.toString(),
    targetName: updated.name?.uzb || updated.name?.uz || updated.slug,
  })

  return Response.json(updated)
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const unauthorized = await requireAdminSession(['ceo', 'administrator', 'moderator'])
  if (unauthorized) return unauthorized

  await dbConnect()
  const json = await req.json()

  const parsed = createCategorySchema.partial().safeParse(json)
  if (!parsed.success) {
    return Response.json(
      { error: 'Validation error', issues: parsed.error.flatten() },
      { status: 400 }
    )
  }

  const updated = await CategoryModel.findByIdAndUpdate(
    (await params).id,
    parsed.data,
    { new: true, runValidators: true }
  ).lean()

  if (!updated) {
    return Response.json({ error: 'Kategoriya topilmadi' }, { status: 404 })
  }

  logAdminAction({
    action: 'UPDATE_CATEGORY',
    targetId: updated._id.toString(),
    targetName: updated.name?.uzb || updated.name?.uz || updated.slug,
  })

  return Response.json(updated)
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const unauthorized = await requireAdminSession(['ceo', 'administrator', 'moderator'])
  if (unauthorized) return unauthorized

  await dbConnect()
  const deleted = await CategoryModel.findByIdAndDelete((await params).id).lean()

  if (!deleted) {
    return Response.json({ error: 'Kategoriya topilmadi' }, { status: 404 })
  }

  logAdminAction({
    action: 'DELETE_CATEGORY',
    targetId: deleted._id.toString(),
    targetName: deleted.name?.uzb || deleted.name?.uz || deleted.slug,
  })

  return Response.json({ ok: true })
}
