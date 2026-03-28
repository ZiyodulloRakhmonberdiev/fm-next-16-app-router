import { NextRequest } from 'next/server'
import { dbConnect } from '@/shared/common/lib/db'
import { requireAdminSession } from '@/shared/server/require-admin-session'
import { TagModel } from '@/features/tags/model/tag.model'
import { createTagSchema } from '@/features/tags/model/schemas'
import { protectPublicApi } from '@/shared/server/protect-api'

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const isProtected = await protectPublicApi(req)
  if (isProtected) return isProtected

  await dbConnect()
  const tag = await TagModel.findById((await params).id).lean()

  if (!tag) {
    return Response.json({ error: 'Teg topilmadi' }, { status: 404 })
  }

  return Response.json(tag)
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const unauthorized = await requireAdminSession(['ceo', 'administrator', 'moderator'])
  if (unauthorized) return unauthorized

  await dbConnect()
  const json = await req.json()

  const parsed = createTagSchema.safeParse(json)
  if (!parsed.success) {
    return Response.json(
      { error: 'Validation error', issues: parsed.error.flatten() },
      { status: 400 }
    )
  }

  const updated = await TagModel.findByIdAndUpdate(
    (await params).id,
    parsed.data,
    { new: true, runValidators: true }
  ).lean()

  if (!updated) {
    return Response.json({ error: 'Teg topilmadi' }, { status: 404 })
  }

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

  const parsed = createTagSchema.partial().safeParse(json)
  if (!parsed.success) {
    return Response.json(
      { error: 'Validation error', issues: parsed.error.flatten() },
      { status: 400 }
    )
  }

  const updated = await TagModel.findByIdAndUpdate(
    (await params).id,
    parsed.data,
    { new: true, runValidators: true }
  ).lean()

  if (!updated) {
    return Response.json({ error: 'Teg topilmadi' }, { status: 404 })
  }

  return Response.json(updated)
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const unauthorized = await requireAdminSession(['ceo', 'administrator', 'moderator'])
  if (unauthorized) return unauthorized

  await dbConnect()
  const deleted = await TagModel.findByIdAndDelete((await params).id).lean()

  if (!deleted) {
    return Response.json({ error: 'Teg topilmadi' }, { status: 404 })
  }

  return Response.json({ ok: true })
}
