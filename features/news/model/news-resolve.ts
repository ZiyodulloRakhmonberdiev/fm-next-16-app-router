import { dbConnect } from "@/shared/common/lib/db"
import { NewsModel } from "./news.model"

/**
 * Resolves slug or news _id to the news document's _id.
 * Safe to call without prior dbConnect() – connects internally.
 */
export async function resolveNewsId(slugOrId: string): Promise<string | null> {
  const raw = typeof slugOrId === "string" ? slugOrId.trim() : ""
  if (!raw) return null
  const decoded = tryDecodeUri(raw)
  await dbConnect()
  const doc = await NewsModel.findOne({
    $or: [{ slug: decoded }, { slug: raw }, { _id: decoded }, { _id: raw }],
  })
    .select("_id")
    .lean()
  return doc ? String(doc._id) : null
}

function tryDecodeUri(s: string): string {
  try {
    return decodeURIComponent(s)
  } catch {
    return s
  }
}
