import { gzipSync } from 'node:zlib'
import { Types } from 'mongoose'
import { dbConnect } from '@/shared/common/lib/db'
import { AdModel } from '@/features/ads/model/ads.model'
import { AdFeedbackModel } from '@/features/ads/model/ad-feedback.model'
import { CategoryModel } from '@/features/category/model/category.model'
import { ContactMessageModel } from '@/features/contact/model/contact-message.model'
import { SiteSettingsModel } from '@/features/dashboard/configs/site-settings.model'
import { NewsModel } from '@/features/news/model/news.model'
import { NewsCommentModel } from '@/features/news/model/comment.model'
import { NewsReactionModel } from '@/features/news/model/reaction.model'
import { SavedNewsModel } from '@/features/news/model/saved-news.model'
import { TagModel } from '@/features/tags/model/tag.model'
import { TeamMemberModel } from '@/features/team/model/team.model'
import { UserModel } from '@/features/users/model/user.model'
import type { DatabaseBackupSettings } from '@/shared/common/lib/site-settings-types'

/** Telegram Bot API — hujjat yuborish (~50 MB cheklov) */
export const TELEGRAM_MAX_DOCUMENT_BYTES = 50 * 1024 * 1024

function backupJsonReplacer(_key: string, value: unknown): unknown {
  if (value instanceof Date) return value.toISOString()
  if (value instanceof Types.ObjectId) return value.toString()
  if (typeof value === 'bigint') return value.toString()
  return value
}

export type DatabaseBackupArchive = {
  buffer: Buffer
  filename: string
  jsonBytes: number
  gzipBytes: number
}

/**
 * Barcha asosiy MongoDB kolleksiyalarini JSON + gzip qilib qaytaradi.
 * Tiklash: gzip ochib JSON ni import skripti bilan yuklash (qo‘lda).
 */
export async function createDatabaseBackupArchive(): Promise<DatabaseBackupArchive> {
  await dbConnect()

  const collections = {
    news: await NewsModel.find({}).lean(),
    users: await UserModel.find({}).lean(),
    categories: await CategoryModel.find({}).lean(),
    tags: await TagModel.find({}).lean(),
    siteSettings: await SiteSettingsModel.find({}).lean(),
    ads: await AdModel.find({}).lean(),
    adFeedback: await AdFeedbackModel.find({}).lean(),
    contactMessages: await ContactMessageModel.find({}).lean(),
    newsComments: await NewsCommentModel.find({}).lean(),
    newsReactions: await NewsReactionModel.find({}).lean(),
    savedNews: await SavedNewsModel.find({}).lean(),
    teamMembers: await TeamMemberModel.find({}).lean(),
  }

  const doc = {
    version: 1,
    exportedAt: new Date().toISOString(),
    collections,
  }

  const json = JSON.stringify(doc, backupJsonReplacer)
  const jsonBuffer = Buffer.from(json, 'utf-8')
  const gzipBuffer = gzipSync(jsonBuffer, { level: 9 })
  const stamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19)
  const filename = `db-backup-${stamp}.json.gz`

  return {
    buffer: gzipBuffer,
    filename,
    jsonBytes: jsonBuffer.length,
    gzipBytes: gzipBuffer.length,
  }
}

export async function sendBackupDocumentToTelegram(input: {
  botToken: string
  chatId: string
  threadId?: number
  buffer: Buffer
  filename: string
  caption: string
}): Promise<{ ok: true } | { ok: false; error: string; telegramDescription?: string }> {
  const token = input.botToken.trim()
  const chatId = input.chatId.trim()
  if (!token || !chatId) {
    return { ok: false, error: "Bot token yoki chat id bo'sh" }
  }

  if (input.buffer.length > TELEGRAM_MAX_DOCUMENT_BYTES) {
    return {
      ok: false,
      error: `Fayl ${(input.buffer.length / (1024 * 1024)).toFixed(1)} MB — Telegram limiti ~50 MB`,
    }
  }

  const url = `https://api.telegram.org/bot${token}/sendDocument`
  const formData = new FormData()
  formData.append('chat_id', chatId)
  if (input.threadId != null && Number.isFinite(input.threadId)) {
    formData.append('message_thread_id', String(Math.floor(input.threadId)))
  }
  const cap = input.caption.trim().slice(0, 1024)
  if (cap) formData.append('caption', cap)
  const blob = new Blob([new Uint8Array(input.buffer)], { type: 'application/gzip' })
  formData.append('document', blob, input.filename)

  const res = await fetch(url, { method: 'POST', body: formData })
  const data = (await res.json().catch(() => null)) as
    | { ok?: boolean; description?: string }
    | null

  if (!res.ok || !data?.ok) {
    const desc = typeof data?.description === 'string' ? data.description : res.statusText
    return { ok: false, error: 'Telegram xatosi', telegramDescription: desc }
  }

  return { ok: true }
}

