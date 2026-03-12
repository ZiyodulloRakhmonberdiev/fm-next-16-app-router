import { NextRequest } from "next/server"
import { dbConnect } from "@/shared/common/lib/db"
import { isClientDeliveryEnabled } from "@/shared/common/lib/server-client-delivery"
import { TeamMemberModel } from "@/features/team/model/team.model"
import { createTeamMemberSchema } from "@/features/team/model/schemas"
import { requireAdminSession } from "@/shared/common/lib/require-admin-session"

export async function GET(req: NextRequest) {
  const isPublic = new URL(req.url).searchParams.get("public") === "1"
  if (isPublic) {
    const allowed = await isClientDeliveryEnabled("team")
    if (!allowed) return Response.json([])
  }

  await dbConnect()
  const rows = await TeamMemberModel.find().sort({ order: 1, createdAt: 1 }).lean()
  if (isPublic) {
    return Response.json(rows)
  }
  const unauthorized = await requireAdminSession(["ceo", "administrator"])
  if (unauthorized) return unauthorized
  return Response.json(rows)
}

export async function POST(req: NextRequest) {
  const unauthorized = await requireAdminSession(["ceo", "administrator"])
  if (unauthorized) return unauthorized

  await dbConnect()
  const json = await req.json()
  const parsed = createTeamMemberSchema.safeParse(json)
  if (!parsed.success) {
    return Response.json(
      { error: "Validation error", issues: parsed.error.flatten() },
      { status: 400 }
    )
  }
  const created = await TeamMemberModel.create(parsed.data)
  return Response.json(created, { status: 201 })
}