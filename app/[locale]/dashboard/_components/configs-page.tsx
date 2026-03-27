'use client'
/* eslint-disable react/no-unescaped-entities */

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { normalizeRole } from '@/shared/common/lib/rbac'
import { toast } from 'sonner'
import { Card, CardDescription, CardHeader, CardTitle } from '@/shared/common/components/ui/card'
import type { AppLocale } from '@/shared/common/lib/locale-api'
import { LOCALES, LOCALE_LABELS } from '@/shared/common/lib/locale-constants'
import type { SiteSettingsPayload } from '@/shared/common/lib/site-settings-types'
import { Settings } from 'lucide-react'
import { HeadlineSection } from '../configs/_components/headline-section'
import { DescriptionSection } from '../configs/_components/description-section'
import { SocialMediaSection, type UiSocialItem } from '../configs/_components/social-media-section'
import { SiteConfigSection } from '../configs/_components/site-config-section'
import { ConfigsDeliveryTelegramSection } from '../configs/_components/configs-delivery-telegram-section'
import { ConfigsDeliveryClientSection } from '../configs/_components/configs-delivery-client-section'
import { ConfigsDeliveryDatabaseBackupSection } from '../configs/_components/configs-delivery-database-backup-section'
import type { ClientDeliveryModelKey } from '../configs/_components/configs-delivery-constants'

