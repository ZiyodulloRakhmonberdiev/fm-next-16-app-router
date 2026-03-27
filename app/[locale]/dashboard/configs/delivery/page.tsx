'use client'

import * as React from 'react'
import { toast } from 'sonner'
import { useSiteSettings } from '@/features/dashboard/configs/site-settings-context'
import { ConfigsLoading, ConfigsPageShell } from '../_components/configs-page-shell'
import { ConfigsDeliveryTelegramSection } from '../_components/configs-delivery-telegram-section'
import { ConfigsDeliveryClientSection } from '../_components/configs-delivery-client-section'
import { ConfigsDeliveryDatabaseBackupSection } from '../_components/configs-delivery-database-backup-section'
import { ConfigsDeliveryDatabaseRestoreSection } from '../_components/configs-delivery-database-restore-section'
import { ConfigsDeliveryRestrictedCard } from '../_components/configs-delivery-restricted-card'
import type { ClientDeliveryModelKey } from '../_components/configs-delivery-constants'

export default function ConfigsContentDeliveryPage() {
  const {
    loading,
    data,
    isCeo,
    savingDelivery,
    savingTelegram,
    savingDatabaseBackup,
    sendingDatabaseBackup,
    setClientDeliveryField,
    setClientDeliveryModel,
    handleSaveDelivery,
    setTelegramField,
    handleSaveTelegram,
    setDatabaseBackupField,
    handleSaveDatabaseBackup,
    handleSendDatabaseBackupNow,
  } = useSiteSettings()
  const [restoreFile, setRestoreFile] = React.useState<File | null>(null)
  const [restoringDatabase, setRestoringDatabase] = React.useState(false)

  if (loading || !data) return <ConfigsLoading />

  const handleRestoreNow = async () => {
    if (!restoreFile) {
      toast.error('Backup fayl tanlang')
      return
    }

    setRestoringDatabase(true)
    try {
      const form = new FormData()
      form.append('file', restoreFile, restoreFile.name)

      const res = await fetch('/api/admin/database-restore', {
        method: 'POST',
        body: form,
      })

      const json = (await res.json().catch(() => null)) as
        | { ok?: boolean; error?: string; inserted?: Record<string, number> }
        | null

      if (res.ok && json?.ok) {
        toast.success('Tiklash tugadi')
        setRestoreFile(null)
        return
      }

      toast.error((json?.error ?? 'Tiklashda xato') as string)
    } catch {
      toast.error('Tiklashda xato')
    } finally {
      setRestoringDatabase(false)
    }
  }

  return (
    <ConfigsPageShell>
      <div className="space-y-1 px-2">
        <h1 className="text-xl font-semibold tracking-tight md:text-2xl">Ma&apos;lumot uzatish</h1>
        <p className="text-sm text-muted-foreground">
          Telegram yuborish va ommaviy saytga ma&apos;lumot uzatish rejimi, modellar.
        </p>
      </div>
      {isCeo ? (
        <div className="space-y-6">
          <ConfigsDeliveryTelegramSection
            enabled={data.telegram.enabled}
            botToken={data.telegram.botToken}
            chatId={data.telegram.chatId}
            threadId={data.telegram.threadId}
            onEnabledChange={(checked) => setTelegramField({ enabled: checked })}
            onBotTokenChange={(v) => setTelegramField({ botToken: v })}
            onChatIdChange={(v) => setTelegramField({ chatId: v })}
            onThreadIdChange={(v) => setTelegramField({ threadId: v })}
            onSave={() => void handleSaveTelegram()}
            saving={savingTelegram}
          />

          <ConfigsDeliveryClientSection
            mode={data.clientDelivery.mode}
            titleValue={data.clientDelivery.title}
            descriptionValue={data.clientDelivery.description}
            models={data.clientDelivery.models}
            onModeChange={(mode) => setClientDeliveryField({ mode })}
            onTitleChange={(v) => setClientDeliveryField({ title: v })}
            onDescriptionChange={(v) => setClientDeliveryField({ description: v })}
            onModelToggle={(key: ClientDeliveryModelKey, checked) =>
              setClientDeliveryModel(key, checked)
            }
            onSave={() => void handleSaveDelivery()}
            saving={savingDelivery}
          />

          <ConfigsDeliveryDatabaseBackupSection
            heading="MongoDB backup: Telegram"
            enabled={data.databaseBackup.enabled}
            botToken={data.databaseBackup.botToken}
            chatId={data.databaseBackup.chatId}
            threadId={data.databaseBackup.threadId}
            commentThreadId={data.databaseBackup.commentThreadId}
            onEnabledChange={(checked) => setDatabaseBackupField({ enabled: checked })}
            onPatch={(patch) => setDatabaseBackupField(patch)}
            onSaveSettings={() => void handleSaveDatabaseBackup()}
            onSendNow={() => void handleSendDatabaseBackupNow()}
            savingSettings={savingDatabaseBackup}
            sending={sendingDatabaseBackup}
          />

          <ConfigsDeliveryDatabaseRestoreSection
            restoreFile={restoreFile}
            onRestoreFileChange={setRestoreFile}
            onRestore={handleRestoreNow}
            restoring={restoringDatabase}
          />
        </div>
      ) : (
        <ConfigsDeliveryRestrictedCard />
      )}
    </ConfigsPageShell>
  )
}
