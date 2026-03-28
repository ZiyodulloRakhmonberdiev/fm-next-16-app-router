import { readFile } from "node:fs/promises"
import { join } from "node:path"
import type { SiteSettingsPayload } from "@/shared/common/lib/site-settings-types"
import { getYoutubeVideoId } from "@/features/news/lib/youtube"

const SETTINGS_PATH = join(process.cwd(), "data", "site-settings.json")

const TELEGRAM_CHANNEL_INVITE = "https://t.me/ferganamedia"
const READ_ARTICLE_LINK_TEXT = "Мақолани ўқиш"
/** Photo/video caption HTML limit (Telegram). */
const MAX_CAPTION_HTML_CHARS = 1000

async function getTelegramSettings() {
  try {
    const raw = await readFile(SETTINGS_PATH, "utf-8")
    const parsed = JSON.parse(raw) as Partial<SiteSettingsPayload>
    return {
      enabled: Boolean(parsed.telegram?.enabled),
      botToken: parsed.telegram?.botToken?.trim() ?? "",
      chatId: parsed.telegram?.chatId?.trim() ?? "",
      threadId: parsed.telegram?.threadId ? Number(parsed.telegram.threadId) : undefined,
    }
  } catch {
    return {
      enabled: false,
      botToken: "",
      chatId: "",
      threadId: undefined,
    }
  }
}

function truncateWords(text: string, maxWords: number): string {
  const words = text.trim().split(/\s+/).filter(Boolean)
  if (words.length <= maxWords) return text.trim()
  return `${words.slice(0, maxWords).join(" ")}...`
}

function escapeTelegramHtml(text: string): string {
  return text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
}

/** HTML `href` uchun `&` ni qoplaydi. */
function escapeHref(url: string): string {
  return url.replace(/&/g, "&amp;")
}

function buildNewsTelegramHtml(input: {
  title: string
  description: string
  articleUrl: string
}): string {
  const titleBlock = `<b>${escapeTelegramHtml(input.title)}</b>`
  const desc = input.description.trim()
  const descBlock = desc ? escapeTelegramHtml(desc) : ""
  const linkLine = `<a href="${escapeHref(input.articleUrl)}">${READ_ARTICLE_LINK_TEXT}</a>`
  const footer = `Каналга уланиш:\n👉 ${TELEGRAM_CHANNEL_INVITE}`
  return [titleBlock, descBlock, linkLine, footer].filter(Boolean).join("\n\n")
}

/** Media caption uchun HTML uzunligini cheklash. */
function fitNewsHtmlForCaption(
  title: string,
  description: string,
  articleUrl: string,
  maxLen: number
): string {
  let desc = description
  let html = buildNewsTelegramHtml({ title, description: desc, articleUrl })
  let guard = 0
  while (html.length > maxLen && desc.length > 8 && guard < 24) {
    guard += 1
    desc = desc.slice(0, Math.floor(desc.length * 0.82)).trim()
    if (desc.length > 0 && !desc.endsWith("…")) desc = `${desc}…`
    html = buildNewsTelegramHtml({ title, description: desc, articleUrl })
  }
  if (html.length > maxLen) {
    return buildNewsTelegramHtml({ title, description: "", articleUrl })
  }
  return html
}

function toAbsoluteUrl(url: string | undefined, origin: string): string | undefined {
  if (!url) return undefined
  if (url.startsWith("http://") || url.startsWith("https://")) return url
  if (url.startsWith("/")) return `${origin}${url}`
  return `${origin}/${url}`
}

function isLocalOrigin(origin: string): boolean {
  return (
    origin.includes("localhost") ||
    origin.includes("127.0.0.1") ||
    origin.includes("0.0.0.0")
  )
}

function resolvePublicBaseUrl(requestOrigin: string): string {
  const fromEnv =
    process.env.NEXT_PUBLIC_SITE_URL?.trim() ||
    process.env.SITE_URL?.trim() ||
    process.env.PUBLIC_SITE_URL?.trim()
  if (fromEnv) return fromEnv.replace(/\/$/, "")
  const trimmed = requestOrigin.replace(/\/$/, "")
  return trimmed
}

function buildTelegramMessageLink(chatId: string, messageId: number, username?: string): string | undefined {
  if (username?.trim()) {
    return `https://t.me/${username.trim()}/${messageId}`
  }
  const normalized = chatId.trim()
  if (normalized.startsWith("-100")) {
    const internalChatId = normalized.replace("-100", "")
    return `https://t.me/c/${internalChatId}/${messageId}`
  }
  return undefined
}

type TelegramResponse = {
  ok?: boolean
  result?: {
    message_id?: number
    chat?: {
      id?: number
      username?: string
    }
  }
  description?: string
}

export type TelegramSendResult = {
  status: "sent" | "failed"
  reason?: string
  messageId?: number
  messageLink?: string
}

export type TelegramDeleteResult = {
  status: "deleted" | "failed" | "skipped"
  reason?: string
}

