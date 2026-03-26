import { NextRequest } from "next/server"
import { getServerSession } from "next-auth"
import { dbConnect } from "@/shared/common/lib/db"
import { authOptions } from "@/shared/common/lib/auth-options"
import { NewsCommentModel } from "@/features/news/model/comment.model"
import { requireAdminSession } from "@/shared/common/lib/require-admin-session"
import {
  SiteSettingsModel,
  SITE_SETTINGS_DOCUMENT_ID,
  leanDocToPayload,
} from "@/features/dashboard/configs/site-settings.model"
import { deletePendingCommentAlertFromTelegram } from "@/shared/common/lib/database-backup"

function moderatorDisplayName(user: {
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
  return "Moderator"
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

  const body = (await req.json().catch(() => null)) as { status?: "confirmed" | "rejected" } | null
  if (!body?.status || !["confirmed", "rejected"].includes(body.status)) {
    return Response.json({ error: "Noto'g'ri status" }, { status: 400 })
  }

  await dbConnect()
  const moderatorName = moderatorDisplayName({
    name: user.name,
    email: user.email,
    login: (user as { login?: string }).login,
  })

  const update =
    body.status === "confirmed"
      ? {
          $set: {
            status: body.status,
            confirmedAt: new Date(),
            confirmedByUserId: user.id,
            confirmedByUserName: moderatorName,
          },
        }
      : {
          $set: { status: body.status },
          $unset: {
            confirmedAt: 1,
            confirmedByUserId: 1,
            confirmedByUserName: 1,
          },
        }

  const updated = await NewsCommentModel.findByIdAndUpdate((await params).id, update, {
    new: true,
  }).lean()
  if (!updated) return Response.json({ error: "Izoh topilmadi" }, { status: 404 })

  if (updated.status !== "pending" && updated.pendingTelegramMessageId) {
    const settingsDoc = await SiteSettingsModel.findById(SITE_SETTINGS_DOCUMENT_ID).lean()
    const settingsPayload = leanDocToPayload(settingsDoc)
    const backupSettings = settingsPayload?.databaseBackup
    if (backupSettings?.botToken?.trim() && backupSettings?.chatId?.trim()) {
      await deletePendingCommentAlertFromTelegram({
        settings: backupSettings,
        messageId: updated.pendingTelegramMessageId,
      })
    }
    await NewsCommentModel.findByIdAndUpdate(updated._id, {
      $unset: { pendingTelegramMessageId: 1 },
    })
  }

  return Response.json(updated)
}