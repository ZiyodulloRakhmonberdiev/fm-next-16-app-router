import { NextRequest } from "next/server"
import { hash } from "bcryptjs"
import { dbConnect } from "@/shared/common/lib/db"
import { UserModel } from "@/features/users/model/user.model"

export async function POST(req: NextRequest) {
  const body = (await req.json().catch(() => null)) as
    | { full_name?: string; login?: string; password?: string; confirmPassword?: string }
    | null
  const fullName = body?.full_name?.trim()
  const login = body?.login?.trim()
  const password = body?.password
  const confirmPassword = body?.confirmPassword

  if (!fullName || !login || !password || !confirmPassword) {
    return Response.json({ error: "Barcha maydonlar majburiy" }, { status: 400 })
  }
  if (password !== confirmPassword) {
    return Response.json({ error: "Parollar mos emas" }, { status: 400 })
  }
  if (password.length < 6) {
    return Response.json({ error: "Parol kamida 6 belgi bo'lishi kerak" }, { status: 400 })
  }

  await dbConnect()
  const exists = await UserModel.findOne({ login }).lean()
  if (exists) {
    return Response.json({ error: "Bu username allaqachon mavjud" }, { status: 409 })
  }

  const user = await UserModel.create({
    full_name: fullName,
    image: null,
    role: "user",
    position: "Reader",
    login,
    password: await hash(password, 10),
  })
  return Response.json({ ok: true, id: user._id }, { status: 201 })
}
