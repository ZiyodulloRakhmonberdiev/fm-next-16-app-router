import type { SiteSettingsPayload } from '@/shared/common/lib/site-settings-types'

/** Ommaviy yoki admin (CEO emas) uchun bot token va chat id chiqarilmaydi */
export function redactSiteSettingsSecrets(payload: SiteSettingsPayload): SiteSettingsPayload {
  return {
    ...payload,
    telegram: {
      ...payload.telegram,
      botToken: '',
      chatId: '',
      threadId: undefined,
    },
    databaseBackup: {
      ...payload.databaseBackup,
      botToken: '',
      chatId: '',
      threadId: undefined,
      commentThreadId: undefined,
      contactThreadId: undefined,
    },
  }
}
