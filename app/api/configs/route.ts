import { NextRequest } from 'next/server'
import { getServerSession } from 'next-auth'
import { readFile } from 'fs/promises'
import { join } from 'path'
import { authOptions } from '@/shared/common/lib/auth-options'
import { normalizeRole } from '@/shared/common/lib/rbac'
import { seed } from '@/scripts/seed'
import type { SiteSettingsPayload } from '@/shared/common/lib/site-settings-types'
import { redactSiteSettingsSecrets } from '@/shared/common/lib/redact-site-settings'
import { requireAdminSession } from '@/shared/common/lib/require-admin-session'
import { dbConnect } from '@/shared/common/lib/db'
import {
  SiteSettingsModel,
  SITE_SETTINGS_DOCUMENT_ID,
  leanDocToPayload,
} from '@/features/dashboard/configs/site-settings.model'

const SETTINGS_PATH = join(process.cwd(), 'data', 'site-settings.json')

export function getDefaultSiteSettingsPayload(): SiteSettingsPayload {
  return {
    headline: { enabled: true, message: { ...seed.headline } },
    description: { ...seed.description },
    socialMedia: seed.socialMedia.map((s) => ({
      slug: s.slug,
      name: s.name,
      href: s.href,
    })),
    siteConfig: {
      email: seed.siteConfig.email,
      phone: seed.siteConfig.phone,
      address: { ...seed.siteConfig.address },
    },
    telegram: {
      enabled: seed.telegram.enabled,
      botToken: seed.telegram.botToken,
      chatId: seed.telegram.chatId,
      threadId: seed.telegram.threadId || undefined,
    },
    clientDelivery: {
      mode: seed.clientDelivery.mode,
      title: seed.clientDelivery.title,
      description: seed.clientDelivery.description,
      models: {
        news: seed.clientDelivery.models.news,
        categories: seed.clientDelivery.models.categories,
        tags: seed.clientDelivery.models.tags,
        comments: seed.clientDelivery.models.comments,
        reactions: seed.clientDelivery.models.reactions,
        ads: seed.clientDelivery.models.ads,
        team: seed.clientDelivery.models.team,
        users: seed.clientDelivery.models.users,
      },
    },
    databaseBackup: {
      enabled: seed.databaseBackup.enabled,
      botToken: seed.databaseBackup.botToken,
      chatId: seed.databaseBackup.chatId,
      threadId: seed.databaseBackup.threadId || undefined,
    },
  }
}

/** Eski `site-settings.json` yoki qisman ma’lumotni default bilan birlashtiradi */
function mergePartialIntoDefaults(parsed: Partial<SiteSettingsPayload>): SiteSettingsPayload {
  const defaultPayload = getDefaultSiteSettingsPayload()
  const parsedHeadline = parsed.headline as
    | SiteSettingsPayload['headline']
    | Record<string, string>
    | undefined
  const parsedHeadlineMessage =
    parsedHeadline &&
    typeof parsedHeadline === 'object' &&
    'message' in parsedHeadline &&
    parsedHeadline.message &&
    typeof parsedHeadline.message === 'object'
      ? (parsedHeadline.message as Record<string, string>)
      : {}
  const normalizedHeadline: SiteSettingsPayload['headline'] =
    parsedHeadline && typeof parsedHeadline === 'object' && 'enabled' in parsedHeadline
      ? {
          enabled: Boolean(parsedHeadline.enabled),
          message: {
            ...defaultPayload.headline.message,
            ...parsedHeadlineMessage,
          },
        }
      : {
          enabled: true,
          message: {
            ...defaultPayload.headline.message,
            ...(parsedHeadline ?? {}),
          },
        }

  return {
    headline: normalizedHeadline,
    description: { ...defaultPayload.description, ...parsed.description },
    socialMedia: Array.isArray(parsed.socialMedia)
      ? parsed.socialMedia
      : defaultPayload.socialMedia,
    siteConfig: {
      ...defaultPayload.siteConfig,
      ...parsed.siteConfig,
      address: { ...defaultPayload.siteConfig.address, ...parsed.siteConfig?.address },
    },
    telegram: {
      ...defaultPayload.telegram,
      ...(parsed.telegram ?? {}),
    },
    clientDelivery: {
      ...defaultPayload.clientDelivery,
      ...(parsed.clientDelivery ?? {}),
      models: {
        ...defaultPayload.clientDelivery.models,
        ...(parsed.clientDelivery?.models ?? {}),
      },
    },
    databaseBackup: {
      ...defaultPayload.databaseBackup,
      ...(parsed.databaseBackup ?? {}),
    },
  }
}

