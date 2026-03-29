import { NextRequest } from "next/server"
import { dbConnect } from "@/shared/common/lib/db"
import { requireAdminSession } from "@/shared/server/require-admin-session"
import { protectPublicApi } from "@/shared/server/protect-api"
import { logAdminAction } from "@/features/admin-logs/lib/log-action"
import { ThemeModel } from "@/features/theme/model/theme.model"
import { createThemeSchema } from "@/features/theme/model/schemas"

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const isProtected = await protectPublicApi(req)
  if (isProtected) return isProtected

  await dbConnect()
  const theme = await ThemeModel.findById((await params).id).lean()
  if (!theme) {
    return Response.json({ error: "Tema topilmadi" }, { status: 404 })
  }
  return Response.json(theme)
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const unauthorized = await requireAdminSession(["ceo", "administrator", "moderator"])
  if (unauthorized) return unauthorized

  await dbConnect()
  const json = await req.json()
  const parsed = createThemeSchema.safeParse(json)
  if (!parsed.success) {
    return Response.json(
      { error: "Validation error", issues: parsed.error.flatten() },
      { status: 400 }
    )
  }

  const updated = await ThemeModel.findByIdAndUpdate((await params).id, parsed.data, {
    new: true,
    runValidators: true,
  }).lean()

  if (!updated) {
    return Response.json({ error: "Tema topilmadi" }, { status: 404 })
  }

  logAdminAction({
    action: "UPDATE_THEME",
    targetId: updated._id.toString(),
    targetName: updated.name?.uzb || updated.name?.uz || updated.slug,
  })

  return Response.json(updated)
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const unauthorized = await requireAdminSession(["ceo", "administrator", "moderator"])
  if (unauthorized) return unauthorized

  await dbConnect()
  const json = await req.json()
  const parsed = createThemeSchema.partial().safeParse(json)
  if (!parsed.success) {
    return Response.json(
      { error: "Validation error", issues: parsed.error.flatten() },
      { status: 400 }
    )
  }

  const updated = await ThemeModel.findByIdAndUpdate((await params).id, parsed.data, {
    new: true,
    runValidators: true,
  }).lean()
  if (!updated) {
    return Response.json({ error: "Tema topilmadi" }, { status: 404 })
  }

  logAdminAction({
    action: "UPDATE_THEME",
    targetId: updated._id.toString(),
    targetName: updated.name?.uzb || updated.name?.uz || updated.slug,
  })

  return Response.json(updated)
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const unauthorized = await requireAdminSession(["ceo", "administrator", "moderator"])
  if (unauthorized) return unauthorized

  await dbConnect()
  const deleted = await ThemeModel.findByIdAndDelete((await params).id).lean()
  if (!deleted) {
    return Response.json({ error: "Tema topilmadi" }, { status: 404 })
  }

  logAdminAction({
    action: "DELETE_THEME",
    targetId: deleted._id.toString(),
    targetName: deleted.name?.uzb || deleted.name?.uz || deleted.slug,
  })

  return Response.json({ ok: true })
}

