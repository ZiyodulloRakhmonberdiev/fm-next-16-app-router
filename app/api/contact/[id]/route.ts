import { NextRequest } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/shared/common/lib/auth-options"
import { dbConnect } from "@/shared/common/lib/db"
import { requireAdminSession } from "@/shared/common/lib/require-admin-session"
import { ContactMessageModel } from "@/features/contact/model/contact-message.model"

type ContactAdminStatus = "new" | "in_progress" | "resolved" | "archived"

function actorDisplayName(user: {
  name?: string | null
  email?: string | null
  login?: string | null
}): string {
  const n = user.name?.trim()
  if (n) return n
  const l = user.login?.trim()
  if (l) return l
  const e = user.email?.trim()
  if (e) return e
  return "Admin"
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const unauthorized = await requireAdminSession(["ceo", "administrator", "moderator"])
  if (unauthorized) return unauthorized

  const session = await getServerSession(authOptions)
  const user = session?.user
  if (!user?.id) {
    return Response.json({ error: "Unauthorized" }, { status: 401 })
  }

  const body = (await req.json().catch(() => null)) as { adminStatus?: ContactAdminStatus } | null
  if (!body?.adminStatus || !["new", "in_progress", "resolved", "archived"].includes(body.adminStatus)) {
    return Response.json({ error: "Noto'g'ri status" }, { status: 400 })
  }

  await dbConnect()
  const displayName = actorDisplayName({
    name: user.name,
    email: user.email,
    login: (user as { login?: string }).login,
  })

  const updated = await ContactMessageModel.findByIdAndUpdate(
    (await params).id,
    {
      $set: {
        adminStatus: body.adminStatus,
        handledAt: new Date(),
        handledByUserId: user.id,
        handledByUserName: displayName,
      },
    },
    { new: true }
  ).lean()

  if (!updated) {
    return Response.json({ error: "Xabar topilmadi" }, { status: 404 })
  }

  return Response.json(updated)
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const unauthorized = await requireAdminSession(["ceo", "administrator", "moderator"])
  if (unauthorized) return unauthorized

  await dbConnect()
  const deleted = await ContactMessageModel.findByIdAndDelete((await params).id).lean()
  if (!deleted) {
    return Response.json({ error: "Xabar topilmadi" }, { status: 404 })
  }
  return Response.json({ ok: true })
}
