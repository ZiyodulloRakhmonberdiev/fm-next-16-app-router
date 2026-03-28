import { dbConnect } from "@/shared/common/lib/db"
import {
  SiteSettingsModel,
  SITE_SETTINGS_DOCUMENT_ID,
  leanDocToPayload,
} from "@/features/dashboard/configs/site-settings.model"
import { ContactMessageModel } from "@/features/contact/model/contact-message.model"
import { requireAdminSession } from "@/shared/server/require-admin-session"
import { sendContactToTelegram } from "@/shared/infra/telegram"

export const runtime = "nodejs"

type ContactPayload = {
  firstName?: string
  lastName?: string
  email?: string
  phoneCode?: string
  phoneNumber?: string
  message?: string
  locale?: string
}

type AdminStatus = "new" | "in_progress" | "resolved" | "archived"
const ADMIN_STATUSES = ["new", "in_progress", "resolved", "archived"] as const

function cleanText(value: unknown, max: number): string {
  return typeof value === "string" ? value.trim().slice(0, max) : ""
}

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

function adminStatusFilter(status: AdminStatus): Record<string, unknown> {
  if (status === "new") {
    return {
      $or: [
        { adminStatus: "new" },
        { adminStatus: { $exists: false } },
        { adminStatus: null },
        { adminStatus: "" },
      ],
    }
  }
  return { adminStatus: status }
}

export async function GET(req: Request) {
  const unauthorized = await requireAdminSession(["ceo", "administrator", "moderator"])
  if (unauthorized) return unauthorized

  const { searchParams } = new URL(req.url)
  const adminStatus = cleanText(searchParams.get("adminStatus"), 24) as AdminStatus | ""

  await dbConnect()

  if (searchParams.get("counts") === "1") {
    const [newCount, inProgress, resolved, archived] = await Promise.all([
      ContactMessageModel.countDocuments(adminStatusFilter("new")),
      ContactMessageModel.countDocuments(adminStatusFilter("in_progress")),
      ContactMessageModel.countDocuments(adminStatusFilter("resolved")),
      ContactMessageModel.countDocuments(adminStatusFilter("archived")),
    ])
    return Response.json({
      new: newCount,
      in_progress: inProgress,
      resolved,
      archived,
    })
  }

  const filter: Record<string, unknown> = {}
  if (ADMIN_STATUSES.includes(adminStatus as AdminStatus)) {
    Object.assign(filter, adminStatusFilter(adminStatus as AdminStatus))
  }

  const rows = await ContactMessageModel.find(filter).sort({ createdAt: -1 }).lean()
  const data = rows.map((row) => ({
    ...row,
    _id: String(row._id),
    adminStatus: row.adminStatus || "new",
  }))
  return Response.json(data)
}

export async function POST(req: Request) {
  const body = (await req.json().catch(() => null)) as ContactPayload | null
  const firstName = cleanText(body?.firstName, 80)
  const lastName = cleanText(body?.lastName, 80)
  const email = cleanText(body?.email, 160).toLowerCase()
  const phoneCode = cleanText(body?.phoneCode, 12)
  const phoneNumber = cleanText(body?.phoneNumber, 32)
  const message = cleanText(body?.message, 3000)
  const locale = cleanText(body?.locale, 12)

  if (!firstName || !email || !message) {
    return Response.json({ ok: false, error: "required_fields_missing" }, { status: 400 })
  }
  if (!isValidEmail(email)) {
    return Response.json({ ok: false, error: "invalid_email" }, { status: 400 })
  }

  await dbConnect()

  const saved = await ContactMessageModel.create({
    firstName,
    lastName: lastName || undefined,
    email,
    phoneCode: phoneCode || undefined,
    phoneNumber: phoneNumber || undefined,
    message,
    locale: locale || undefined,
    source: "contact-page",
    adminStatus: "new",
    telegramStatus: "pending",
  })

  const settingsDoc = await SiteSettingsModel.findById(SITE_SETTINGS_DOCUMENT_ID).lean()
  const settingsPayload = leanDocToPayload(settingsDoc)
  const deliverySettings = settingsPayload?.databaseBackup
  const fullPhone = [phoneCode, phoneNumber].filter(Boolean).join(" ").trim()

  if (!deliverySettings?.botToken?.trim() || !deliverySettings.chatId?.trim()) {
    saved.telegramStatus = "failed"
    saved.telegramError = "Telegram sozlamalari to'liq emas"
    await saved.save()
    return Response.json({
      ok: true,
      savedId: saved._id,
      telegramStatus: "failed",
    })
  }

  const tg = await sendContactToTelegram({
    settings: deliverySettings,
    fullName: [firstName, lastName].filter(Boolean).join(" ").trim(),
    email,
    phone: fullPhone || undefined,
    message,
    locale: locale || undefined,
  })

  if (tg.ok) {
    saved.telegramStatus = "sent"
    if (tg.messageId) saved.telegramMessageId = tg.messageId
    saved.telegramError = undefined
    await saved.save()
    return Response.json({
      ok: true,
      savedId: saved._id,
      telegramStatus: "sent",
    })
  }

  saved.telegramStatus = "failed"
  saved.telegramError = tg.telegramDescription ?? tg.error
  await saved.save()

  return Response.json({
    ok: true,
    savedId: saved._id,
    telegramStatus: "failed",
  })
}
