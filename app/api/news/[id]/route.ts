import { NextRequest } from 'next/server'
import { dbConnect } from '@/shared/common/lib/db'
import { NewsModel } from '@/features/news/model/news.model'
import { createNewsSchema } from '@/features/news/model/schemas'

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  await dbConnect()
  const news = await NewsModel.findById((await params).id).lean()

  if (!news) {
    return Response.json({ error: 'Yangilik topilmadi' }, { status: 404 })
  }

  return Response.json(news)
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  await dbConnect()
  const json = await req.json()

  const parsed = createNewsSchema.safeParse(json)
  if (!parsed.success) {
    return Response.json(
      { error: 'Validation error', issues: parsed.error.flatten() },
      { status: 400 }
    )
  }

  const updated = await NewsModel.findByIdAndUpdate(
    (await params).id,
    parsed.data,
    { new: true, runValidators: true }
  ).lean()

  if (!updated) {
    return Response.json({ error: 'Yangilik topilmadi' }, { status: 404 })
  }

  return Response.json(updated)
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  await dbConnect()
  const json = await req.json()

  const parsed = createNewsSchema.partial().safeParse(json)
  if (!parsed.success) {
    return Response.json(
      { error: 'Validation error', issues: parsed.error.flatten() },
      { status: 400 }
    )
  }

  const updated = await NewsModel.findByIdAndUpdate(
    (await params).id,
    parsed.data,
    { new: true, runValidators: true }
  ).lean()

  if (!updated) {
    return Response.json({ error: 'Yangilik topilmadi' }, { status: 404 })
  }

  return Response.json(updated)
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  await dbConnect()
  const deleted = await NewsModel.findByIdAndDelete((await params).id).lean()

  if (!deleted) {
    return Response.json({ error: 'Yangilik topilmadi' }, { status: 404 })
  }

  return Response.json({ ok: true })
}
