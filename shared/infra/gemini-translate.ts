import type { AppLocale } from '@/shared/common/lib/locale-api'
import {
  protectContentForTranslation,
  restoreContentAfterTranslation,
} from '@/features/news/lib/content-translate-protect'

const GEMINI_API_BASE = 'https://generativelanguage.googleapis.com/v1beta/models'

/**
 * Bepul AI Studio kalitlari uchun joriy modellar.
 * gemini-1.5-flash / gemini-2.0-flash eskirgan — 429 "quota" berishi mumkin (limit emas).
 * @see https://ai.google.dev/gemini-api/docs/models
 */
const DEFAULT_MODEL_CHAIN = [
  'gemini-2.5-flash-lite',
  'gemini-2.5-flash',
  'gemini-3.1-flash-lite',
] as const

export type GeminiTranslateField = 'title' | 'description' | 'content'

export class GeminiTranslateError extends Error {
  readonly status: number
  readonly code: 'QUOTA_EXCEEDED' | 'RATE_LIMIT' | 'AUTH' | 'API' | 'CONFIG'

  constructor(
    message: string,
    opts: { status: number; code: GeminiTranslateError['code'] }
  ) {
    super(message)
    this.name = 'GeminiTranslateError'
    this.status = opts.status
    this.code = opts.code
  }
}

const LOCALE_NAMES: Record<AppLocale, string> = {
  uz: "O'zbek (lotin)",
  uzb: "O'zbek (kirill)",
  ru: 'Russian',
  en: 'English',
}

function getApiKey(): string {
  const key = process.env.GEMINI_API_KEY?.trim()
  if (!key) {
    throw new GeminiTranslateError(
      "GEMINI_API_KEY sozlanmagan. .env.local faylida kalitni qo'shing.",
      { status: 503, code: 'CONFIG' }
    )
  }
  return key
}

function getModelChain(): string[] {
  const fromEnv = process.env.GEMINI_MODEL?.trim()
  if (fromEnv) return [fromEnv]
  return [...DEFAULT_MODEL_CHAIN]
}

function parseGeminiErrorBody(body: string): { message?: string; code?: number } {
  try {
    const parsed = JSON.parse(body) as {
      error?: { message?: string; code?: number; status?: string }
    }
    return {
      message: parsed.error?.message,
      code: parsed.error?.code,
    }
  } catch {
    return {}
  }
}

function toUserFacingError(status: number, body: string): GeminiTranslateError {
  const parsed = parseGeminiErrorBody(body)
  const apiMessage = parsed.message ?? ''

  if (status === 429) {
    const isQuota =
      /quota|billing|exceeded your current/i.test(apiMessage) ||
      parsed.code === 429

    return new GeminiTranslateError(
      isQuota
        ? "Gemini 429: kunlik limit tugagan bo‘lishi mumkin YOKI eski model ishlatilgan (masalan gemini-1.5-flash). .env.local da GEMINI_MODEL=gemini-2.5-flash-lite qo‘ying yoki AI Studio → Usage da limitni tekshiring. Billing odatda shart emas."
        : "Juda ko‘p so‘rov (daqiqalik limit). 30–60 soniyadan keyin qayta urinib ko‘ring.",
      { status: 429, code: isQuota ? 'QUOTA_EXCEEDED' : 'RATE_LIMIT' }
    )
  }

  if (status === 401 || status === 403) {
    return new GeminiTranslateError(
      "Gemini API kaliti noto'g'ri yoki ruxsat yo'q. GEMINI_API_KEY ni tekshiring.",
      { status, code: 'AUTH' }
    )
  }

  if (status === 404 && /model/i.test(apiMessage)) {
    return new GeminiTranslateError(
      "Tanlangan Gemini modeli topilmadi. GEMINI_MODEL=gemini-2.5-flash-lite qilib ko‘ring.",
      { status, code: 'API' }
    )
  }

  return new GeminiTranslateError(
    apiMessage
      ? `Gemini xatosi: ${apiMessage.slice(0, 180)}`
      : `Gemini API xatosi (${status})`,
    { status, code: 'API' }
  )
}

const CONTENT_MARKUP_RULES = `This is news article body text in a custom markdown-like format.

CRITICAL:
- Tokens like <<FM_SEG_0>>, <<FM_SEG_1>> are protected media/markup placeholders. Copy each placeholder EXACTLY once in the same position (same line order). Never delete, translate, or renumber them.
- Translate only plain human-readable text between placeholders.
- Keep markdown structure: # headings, **bold**, *italic*, lists.
- [link label](url) — translate label only, never the URL.`

