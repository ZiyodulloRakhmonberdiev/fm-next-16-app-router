import { NextRequest } from 'next/server'
import { seed } from '@/scripts/seed'
import type { SiteSettingsPayload } from '@/shared/common/lib/site-settings-types'
import { requireAdminSession } from '@/shared/common/lib/require-admin-session'
import { readFile, writeFile, mkdir } from 'fs/promises'
import { join } from 'path'

const SETTINGS_PATH = join(process.cwd(), 'data', 'site-settings.json')

function getDefaultPayload(): SiteSettingsPayload {
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
      },
    },
  }
}

export async function GET() {
  try {
    const raw = await readFile(SETTINGS_PATH, 'utf-8')
    const parsed = JSON.parse(raw) as Partial<SiteSettingsPayload>
    const defaultPayload = getDefaultPayload()
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
    const merged: SiteSettingsPayload = {
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
    }
    return Response.json(merged)
  } catch {
    return Response.json(getDefaultPayload())
  }
}

export async function POST(request: NextRequest) {
  const unauthorized = await requireAdminSession(['ceo'])
  if (unauthorized) return unauthorized

  try {
    const body = (await request.json()) as SiteSettingsPayload
    const dir = join(process.cwd(), 'data')
    await mkdir(dir, { recursive: true })
    await writeFile(SETTINGS_PATH, JSON.stringify(body, null, 2), 'utf-8')
    return Response.json({ ok: true })
  } catch (e) {
    console.error('site-settings POST', e)
    return Response.json({ ok: false, error: String(e) }, { status: 500 })
  }
}
