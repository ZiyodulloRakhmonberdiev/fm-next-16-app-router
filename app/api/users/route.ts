import { NextRequest } from 'next/server'
import { dbConnect } from '@/shared/common/lib/db'
import { UserModel } from '@/features/users/models/user.model'

export async function GET() {
  try {
    await dbConnect()
    const users = await UserModel.find().lean()
    return Response.json(users)
  } catch (err) {
    const message = err instanceof Error ? err.message : 'DB xatosi'
    console.error('[api/users GET]', message)
    return Response.json(
      { error: 'MongoDB ga ulanish amalga oshmadi', details: message },
      { status: 503 }
    )
  }
}

export async function POST(req: NextRequest) {
  await dbConnect()
  const body = await req.json()
  const user = await UserModel.create(body)
  return Response.json(user, { status: 201 })
}