function buildPrompt(
  sourceLocale: AppLocale,
  sourceText: string,
  targetLocales: AppLocale[],
  fieldType: GeminiTranslateField
): string {
  const sourceName = LOCALE_NAMES[sourceLocale]
  const targets = targetLocales.map((l) => `${l} (${LOCALE_NAMES[l]})`).join(', ')

  const fieldHint =
    fieldType === 'title'
      ? 'This is a news article headline. Keep it concise and natural.'
      : fieldType === 'description'
        ? 'This is a short news summary/lead paragraph.'
        : CONTENT_MARKUP_RULES

  return `You are a professional translator for a Uzbek news website.

${fieldHint}

Source language: ${sourceName} (${sourceLocale})
Target languages: ${targets}

Translate the following text. Return ONLY valid JSON with keys ${targetLocales.map((l) => `"${l}"`).join(' and ')} and string values. No markdown fences, no explanation.

Source text:
"""
${sourceText}
"""`
}

type GeminiResponse = {
  candidates?: Array<{
    content?: {
      parts?: Array<{ text?: string }>
    }
  }>
}

function parseTranslationJson(
  raw: string,
  targetLocales: AppLocale[]
): Partial<Record<AppLocale, string>> {
  const trimmed = raw.trim()
  const jsonMatch = trimmed.match(/\{[\s\S]*\}/)
  const jsonStr = jsonMatch ? jsonMatch[0] : trimmed

  let parsed: unknown
  try {
    parsed = JSON.parse(jsonStr)
  } catch {
    throw new GeminiTranslateError('Gemini noto‘g‘ri JSON qaytardi', {
      status: 500,
      code: 'API',
    })
  }

  if (!parsed || typeof parsed !== 'object') {
    throw new GeminiTranslateError('Tarjima javobi noto‘g‘ri', { status: 500, code: 'API' })
  }

  const out: Partial<Record<AppLocale, string>> = {}
  for (const loc of targetLocales) {
    const value = (parsed as Record<string, unknown>)[loc]
    if (typeof value !== 'string') {
      throw new GeminiTranslateError(`${loc} tilidagi tarjima topilmadi`, {
        status: 500,
        code: 'API',
      })
    }
    out[loc] = value.trim()
  }
  return out
}

async function callGeminiModel(
  model: string,
  apiKey: string,
  prompt: string
): Promise<string> {
  const url = `${GEMINI_API_BASE}/${model}:generateContent?key=${encodeURIComponent(apiKey)}`

  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: {
        temperature: 0.2,
        responseMimeType: 'application/json',
      },
    }),
  })

  if (!res.ok) {
    const errBody = await res.text().catch(() => '')
    throw toUserFacingError(res.status, errBody)
  }

  const data = (await res.json()) as GeminiResponse
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim()
  if (!text) {
    throw new GeminiTranslateError('Gemini bo‘sh javob qaytardi', { status: 500, code: 'API' })
  }
  return text
}

export async function translateWithGemini(params: {
  sourceLocale: AppLocale
  sourceText: string
  targetLocales: AppLocale[]
  fieldType: GeminiTranslateField
}): Promise<Partial<Record<AppLocale, string>>> {
  const sourceText = params.sourceText.trim()
  if (!sourceText) {
    throw new GeminiTranslateError('Manba matn bo‘sh', { status: 400, code: 'API' })
  }

  const targetLocales = params.targetLocales.filter((l) => l !== params.sourceLocale)
  if (targetLocales.length === 0) {
    return {}
  }

  let textForTranslation = sourceText
  let contentSegments: string[] | null = null
  if (params.fieldType === 'content') {
    const protected_ = protectContentForTranslation(sourceText)
    textForTranslation = protected_.protectedText
    contentSegments = protected_.segments
  }

  const apiKey = getApiKey()
  const prompt = buildPrompt(
    params.sourceLocale,
    textForTranslation,
    targetLocales,
    params.fieldType
  )
  const models = getModelChain()

  let lastError: GeminiTranslateError | null = null

  for (const model of models) {
    try {
      const text = await callGeminiModel(model, apiKey, prompt)
      const parsed = parseTranslationJson(text, targetLocales)
      if (contentSegments && contentSegments.length > 0) {
        for (const loc of targetLocales) {
          const val = parsed[loc]
          if (val) {
            parsed[loc] = restoreContentAfterTranslation(val, contentSegments, sourceText)
          }
        }
      }
      return parsed
    } catch (err) {
      if (!(err instanceof GeminiTranslateError)) {
        throw err
      }
      lastError = err
      // Limit tugasa boshqa modelga o‘tish foydasiz — darhol chiqamiz
      if (err.code === 'QUOTA_EXCEEDED' || err.code === 'AUTH' || err.code === 'CONFIG') {
        throw err
      }
      // 404 (model yo‘q) yoki rate limit — keyingi modelga urinib ko‘ramiz
      if (err.code === 'API' && err.status === 404) {
        continue
      }
      if (err.code === 'RATE_LIMIT') {
        continue
      }
      throw err
    }
  }

  throw (
    lastError ??
    new GeminiTranslateError('Tarjima amalga oshmadi', { status: 500, code: 'API' })
  )
}
