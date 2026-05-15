import { NextRequest } from 'next/server'
import { z } from 'zod'
import { requireAdminSession } from '@/shared/server/require-admin-session'
import {
  GeminiTranslateError,
  translateWithGemini,
  type GeminiTranslateField,
} from '@/shared/infra/gemini-translate'

const localeEnum = z.enum(['uz', 'uzb', 'ru', 'en'])

const bodySchema = z.object({
  sourceLocale: localeEnum,
  sourceText: z.string().min(1).max(120_000),
  fieldType: z.enum(['title', 'description', 'content']),
  targetLocales: z.array(localeEnum).min(1).max(4),
})

export async function POST(req: NextRequest) {
  const unauthorized = await requireAdminSession(['ceo', 'administrator', 'moderator'])
  if (unauthorized) return unauthorized

  try {
    const json = await req.json()
    const parsed = bodySchema.safeParse(json)
    if (!parsed.success) {
      return Response.json(
        { error: 'Invalid request', issues: parsed.error.flatten() },
        { status: 400 }
      )
    }

    const { sourceLocale, sourceText, fieldType, targetLocales } = parsed.data
    const uniqueTargets = [...new Set(targetLocales)].filter((l) => l !== sourceLocale)

    if (uniqueTargets.length === 0) {
      return Response.json({ error: 'Tarjima qilinadigan til yo‘q' }, { status: 400 })
    }

    const translations = await translateWithGemini({
      sourceLocale,
      sourceText,
      fieldType: fieldType as GeminiTranslateField,
      targetLocales: uniqueTargets,
    })

    return Response.json({ translations })
  } catch (err) {
    if (err instanceof GeminiTranslateError) {
      return Response.json(
        { error: err.message, code: err.code },
        { status: err.status }
      )
    }
    const message = err instanceof Error ? err.message : 'Tarjima amalga oshmadi'
    return Response.json({ error: message }, { status: 500 })
  }
}
