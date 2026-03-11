import { NextRequest } from "next/server"
import { NewsModel } from "@/features/news/model/news.model"
import { dbConnect } from "@/shared/common/lib/db"

export async function POST(req: NextRequest) {
  const body = (await req.json().catch(() => null)) as { slug?: string } | null
  const slug = body?.slug?.trim()
  if (!slug) {
    return Response.json({ ok: false, error: "slug required" }, { status: 400 })
  }

  try {
    await dbConnect()
    await NewsModel.updateOne({ slug }, { $inc: { views: 1 } })
    return Response.json({ ok: true })
  } catch (error) {
    console.error("[api/news/views]", error)
    return Response.json({ ok: false }, { status: 500 })
  }
}