export type DatabaseBackupJobResult =
  | { status: 'sent'; filename: string; jsonBytes: number; gzipBytes: number }
  | { status: 'failed'; error: string; telegramDescription?: string }
  | { status: 'skipped'; reason: string }

/**
 * @param requireScheduledEnabled — `true`: faqat cron; sozlamada `enabled` bo‘lmasa yoki token bo‘sh bo‘lsa skip.
 * Manual yuborishda `false` — token/chatId bo‘lmasa `failed`.
 */
export async function runDatabaseBackupToTelegram(
  settings: DatabaseBackupSettings,
  opts: { requireScheduledEnabled: boolean }
): Promise<DatabaseBackupJobResult> {
  if (opts.requireScheduledEnabled && !settings.enabled) {
    return { status: 'skipped', reason: 'scheduled_backup_disabled' }
  }

  const token = settings.botToken.trim()
  const chatId = settings.chatId.trim()
  if (!token || !chatId) {
    if (opts.requireScheduledEnabled) {
      return { status: 'skipped', reason: 'missing_bot_token_or_chat_id' }
    }
    return { status: 'failed', error: "Backup uchun bot token va chat id kiriting (sozlamalarni saqlang)" }
  }

  let archive: DatabaseBackupArchive
  try {
    archive = await createDatabaseBackupArchive()
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e)
    return { status: 'failed', error: `Arxiv yaratishda xato: ${msg}` }
  }

  const caption = [
    "🗄 Ma'lumotlar bazasi arxivi",
    archive.filename,
    `JSON: ${(archive.jsonBytes / 1024).toFixed(1)} KB`,
    `gzip: ${(archive.gzipBytes / 1024).toFixed(1)} KB`,
  ].join('\n')

  const threadRaw = settings.threadId?.trim()
  const threadId = threadRaw ? Number(threadRaw) : undefined
  const send = await sendBackupDocumentToTelegram({
    botToken: token,
    chatId,
    threadId: threadId != null && Number.isFinite(threadId) ? threadId : undefined,
    buffer: archive.buffer,
    filename: archive.filename,
    caption,
  })

  if (!send.ok) {
    return {
      status: 'failed',
      error: send.error,
      telegramDescription: send.telegramDescription,
    }
  }

  return {
    status: 'sent',
    filename: archive.filename,
    jsonBytes: archive.jsonBytes,
    gzipBytes: archive.gzipBytes,
  }
}

function escapeTelegramHtml(text: string): string {
  return text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
}

function resolvePublicBaseUrl(requestOrigin: string): string {
  const fromEnv =
    process.env.NEXT_PUBLIC_SITE_URL?.trim() ||
    process.env.SITE_URL?.trim() ||
    process.env.PUBLIC_SITE_URL?.trim()
  if (fromEnv) return fromEnv.replace(/\/$/, '')
  return requestOrigin.replace(/\/$/, '')
}

