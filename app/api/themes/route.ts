import { NextRequest } from "next/server"
import { dbConnect } from "@/shared/common/lib/db"
import { requireAdminSession } from "@/shared/server/require-admin-session"
import { protectPublicApi } from "@/shared/server/protect-api"
import { logAdminAction } from "@/features/admin-logs/lib/log-action"
import { CACHE_TIMINGS, publicCacheHeaders } from "@/shared/common/lib/http-cache"
import { ThemeModel } from "@/features/theme/model/theme.model"
import { createThemeSchema } from "@/features/theme/model/schemas"
import { revalidateThemesPublicCache } from "@/shared/server/revalidate-public-cache"
import { getServerSession } from "next-auth"
import { authOptions } from "@/shared/common/lib/auth-options"
import { normalizeRole } from "@/shared/common/lib/rbac"

export async function GET(req: NextRequest) {
  const isProtected = await protectPublicApi(req)
  if (isProtected) return isProtected

  try {
    const { searchParams } = new URL(req.url)
    const session = await getServerSession(authOptions)
    const isAdminSession = session?.user?.id
      ? ["ceo", "administrator", "moderator"].includes(normalizeRole(session.user.role))
      : false
    const wantsAdmin = searchParams.get("admin") === "1" || isAdminSession
    if (wantsAdmin) {
      const unauthorized = await requireAdminSession(["ceo", "administrator", "moderator"])
      if (unauthorized) return unauthorized
    }

    await dbConnect()
    const filter = wantsAdmin ? {} : { status: "active" }
    const themes = await ThemeModel.find(filter).sort({ createdAt: -1 }).lean()
    return Response.json(themes, {
      headers: publicCacheHeaders(CACHE_TIMINGS.taxonomy.maxAge, CACHE_TIMINGS.taxonomy.stale),
    })
  } catch (err) {
    const message = err instanceof Error ? err.message : "DB xatosi"
    console.error("[api/themes GET]", message)
    return Response.json(
      { error: "MongoDB ga ulanish amalga oshmadi", details: message },
      { status: 503 }
    )
  }
}

export async function POST(req: NextRequest) {
  const unauthorized = await requireAdminSession(["ceo", "administrator", "moderator"])
  if (unauthorized) return unauthorized

  try {
    await dbConnect()
    const json = await req.json()

    const parsed = createThemeSchema.safeParse(json)
    if (!parsed.success) {
      return Response.json(
        { error: "Validation error", issues: parsed.error.flatten() },
        { status: 400 }
      )
    }

    const theme = await ThemeModel.create(parsed.data)
    logAdminAction({
      action: "CREATE_THEME",
      targetId: theme._id.toString(),
      targetName: theme.name?.uzb || theme.name?.uz || theme.slug,
    })
    revalidateThemesPublicCache()
    return Response.json(theme, { status: 201 })
  } catch (err) {
    const anyErr = err as { code?: number | string; keyPattern?: Record<string, unknown>; keyValue?: Record<string, unknown> }
    if (anyErr && (anyErr.code === 11000 || anyErr.code === "E11000")) {
      const field = Object.keys(anyErr.keyPattern ?? anyErr.keyValue ?? {})[0] ?? "slug"
      return Response.json(
        {
          error: "Unique constraint",
          message: `${field} allaqachon mavjud. Iltimos, boshqasini tanlang.`,
        },
        { status: 409 }
      )
    }

    const message = err instanceof Error ? err.message : "DB xatosi"
    console.error("[api/themes POST]", message)
    return Response.json(
      { error: "Temani yaratib bo'lmadi", details: message },
      { status: 500 }
    )
  }
}

