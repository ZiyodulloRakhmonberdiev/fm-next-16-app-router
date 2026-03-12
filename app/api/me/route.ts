import { NextRequest } from "next/server"
import { compare, hash } from "bcryptjs"
import { getServerSession } from "next-auth"
import { authOptions } from "@/shared/common/lib/auth-options"
import { dbConnect } from "@/shared/common/lib/db"
import { UserModel } from "@/features/users/model/user.model"
import { normalizeRole } from "@/shared/common/lib/rbac"

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return Response.json({ error: "Unauthorized" }, { status: 401 })
  await dbConnect()
  const me = await UserModel.findById(session.user.id).lean()
  if (!me) return Response.json({ error: "User topilmadi" }, { status: 404 })
  return Response.json({
    _id: me._id,
    full_name: me.full_name,
    position: me.position,
    image: me.image,
    login: me.login,
    role: normalizeRole(me.role),
  })
}

export async function PATCH(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return Response.json({ error: "Unauthorized" }, { status: 401 })
  await dbConnect()
  const me = await UserModel.findById(session.user.id)
  if (!me) return Response.json({ error: "User topilmadi" }, { status: 404 })

  const body = (await req.json().catch(() => null)) as
    | {
        full_name?: string
        position?: string
        image?: string | null
        currentPassword?: string
        newPassword?: string
      }
    | null
  if (!body) return Response.json({ error: "Noto'g'ri payload" }, { status: 400 })

  if (typeof body.full_name === "string" && body.full_name.trim()) me.full_name = body.full_name.trim()
  if (typeof body.position === "string") me.position = body.position.trim()
  if (body.image === null || typeof body.image === "string") me.image = body.image

  if (body.newPassword) {
    if (!body.currentPassword) {
      return Response.json({ error: "Joriy parol kerak" }, { status: 400 })
    }
    const ok = await compare(body.currentPassword, me.password)
    if (!ok) return Response.json({ error: "Joriy parol noto'g'ri" }, { status: 400 })
    me.password = await hash(body.newPassword, 10)
  }

  await me.save()
  return Response.json({ ok: true })
}