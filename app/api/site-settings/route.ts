import { NextRequest } from 'next/server'
import { seed } from '@/scripts/seed'
import type { SiteSettingsPayload } from '@/shared/common/lib/site-settings-types'
import { readFile, writeFile, mkdir } from 'fs/promises'
import { join } from 'path'

const SETTINGS_PATH = join(process.cwd(), 'data', 'site-settings.json')

function getDefaultPayload(): SiteSettingsPayload {
  return {
    headline: { ...seed.headline },
    description: { ...seed.description },
    socialMedia: seed.socialMedia.map((s) => ({
      slug: s.slug,
      name: { ...s.name },
      href: s.href,
    })),
    siteConfig: {
      email: seed.siteConfig.email,
      phone: seed.siteConfig.phone,
      address: { ...seed.siteConfig.address },
    },
  }
}

export async function GET() {
  try {
    const raw = await readFile(SETTINGS_PATH, 'utf-8')
    const parsed = JSON.parse(raw) as Partial<SiteSettingsPayload>
    const defaultPayload = getDefaultPayload()
    const merged: SiteSettingsPayload = {
      headline: { ...defaultPayload.headline, ...parsed.headline },
      description: { ...defaultPayload.description, ...parsed.description },
      socialMedia: Array.isArray(parsed.socialMedia)
        ? parsed.socialMedia
        : defaultPayload.socialMedia,
      siteConfig: {
        ...defaultPayload.siteConfig,
        ...parsed.siteConfig,
        address: { ...defaultPayload.siteConfig.address, ...parsed.siteConfig?.address },
      },
    }
    return Response.json(merged)
  } catch {
    return Response.json(getDefaultPayload())
  }
}

export async function POST(request: NextRequest) {
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
