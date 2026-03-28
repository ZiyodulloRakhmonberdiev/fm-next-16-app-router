import { NextRequest } from "next/server"
import { dbConnect } from "@/shared/common/lib/db"
import { requireAdminSession } from "@/shared/server/require-admin-session"
import { ContactMessageModel } from "@/features/contact/model/contact-message.model"
import {
  SiteSettingsModel,
  SITE_SETTINGS_DOCUMENT_ID,
  leanDocToPayload,
} from "@/features/dashboard/configs/site-settings.model"
import { sendContactToTelegram } from "@/shared/infra/telegram"

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const unauthorized = await requireAdminSession(["ceo", "administrator", "moderator"])
  if (unauthorized) return unauthorized

  await dbConnect()
  const item = await ContactMessageModel.findById((await params).id)
  if (!item) {
    return Response.json({ error: "Xabar topilmadi" }, { status: 404 })
  }

  const settingsDoc = await SiteSettingsModel.findById(SITE_SETTINGS_DOCUMENT_ID).lean()
  const settingsPayload = leanDocToPayload(settingsDoc)
  const deliverySettings = settingsPayload?.databaseBackup
  if (!deliverySettings?.botToken?.trim() || !deliverySettings.chatId?.trim()) {
    return Response.json({ error: "Telegram sozlamalari to'liq emas" }, { status: 400 })
  }

  const fullName = [item.firstName, item.lastName].filter(Boolean).join(" ").trim()
  const fullPhone = [item.phoneCode, item.phoneNumber].filter(Boolean).join(" ").trim()
  const tg = await sendContactToTelegram({
    settings: deliverySettings,
    fullName,
    email: item.email,
    phone: fullPhone || undefined,
    message: item.message,
    locale: item.locale || undefined,
  })

  if (!tg.ok) {
    item.telegramStatus = "failed"
    item.telegramError = tg.telegramDescription ?? tg.error
    await item.save()
    return Response.json({ error: item.telegramError ?? "Telegram xatosi" }, { status: 502 })
  }

  item.telegramStatus = "sent"
  item.telegramError = undefined
  if (tg.messageId) item.telegramMessageId = tg.messageId
  await item.save()

  return Response.json({ ok: true, telegramMessageId: item.telegramMessageId })
}
