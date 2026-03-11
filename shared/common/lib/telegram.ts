import { readFile } from "node:fs/promises"
import { join } from "node:path"
import type { SiteSettingsPayload } from "./site-settings-types"

const SETTINGS_PATH = join(process.cwd(), "data", "site-settings.json")

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

  const detailUrl = `${input.origin}/news/${input.slug}`
  const trimmedDescription = truncateWords(input.descriptionUzb ?? "", 56)
  const caption = [input.titleUzb, trimmedDescription].filter(Boolean).join("\n\n")
  const replyMarkup = {
    inline_keyboard: [
      [{ text: "Батафсил бу ерда", url: detailUrl }],
    ],
  }

  const basePayload: Record<string, unknown> = {
    chat_id: settings.chatId,
    reply_markup: replyMarkup,
  }
  if (settings.threadId) basePayload.message_thread_id = Number(settings.threadId)

  const absoluteVideo = toAbsoluteUrl(input.videoUrl, input.origin)
  const absoluteImage = toAbsoluteUrl(input.imageUrl, input.origin)

  let method = "sendMessage"
  const payload: Record<string, unknown> = { ...basePayload }
  const canSendMediaByUrl = !isLocalOrigin(input.origin)
  if (input.type === "video" && absoluteVideo && canSendMediaByUrl) {
    method = "sendVideo"
    payload.video = absoluteVideo
    payload.caption = caption
  } else if (input.type === "image" && absoluteImage && canSendMediaByUrl) {
    method = "sendPhoto"
    payload.photo = absoluteImage
    payload.caption = caption
  } else {
    payload.text = [caption, detailUrl].filter(Boolean).join("\n\n")
    payload.disable_web_page_preview = false
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

  // Fallback: if media send fails (common in localhost/private URLs), send plain text.
  if (method !== "sendMessage") {
    const fallbackUrl = `https://api.telegram.org/bot${settings.botToken}/sendMessage`
    const fallbackRes = await fetch(fallbackUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...basePayload,
        text: [caption, detailUrl].filter(Boolean).join("\n\n"),
        disable_web_page_preview: false,
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
