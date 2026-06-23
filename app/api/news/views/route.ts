import { NextRequest } from "next/server"
import { NewsModel } from "@/features/news/model/news.model"
import { dbConnect } from "@/shared/common/lib/db"

type ViewItem = { slug?: string; count?: number }

// Bitta so'rovda nechta slug kelishini cheklaymiz (abuse oldini olish)
const MAX_ITEMS = 200
// Bitta slug uchun maksimal increment (abuse oldini olish)
const MAX_COUNT_PER_SLUG = 500

export async function POST(req: NextRequest) {
  const body = (await req.json().catch(() => null)) as
    | { items?: ViewItem[]; slug?: string }
    | null

  // Yangi batch format: { items: [{ slug, count }] }
  // Eski format bilan ham mos: { slug }
  let rawItems: ViewItem[] = []
  if (body && Array.isArray(body.items)) {
    rawItems = body.items
  } else if (body && typeof body.slug === "string") {
    rawItems = [{ slug: body.slug, count: 1 }]
  }

  if (rawItems.length === 0) {
    return Response.json({ ok: false, error: "items required" }, { status: 400 })
  }

  // slug -> count (dublikatlarni birlashtiramiz)
  const counts = new Map<string, number>()
  for (const it of rawItems.slice(0, MAX_ITEMS)) {
    const slug = typeof it?.slug === "string" ? it.slug.trim() : ""
    if (!slug) continue
    const n = Number(it?.count)
    const count = Number.isFinite(n) && n > 0 ? Math.floor(n) : 1
    counts.set(slug, Math.min((counts.get(slug) ?? 0) + count, MAX_COUNT_PER_SLUG))
  }

  if (counts.size === 0) {
    return Response.json({ ok: false, error: "no valid items" }, { status: 400 })
  }

  const ops = Array.from(counts.entries()).map(([slug, count]) => ({
    updateOne: {
      filter: { slug },
      update: { $inc: { views: count } },
    },
  }))

  try {
    await dbConnect()
    await NewsModel.bulkWrite(ops, { ordered: false })
    return Response.json({ ok: true })
  } catch (error) {
    console.error("[api/news/views]", error)
    return Response.json({ ok: false }, { status: 500 })
  }
}