function isMongoDuplicateKey(err: unknown): boolean {
  return typeof err === 'object' && err !== null && (err as { code?: number }).code === 11000
}

async function tryMigrateFromJsonFile(): Promise<boolean> {
  try {
    const raw = await readFile(SETTINGS_PATH, 'utf-8')
    const parsed = JSON.parse(raw) as Partial<SiteSettingsPayload>
    const merged = mergePartialIntoDefaults(parsed)
    await SiteSettingsModel.create({
      _id: SITE_SETTINGS_DOCUMENT_ID,
      ...merged,
    })
    return true
  } catch (e) {
    if (isMongoDuplicateKey(e)) return true
    return false
  }
}

async function ensureSiteSettingsInDb(): Promise<SiteSettingsPayload> {
  await dbConnect()
  let doc = await SiteSettingsModel.findById(SITE_SETTINGS_DOCUMENT_ID).lean()
  if (doc) {
    const p = leanDocToPayload(doc)
    if (p) return p
  }

  const migrated = await tryMigrateFromJsonFile()
  if (migrated) {
    doc = await SiteSettingsModel.findById(SITE_SETTINGS_DOCUMENT_ID).lean()
    const p = leanDocToPayload(doc)
    if (p) return p
  }

  const defaults = getDefaultSiteSettingsPayload()
  try {
    await SiteSettingsModel.create({
      _id: SITE_SETTINGS_DOCUMENT_ID,
      ...defaults,
    })
  } catch (e) {
    if (!isMongoDuplicateKey(e)) throw e
  }
  doc = await SiteSettingsModel.findById(SITE_SETTINGS_DOCUMENT_ID).lean()
  return leanDocToPayload(doc) ?? defaults
}

export async function GET() {
  try {
    const payload = await ensureSiteSettingsInDb()
    const session = await getServerSession(authOptions)
    const role = normalizeRole(session?.user?.role)
    if (role === 'ceo') {
      return Response.json(payload)
    }
    return Response.json(redactSiteSettingsSecrets(payload))
  } catch (e) {
    console.error('[api/configs GET]', e)
    return Response.json(redactSiteSettingsSecrets(getDefaultSiteSettingsPayload()))
  }
}

export async function POST(request: NextRequest) {
  const unauthorized = await requireAdminSession(['ceo', 'administrator'])
  if (unauthorized) return unauthorized

  const session = await getServerSession(authOptions)
  const role = normalizeRole(session?.user?.role)
  const isCeo = role === 'ceo'

  try {
    const body = (await request.json()) as SiteSettingsPayload
    await dbConnect()

    let payloadToWrite: SiteSettingsPayload

    if (isCeo) {
      payloadToWrite = body
    } else {
      const existingDoc = await SiteSettingsModel.findById(SITE_SETTINGS_DOCUMENT_ID).lean()
      const existing = leanDocToPayload(existingDoc) ?? (await ensureSiteSettingsInDb())
      const defaultPayload = getDefaultSiteSettingsPayload()
      payloadToWrite = {
        headline: body.headline ?? existing.headline ?? defaultPayload.headline,
        description: { ...defaultPayload.description, ...existing.description, ...body.description },
        socialMedia: Array.isArray(body.socialMedia)
          ? body.socialMedia
          : (existing.socialMedia ?? defaultPayload.socialMedia),
        siteConfig: {
          ...defaultPayload.siteConfig,
          ...existing.siteConfig,
          ...body.siteConfig,
          address: {
            ...defaultPayload.siteConfig.address,
            ...existing.siteConfig.address,
            ...body.siteConfig?.address,
          },
        },
        telegram: (existing.telegram ?? defaultPayload.telegram) as SiteSettingsPayload['telegram'],
        clientDelivery: (existing.clientDelivery ??
          defaultPayload.clientDelivery) as SiteSettingsPayload['clientDelivery'],
        databaseBackup: (existing.databaseBackup ??
          defaultPayload.databaseBackup) as SiteSettingsPayload['databaseBackup'],
      }
    }

    await SiteSettingsModel.findOneAndReplace(
      { _id: SITE_SETTINGS_DOCUMENT_ID },
      { _id: SITE_SETTINGS_DOCUMENT_ID, ...payloadToWrite },
      { upsert: true, new: true, runValidators: true }
    )

    return Response.json({ ok: true })
  } catch (e) {
    console.error('[api/configs POST]', e)
    return Response.json({ ok: false, error: String(e) }, { status: 500 })
  }
}
