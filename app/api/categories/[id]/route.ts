import { NextRequest } from 'next/server'
import { dbConnect } from '@/shared/common/lib/db'
import { CategoryModel } from '@/features/category/model/category.model'
import { createCategorySchema } from '@/features/category/model/schemas'

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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

  return Response.json(updated)
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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

  return Response.json(updated)
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  await dbConnect()
  const deleted = await CategoryModel.findByIdAndDelete((await params).id).lean()

  if (!deleted) {
    return Response.json({ error: 'Kategoriya topilmadi' }, { status: 404 })
  }

  return Response.json({ ok: true })
}
