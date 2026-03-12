import { readFile } from 'fs/promises'
import { join } from 'path'
import { seed } from '@/scripts/seed'
import type { ClientModelSwitches } from './site-settings-types'

const SETTINGS_PATH = join(process.cwd(), 'data', 'site-settings.json')

const defaultModels: ClientModelSwitches = {
  news: seed.clientDelivery.models.news,
  categories: seed.clientDelivery.models.categories,
  tags: seed.clientDelivery.models.tags,
  comments: seed.clientDelivery.models.comments,
  reactions: seed.clientDelivery.models.reactions,
  ads: seed.clientDelivery.models.ads,
  team: seed.clientDelivery.models.team,
  users: seed.clientDelivery.models.users,
}

/**
 * Server-only: reads site-settings.json and returns clientDelivery.models.
 * Used by API routes to enforce client delivery switches (return empty data when model is off).
 */
export async function getClientDeliveryModels(): Promise<ClientModelSwitches> {
  try {
    const raw = await readFile(SETTINGS_PATH, 'utf-8')
    const parsed = JSON.parse(raw) as { clientDelivery?: { models?: Partial<ClientModelSwitches> } }
    const models = parsed.clientDelivery?.models
    if (!models || typeof models !== 'object') return defaultModels
    return {
      ...defaultModels,
      ...models,
    }
  } catch {
    return defaultModels
  }
}

/**
 * Returns true if the given model is enabled for client delivery (public API may return data).
 */
export async function isClientDeliveryEnabled(
  model: keyof ClientModelSwitches
): Promise<boolean> {
  const models = await getClientDeliveryModels()
  return models[model] ?? true
}
