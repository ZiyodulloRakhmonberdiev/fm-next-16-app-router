import { mkdir, writeFile } from "node:fs/promises"
import path from "node:path"
import { NextRequest } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/shared/common/lib/auth-options"
import { dbConnect } from "@/shared/common/lib/db"
import { UserModel } from "@/features/users/model/user.model"

const MAX_BYTES = 512 * 1024

function safeAvatarFileName(userId: string) {
  const safe = userId.replace(/[^a-zA-Z0-9_-]/g, "")
  return safe.length > 0 ? `${safe}.jpg` : `user-${Date.now()}.jpg`
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return Response.json({ error: "Unauthorized" }, { status: 401 })
  }

  let formData: FormData
  try {
    formData = await req.formData()
  } catch {
    return Response.json({ error: "Noto'g'ri so'rov" }, { status: 400 })
  }

  const file = formData.get("file")
  if (!(file instanceof File)) {
    return Response.json({ error: "Fayl topilmadi" }, { status: 400 })
  }
  if (!file.type.startsWith("image/")) {
    return Response.json({ error: "Faqat rasm fayli" }, { status: 400 })
  }

  const buf = Buffer.from(await file.arrayBuffer())
  if (buf.length > MAX_BYTES) {
    return Response.json({ error: "Rasm juda katta" }, { status: 400 })
  }
  if (buf.length < 10) {
    return Response.json({ error: "Noto'g'ri fayl" }, { status: 400 })
  }

  const dir = path.join(process.cwd(), "public", "uploads", "avatars")
  await mkdir(dir, { recursive: true })
  const filename = safeAvatarFileName(session.user.id)
  const filepath = path.join(dir, filename)
  await writeFile(filepath, buf)

  const url = `/uploads/avatars/${filename}`
  await dbConnect()
  await UserModel.findByIdAndUpdate(session.user.id, { $set: { image: url } })

  return Response.json({ url })
}