export async function sendPendingCommentAlertToTelegram(input: {
  settings: DatabaseBackupSettings
  requestOrigin: string
  newsTitle: string
  commentText: string
}): Promise<{ ok: true; messageId?: number } | { ok: false; error: string; telegramDescription?: string }> {
  const token = input.settings.botToken.trim()
  const chatId = input.settings.chatId.trim()
  if (!token || !chatId) {
    return { ok: false, error: "Comment alert uchun bot token/chat id bo'sh" }
  }

  const threadRaw = input.settings.commentThreadId?.trim() || input.settings.threadId?.trim()
  const threadId = threadRaw ? Number(threadRaw) : undefined
  const base = resolvePublicBaseUrl(input.requestOrigin)
  const reviewUrl = `${base}/dashboard/comments`

  const text = [
    `<b>${escapeTelegramHtml(input.newsTitle)}</b>`,
    escapeTelegramHtml(input.commentText),
  ].join('\n\n')

  const payload: Record<string, unknown> = {
    chat_id: chatId,
    parse_mode: 'HTML',
    text,
    disable_web_page_preview: true,
    reply_markup: {
      inline_keyboard: [
        [{ text: 'Preview', url: reviewUrl }],
      ],
    },
  }
  if (threadId != null && Number.isFinite(threadId)) {
    payload.message_thread_id = Math.floor(threadId)
  }

  const url = `https://api.telegram.org/bot${token}/sendMessage`
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })
  const data = (await res.json().catch(() => null)) as
    | { ok?: boolean; description?: string; result?: { message_id?: number } }
    | null
  if (!res.ok || !data?.ok) {
    const desc = typeof data?.description === 'string' ? data.description : res.statusText
    return { ok: false, error: 'Telegram xatosi', telegramDescription: desc }
  }
  return { ok: true, messageId: data?.result?.message_id }
}

export async function sendContactMessageToTelegram(input: {
  settings: DatabaseBackupSettings
  fullName: string
  email: string
  phone?: string
  message: string
  locale?: string
}): Promise<{ ok: true; messageId?: number } | { ok: false; error: string; telegramDescription?: string }> {
  const token = input.settings.botToken.trim()
  const chatId = input.settings.chatId.trim()
  if (!token || !chatId) {
    return { ok: false, error: "Contact alert uchun bot token/chat id bo'sh" }
  }

  const threadRaw = input.settings.contactThreadId?.trim() || input.settings.threadId?.trim()
  const threadId = threadRaw ? Number(threadRaw) : undefined
  const payload: Record<string, unknown> = {
    chat_id: chatId,
    parse_mode: 'HTML',
    text: [
      '📩 <b>Yangi contact xabari</b>',
      `<b>Ism:</b> ${escapeTelegramHtml(input.fullName)}`,
      `<b>Email:</b> ${escapeTelegramHtml(input.email)}`,
      input.phone ? `<b>Telefon:</b> ${escapeTelegramHtml(input.phone)}` : '',
      input.locale ? `<b>Til:</b> ${escapeTelegramHtml(input.locale)}` : '',
      '',
      escapeTelegramHtml(input.message),
    ]
      .filter(Boolean)
      .join('\n'),
    disable_web_page_preview: true,
  }
  if (threadId != null && Number.isFinite(threadId)) {
    payload.message_thread_id = Math.floor(threadId)
  }

  const url = `https://api.telegram.org/bot${token}/sendMessage`
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })
  const data = (await res.json().catch(() => null)) as
    | { ok?: boolean; description?: string; result?: { message_id?: number } }
    | null

  if (!res.ok || !data?.ok) {
    const desc = typeof data?.description === 'string' ? data.description : res.statusText
    return { ok: false, error: 'Telegram xatosi', telegramDescription: desc }
  }

  return { ok: true, messageId: data?.result?.message_id }
}

export async function deletePendingCommentAlertFromTelegram(input: {
  settings: DatabaseBackupSettings
  messageId?: number
}): Promise<{ ok: true } | { ok: false; error: string; telegramDescription?: string }> {
  if (!input.messageId) return { ok: true }
  const token = input.settings.botToken.trim()
  const chatId = input.settings.chatId.trim()
  if (!token || !chatId) {
    return { ok: false, error: "Comment alert delete uchun bot token/chat id bo'sh" }
  }

  const url = `https://api.telegram.org/bot${token}/deleteMessage`
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      chat_id: chatId,
      message_id: input.messageId,
    }),
  })
  const data = (await res.json().catch(() => null)) as
    | { ok?: boolean; description?: string }
    | null
  if (!res.ok || !data?.ok) {
    const desc = typeof data?.description === 'string' ? data.description : res.statusText
    return { ok: false, error: 'Telegram xatosi', telegramDescription: desc }
  }
  return { ok: true }
}