export async function sendNewsToTelegram(input: {
  titleUzb: string
  descriptionUzb?: string
  slug: string
  origin: string
  type?: string
  videoUrl?: string
  imageUrl?: string
}): Promise<TelegramSendResult> {
  const settings = await getTelegramSettings()
  if (!settings.enabled) return { status: "failed", reason: "Telegram yuborish o'chirilgan (enabled=false)." }
  if (!settings.botToken || !settings.chatId) {
    return { status: "failed", reason: "Telegram botToken/chatId sozlanmagan." }
  }

  const linkBase = resolvePublicBaseUrl(input.origin)
  const detailUrl = `${linkBase}/news/${input.slug}`
  const trimmedDescription = truncateWords(input.descriptionUzb ?? "", 56)

  const htmlMessage = buildNewsTelegramHtml({
    title: input.titleUzb,
    description: trimmedDescription,
    articleUrl: detailUrl,
  })
  const htmlCaption = fitNewsHtmlForCaption(
    input.titleUzb,
    trimmedDescription,
    detailUrl,
    MAX_CAPTION_HTML_CHARS
  )

  const basePayload: Record<string, unknown> = {
    chat_id: settings.chatId,
    parse_mode: "HTML",
  }
  if (settings.threadId) basePayload.message_thread_id = Number(settings.threadId)

  const absoluteVideo = toAbsoluteUrl(input.videoUrl, linkBase)
  const absoluteImage = toAbsoluteUrl(input.imageUrl, linkBase)
  const isYoutubeVideo = input.type === "video" && Boolean(getYoutubeVideoId(input.videoUrl ?? ""))
  
  if (isYoutubeVideo && !absoluteImage) {
    return { status: "failed", reason: "YouTube video uchun 1 ta poster rasm kiriting" }
  }

  let method = "sendMessage"
  const payload: Record<string, unknown> = { ...basePayload }
  const canSendMediaByUrl = !isLocalOrigin(linkBase)
  if (isYoutubeVideo && absoluteImage && canSendMediaByUrl) {
    method = "sendPhoto"
    payload.photo = absoluteImage
    payload.caption = htmlCaption
    payload.disable_web_page_preview = true
  } else if (input.type === "video" && absoluteVideo && canSendMediaByUrl) {
    method = "sendVideo"
    payload.video = absoluteVideo
    payload.caption = htmlCaption
  } else if (input.type === "image" && absoluteImage && canSendMediaByUrl) {
    method = "sendPhoto"
    payload.photo = absoluteImage
    payload.caption = htmlCaption
  } else {
    payload.text = htmlMessage
    payload.disable_web_page_preview = true
  }

  const url = `https://api.telegram.org/bot${settings.botToken}/${method}`
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  })
  const json = (await res.json().catch(() => null)) as TelegramResponse | null
  if (res.ok && json?.ok) {
    const messageId = json.result?.message_id
    const chatUsername = json.result?.chat?.username
    return {
      status: "sent",
      messageId,
      messageLink: messageId ? buildTelegramMessageLink(settings.chatId, messageId, chatUsername) : undefined,
    }
  }

  if (method !== "sendMessage") {
    const fallbackUrl = `https://api.telegram.org/bot${settings.botToken}/sendMessage`
    const fallbackRes = await fetch(fallbackUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: settings.chatId,
        parse_mode: "HTML",
        text: htmlMessage,
        disable_web_page_preview: true,
        ...(settings.threadId ? { message_thread_id: Number(settings.threadId) } : {}),
      }),
    })
    const fallbackJson = (await fallbackRes.json().catch(() => null)) as TelegramResponse | null
    if (fallbackRes.ok && fallbackJson?.ok) {
      const messageId = fallbackJson.result?.message_id
      const chatUsername = fallbackJson.result?.chat?.username
      return {
        status: "sent",
        messageId,
        messageLink: messageId ? buildTelegramMessageLink(settings.chatId, messageId, chatUsername) : undefined,
      }
    }
    const reason = fallbackJson?.description ?? "Telegram fallback yuborishda xatolik."
    console.error("[telegram] fallback failed:", reason)
    return { status: "failed", reason }
  }

  const reason = json?.description ?? "Telegram yuborishda xatolik."
  console.error("[telegram] send failed:", reason)
  return { status: "failed", reason }
}

export async function deleteNewsFromTelegram(input: {
  messageId?: number
}): Promise<TelegramDeleteResult> {
  if (!input.messageId) return { status: "skipped", reason: "messageId mavjud emas." }

  const settings = await getTelegramSettings()
  if (!settings.enabled) return { status: "failed", reason: "Telegram yuborish o'chirilgan (enabled=false)." }
  if (!settings.botToken || !settings.chatId) {
    return { status: "failed", reason: "Telegram botToken/chatId sozlanmagan." }
  }

  const url = `https://api.telegram.org/bot${settings.botToken}/deleteMessage`
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      chat_id: settings.chatId,
      message_id: input.messageId,
    }),
  })
  const json = (await res.json().catch(() => null)) as TelegramResponse | null
  if (res.ok && json?.ok) return { status: "deleted" }
  const reason = json?.description ?? "Telegramdan o'chirishda xatolik."
  return { status: "failed", reason }
}

export function escapeTelegramHtmlSimple(text: string): string {
  return escapeTelegramHtml(text)
}

/**
 * Sends a message to Telegram about NEW Contact Message
 */
export async function sendContactToTelegram(input: {
  settings: any // DatabaseBackupSettings
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

/**
 * Sends a message to Telegram about NEW Comment
 */
export async function sendPendingCommentAlertToTelegram(input: {
  settings: any // DatabaseBackupSettings
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
  
  const fromEnv =
    process.env.NEXT_PUBLIC_SITE_URL?.trim() ||
    process.env.SITE_URL?.trim() ||
    process.env.PUBLIC_SITE_URL?.trim()
  const base = fromEnv ? fromEnv.replace(/\/$/, '') : input.requestOrigin.replace(/\/$/, '')
  
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

/**
 * Deletes a message from Telegram
 */
export async function deletePendingCommentAlertFromTelegram(input: {
  settings: any // DatabaseBackupSettings
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