export function ConfigsPage() {
  const { data: session } = useSession()
  const role = normalizeRole(session?.user?.role)
  const isCeo = role === 'ceo'
  const [loading, setLoading] = useState(true)
  const [savingHeadline, setSavingHeadline] = useState(false)
  const [savingDescription, setSavingDescription] = useState(false)
  const [savingSocial, setSavingSocial] = useState(false)
  const [savingConfig, setSavingConfig] = useState(false)
  const [savingTelegram, setSavingTelegram] = useState(false)
  const [savingDelivery, setSavingDelivery] = useState(false)
  const [savingDatabaseBackup, setSavingDatabaseBackup] = useState(false)
  const [sendingDatabaseBackup, setSendingDatabaseBackup] = useState(false)
  const [data, setData] = useState<SiteSettingsPayload | null>(null)

  const defaultDatabaseBackup = (): SiteSettingsPayload['databaseBackup'] => ({
    enabled: false,
    botToken: '',
    chatId: '',
    threadId: undefined,
    commentThreadId: undefined,
  })

  useEffect(() => {
    fetch('/api/configs')
      .then((res) => res.json())
      .then((payload: SiteSettingsPayload) => {
        setData({
          ...payload,
          databaseBackup: payload.databaseBackup ?? defaultDatabaseBackup(),
        })
      })
      .catch(() => toast.error('Sozlamalarni yuklashda xato'))
      .finally(() => setLoading(false))
  }, [])

  const updateHeadline = (locale: AppLocale, value: string) => {
    if (!data) return
    setData({
      ...data,
      headline: {
        ...data.headline,
        message: { ...data.headline.message, [locale]: value },
      },
    })
  }

  const updateDescription = (locale: AppLocale, value: string) => {
    if (!data) return
    setData({ ...data, description: { ...data.description, [locale]: value } })
  }

  const updateSiteConfig = <K extends keyof SiteSettingsPayload['siteConfig']>(
    key: K,
    value: SiteSettingsPayload['siteConfig'][K]
  ) => {
    if (!data) return
    setData({ ...data, siteConfig: { ...data.siteConfig, [key]: value } })
  }

  const updateAddress = (locale: AppLocale, value: string) => {
    if (!data) return
    setData({
      ...data,
      siteConfig: {
        ...data.siteConfig,
        address: { ...data.siteConfig.address, [locale]: value },
      },
    })
  }

  const addSocialItem = (slug: string, href: string) => {
    if (!data) return
    const exists = data.socialMedia.some((s) => s.slug === slug)
    if (exists) {
      toast.error('Bu platforma allaqachon qo\'shilgan')
      return
    }
    const labelMap: Record<string, string> = {
      telegram: 'Telegram', instagram: 'Instagram', facebook: 'Facebook',
      youtube: 'YouTube', twitter: 'Twitter', threads: 'Threads', reddit: 'Reddit',
    }
    const name = labelMap[slug] ?? slug
    setData({ ...data, socialMedia: [...data.socialMedia, { slug, name, href }] })
  }

  const updateSocialHref = (index: number, href: string) => {
    if (!data) return
    const next = [...data.socialMedia]
    if (!next[index]) return
    next[index] = { ...next[index], href }
    setData({ ...data, socialMedia: next })
  }

  const removeSocialItem = (index: number) => {
    if (!data) return
    setData({ ...data, socialMedia: data.socialMedia.filter((_, i) => i !== index) })
  }

  const getCurrentFromServer = async (): Promise<SiteSettingsPayload | null> => {
    try {
      const res = await fetch('/api/configs')
      if (!res.ok) return null
      return (await res.json()) as SiteSettingsPayload
    } catch {
      return null
    }
  }

  const postPayload = async (payload: SiteSettingsPayload) => {
    const res = await fetch('/api/configs', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })
    const result = await res.json()
    return !!result?.ok
  }

  const handleSaveHeadline = async () => {
    if (!data) return
    setSavingHeadline(true)
    try {
      if (data.headline.enabled) {
        const hasAnyMessage = LOCALES.some((locale) => (data.headline.message[locale] ?? '').trim().length > 0)
        if (!hasAnyMessage) {
          toast.error("Headline yoqilgan bo'lsa, kamida bitta xabar kiriting")
          return
        }
      }
      const current = (await getCurrentFromServer()) ?? data
      const ok = await postPayload({ ...current, headline: data.headline })
      toast[ok ? 'success' : 'error'](ok ? 'Sarlavha saqlandi' : 'Saqlashda xato')
    } catch {
      toast.error('Saqlashda xato')
    } finally {
      setSavingHeadline(false)
    }
  }

  const handleSaveDescription = async () => {
    if (!data) return
    setSavingDescription(true)
    try {
      const current = (await getCurrentFromServer()) ?? data
      const ok = await postPayload({ ...current, description: data.description })
      toast[ok ? 'success' : 'error'](ok ? 'Tavsif saqlandi' : 'Saqlashda xato')
    } catch {
      toast.error('Saqlashda xato')
    } finally {
      setSavingDescription(false)
    }
  }

  const handleSaveSocial = async () => {
    if (!data) return
    setSavingSocial(true)
    try {
      const current = (await getCurrentFromServer()) ?? data
      const ok = await postPayload({ ...current, socialMedia: data.socialMedia })
      toast[ok ? 'success' : 'error'](ok ? 'Ijtimoiy tarmoqlar saqlandi' : 'Saqlashda xato')
    } catch {
      toast.error('Saqlashda xato')
    } finally {
      setSavingSocial(false)
    }
  }

  const handleSaveConfig = async () => {
    if (!data) return
    setSavingConfig(true)
    try {
      const current = (await getCurrentFromServer()) ?? data
      const ok = await postPayload({ ...current, siteConfig: data.siteConfig })
      toast[ok ? 'success' : 'error'](ok ? 'Site config saqlandi' : 'Saqlashda xato')
    } catch {
      toast.error('Saqlashda xato')
    } finally {
      setSavingConfig(false)
    }
  }

  const handleSaveTelegram = async () => {
    if (!data) return
    setSavingTelegram(true)
    try {
      if (data.telegram.enabled && (!data.telegram.botToken.trim() || !data.telegram.chatId.trim())) {
        toast.error("Telegram yoqilgan bo'lsa bot token va chat id majburiy")
        return
      }
      const current = (await getCurrentFromServer()) ?? data
      const ok = await postPayload({ ...current, telegram: data.telegram })
      toast[ok ? 'success' : 'error'](ok ? 'Telegram credentiallar saqlandi' : 'Saqlashda xato')
    } catch {
      toast.error('Saqlashda xato')
    } finally {
      setSavingTelegram(false)
    }
  }

  const handleSaveDelivery = async () => {
    if (!data) return
    setSavingDelivery(true)
    try {
      if (data.clientDelivery.mode !== 'normal' && (!data.clientDelivery.title.trim() || !data.clientDelivery.description.trim())) {
        toast.error("Bu rejimda title va description majburiy")
        return
      }
      const current = (await getCurrentFromServer()) ?? data
      const ok = await postPayload({ ...current, clientDelivery: data.clientDelivery })
      toast[ok ? 'success' : 'error'](ok ? "Client boshqaruvi saqlandi" : 'Saqlashda xato')
    } catch {
      toast.error('Saqlashda xato')
    } finally {
      setSavingDelivery(false)
    }
  }

  const handleSaveDatabaseBackup = async () => {
    if (!data) return
    setSavingDatabaseBackup(true)
    try {
      if (
        data.databaseBackup.enabled &&
        (!data.databaseBackup.botToken.trim() || !data.databaseBackup.chatId.trim())
      ) {
        toast.error("Avtomatik backup yoqilgan bo'lsa bot token va chat id majburiy")
        return
      }
      const current = (await getCurrentFromServer()) ?? data
      const ok = await postPayload({ ...current, databaseBackup: data.databaseBackup })
      toast[ok ? 'success' : 'error'](ok ? 'Backup sozlamalari saqlandi' : 'Saqlashda xato')
    } catch {
      toast.error('Saqlashda xato')
    } finally {
      setSavingDatabaseBackup(false)
    }
  }

  const handleSendDatabaseBackupNow = async () => {
    setSendingDatabaseBackup(true)
    try {
      const res = await fetch('/api/admin/database-backup', { method: 'POST' })
      const json = (await res.json().catch(() => null)) as {
        ok?: boolean
        error?: string
        telegramDescription?: string
        filename?: string
      } | null
      if (json?.ok && json.filename) {
        toast.success(`Backup yuborildi: ${json.filename}`)
        return
      }
      const extra =
        typeof json?.telegramDescription === 'string' && json.telegramDescription
          ? ` — ${json.telegramDescription}`
          : ''
      toast.error((json?.error ?? 'Yuborishda xato') + extra)
    } catch {
      toast.error('Yuborishda xato')
    } finally {
      setSendingDatabaseBackup(false)
    }
  }

  if (loading || !data) {
    return (
      <div className="flex items-center justify-center py-12 text-muted-foreground">
        Yuklanmoqda...
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <Card className="border-primary/30 bg-primary/5">
        <CardHeader className="flex flex-row items-center justify-between gap-4">
          <div>
            <CardTitle className="text-xl flex items-center gap-2">
              <Settings className="size-6" />
              Ma'lumotlar
            </CardTitle>
            <CardDescription className="hidden md:block">
              Headline, tavsif, ijtimoiy tarmoqlar va sayt konfiguratsiyasi
            </CardDescription>
          </div>
        </CardHeader>
      </Card>

      <HeadlineSection
        locales={LOCALES}
        localeLabels={LOCALE_LABELS}
        enabled={data.headline.enabled}
        values={data.headline.message}
        onToggleEnabled={(enabled) => {
          if (!data) return
          setData({ ...data, headline: { ...data.headline, enabled } })
        }}
        onChange={updateHeadline}
        onSave={handleSaveHeadline}
        saving={savingHeadline}
      />
      <DescriptionSection
        locales={LOCALES}
        localeLabels={LOCALE_LABELS}
        values={data.description}
        onChange={updateDescription}
        onSave={handleSaveDescription}
        saving={savingDescription}
      />
      <SocialMediaSection
        items={data.socialMedia as UiSocialItem[]}
        onAdd={addSocialItem}
        onUpdateHref={updateSocialHref}
        onRemove={removeSocialItem}
        onSave={handleSaveSocial}
        saving={savingSocial}
      />
      <SiteConfigSection
        locales={LOCALES}
        localeLabels={LOCALE_LABELS}
        value={data.siteConfig}
        onChangeField={updateSiteConfig}
        onChangeAddress={updateAddress}
        onSave={handleSaveConfig}
        saving={savingConfig}
      />

      {isCeo ? (
        <>
          <ConfigsDeliveryTelegramSection
            title="Danger zone: Telegram credentiallar"
            description="Yangiliklar yaratish/chop etishda Telegramga yuborish uchun sozlamalar. Faqat CEO o'zgartira oladi."
            enabled={data.telegram.enabled}
            botToken={data.telegram.botToken}
            chatId={data.telegram.chatId}
            threadId={data.telegram.threadId}
            onEnabledChange={(checked) =>
              setData((prev) => (prev ? { ...prev, telegram: { ...prev.telegram, enabled: checked } } : prev))
            }
            onBotTokenChange={(v) =>
              setData((prev) => (prev ? { ...prev, telegram: { ...prev.telegram, botToken: v } } : prev))
            }
            onChatIdChange={(v) =>
              setData((prev) => (prev ? { ...prev, telegram: { ...prev.telegram, chatId: v } } : prev))
            }
            onThreadIdChange={(v) =>
              setData((prev) => (prev ? { ...prev, telegram: { ...prev.telegram, threadId: v } } : prev))
            }
            onSave={handleSaveTelegram}
            saving={savingTelegram}
            saveButtonLabel="Saqlash"
          />

          <ConfigsDeliveryClientSection
            title="Danger zone: Ma'lumot uzatish boshqaruvi"
            description="Faqat client saytga ta'sir qiladi. Admin dashboard ishlashda davom etadi. Faqat CEO o'zgartira oladi."
            mode={data.clientDelivery.mode}
            titleValue={data.clientDelivery.title}
            descriptionValue={data.clientDelivery.description}
            models={data.clientDelivery.models}
            onModeChange={(mode) =>
              setData((prev) =>
                prev ? { ...prev, clientDelivery: { ...prev.clientDelivery, mode } } : prev
              )
            }
            onTitleChange={(v) =>
              setData((prev) =>
                prev ? { ...prev, clientDelivery: { ...prev.clientDelivery, title: v } } : prev
              )
            }
            onDescriptionChange={(v) =>
              setData((prev) =>
                prev ? { ...prev, clientDelivery: { ...prev.clientDelivery, description: v } } : prev
              )
            }
            onModelToggle={(key: ClientDeliveryModelKey, checked) =>
              setData((prev) =>
                prev
                  ? {
                      ...prev,
                      clientDelivery: {
                        ...prev.clientDelivery,
                        models: { ...prev.clientDelivery.models, [key]: checked },
                      },
                    }
                  : prev
              )
            }
            onSave={handleSaveDelivery}
            saving={savingDelivery}
            saveButtonLabel="Saqlash"
          />

          <ConfigsDeliveryDatabaseBackupSection
            heading="MongoDB backup — Telegram"
            extraHelp={
              <>
                Alohida bot va chat. Cron:{' '}
                <code className="rounded bg-muted px-1 py-0.5 text-[11px]">/api/cron/database-backup</code> +{' '}
                <code className="rounded bg-muted px-1 py-0.5 text-[11px]">Bearer</code> kalit (
                <code className="rounded bg-muted px-1 py-0.5 text-[11px]">CRON_SECRET</code> /{' '}
                <code className="rounded bg-muted px-1 py-0.5 text-[11px]">BACKUP_CRON_SECRET</code>).
              </>
            }
            enabled={data.databaseBackup.enabled}
            botToken={data.databaseBackup.botToken}
            chatId={data.databaseBackup.chatId}
            threadId={data.databaseBackup.threadId}
            commentThreadId={data.databaseBackup.commentThreadId}
            onEnabledChange={(checked) =>
              setData((prev) =>
                prev ? { ...prev, databaseBackup: { ...prev.databaseBackup, enabled: checked } } : prev
              )
            }
            onPatch={(patch) =>
              setData((prev) =>
                prev ? { ...prev, databaseBackup: { ...prev.databaseBackup, ...patch } } : prev
              )
            }
            onSaveSettings={() => void handleSaveDatabaseBackup()}
            onSendNow={() => void handleSendDatabaseBackupNow()}
            savingSettings={savingDatabaseBackup}
            sending={sendingDatabaseBackup}
          />
        </>
      ) : (
        <Card className="border-muted">
          <CardHeader>
            <CardTitle className="text-base">Credentiallar va content delivery</CardTitle>
            <CardDescription>Ushbu bo&apos;limni faqat CEO o&apos;zgartira oladi. Siz faqat ma&apos;lumotlar, headline, tavsif, ijtimoiy tarmoqlar va sayt konfiguratsiyasini tahrirlashingiz mumkin.</CardDescription>
          </CardHeader>
        </Card>
      )}
    </div>
  )
}
