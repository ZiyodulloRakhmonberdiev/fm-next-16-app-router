/**
 * Yangilikni Telegram kanaliga/guruhiga yuborish.
 * .env da TELEGRAM_BOT_TOKEN va TELEGRAM_CHAT_ID o‘rnatilishi kerak.
 */

import type { NewsItem, RawNewsItem } from "@/features/news/model"

export type PushToTelegramOptions = {
  botToken?: string
  chatId?: string
  baseUrl?: string
}

export type PushToTelegramResult =
  | { ok: true; messageId: number }
  | { ok: false; error: string }


export async function push_to_telegram(
  news: NewsItem | RawNewsItem,
  options: PushToTelegramOptions = {}
): Promise<PushToTelegramResult> {
  const token = options.botToken ?? process.env.TELEGRAM_BOT_TOKEN
  const chatId = options.chatId ?? process.env.TELEGRAM_CHAT_ID
  const baseUrl = options.baseUrl ?? process.env.NEXT_PUBLIC_SITE_URL ?? ""

  if (!token || !chatId) {
    return {
      ok: false,
      error: "TELEGRAM_BOT_TOKEN yoki TELEGRAM_CHAT_ID o‘rnatilmagan",
    }
  }

  const title = "title" in news && typeof news.title === "string"
    ? news.title
    : (news as RawNewsItem).title?.uz ?? (news as RawNewsItem).title?.en ?? "Yangilik"
  const description = "description" in news && typeof (news as NewsItem).description === "string"
    ? (news as NewsItem).description
    : undefined
  const slug = news.slug
  const link = baseUrl ? `${baseUrl.replace(/\/$/, "")}/${slug.startsWith("news/") ? slug : `news/${slug}`}` : ""

  const text = [
    `<b>${escapeHtml(title)}</b>`,
    description ? escapeHtml(description).slice(0, 300) + (description.length > 300 ? "…" : "") : "",
    link ? `\n<a href="${link}">O‘qish</a>` : "",
  ]
    .filter(Boolean)
    .join("\n\n")

  const url = `https://api.telegram.org/bot${token}/sendMessage`
  const body = {
    chat_id: chatId,
    text,
    parse_mode: "HTML",
    disable_web_page_preview: true,
  }

  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    })
    const data = (await res.json()) as { ok: boolean; result?: { message_id: number }; description?: string }
    if (!res.ok || !data.ok) {
      return {
        ok: false,
        error: data.description ?? `HTTP ${res.status}`,
      }
    }
    return {
      ok: true,
      messageId: data.result!.message_id,
    }
  } catch (e) {
    const message = e instanceof Error ? e.message : String(e)
    return { ok: false, error: message }
  }
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
}
