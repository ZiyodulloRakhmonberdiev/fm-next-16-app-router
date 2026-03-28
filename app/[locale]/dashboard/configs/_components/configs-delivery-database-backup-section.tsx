'use client'

import type { ReactNode } from 'react'
import { Card, CardContent } from '@/shared/common/components/ui/card'
import { Label } from '@/shared/common/components/ui/label'
import { Input } from '@/shared/common/components/ui/input'
import { Button } from '@/shared/common/components/ui/button'
import { Switch } from '@/shared/common/components/ui/switch'
import { Database } from 'lucide-react'
import type { DatabaseBackupSettings } from '@/shared/common/lib/site-settings-types'

export type ConfigsDeliveryDatabaseBackupSectionProps = {
  heading?: string
  extraHelp?: ReactNode
  enabled: boolean
  botToken: string
  chatId: string
  threadId?: string
  commentThreadId?: string
  contactThreadId?: string
  onEnabledChange: (enabled: boolean) => void
  onPatch: (patch: Partial<DatabaseBackupSettings>) => void
  onSaveSettings: () => void | Promise<void>
  onSendNow: () => void | Promise<void>
  savingSettings: boolean
  sending: boolean
  sendNowLabel?: string
  savingLabel?: string
}

export function ConfigsDeliveryDatabaseBackupSection({
  heading = 'MongoDB backup: Telegram',
  extraHelp,
  enabled,
  botToken,
  chatId,
  threadId,
  commentThreadId,
  contactThreadId,
  onEnabledChange,
  onPatch,
  onSaveSettings,
  onSendNow,
  savingSettings,
  sending,
  sendNowLabel = 'Backupni hozir yuborish',
  savingLabel = 'Backup sozlamalarini saqlash',
}: ConfigsDeliveryDatabaseBackupSectionProps) {
  return (
    <Card>
      <CardContent>
        <div className="space-y-4">
          <div className="flex items-start gap-2">
            <Database className="mt-0.5 size-5 shrink-0 text-muted-foreground" aria-hidden />
            <div className="min-w-0 space-y-1">
              <p className="text-sm font-medium leading-none">{heading}</p>
              {extraHelp ? (
                <div className="text-xs text-muted-foreground [&_code]:rounded [&_code]:bg-muted [&_code]:px-1 [&_code]:py-0.5 [&_code]:text-[11px]">
                  {extraHelp}
                </div>
              ) : null}
            </div>
          </div>
          <div className="flex items-center justify-between rounded-md border p-3">
            <div>
              <Label>Avtomatik backup (cron)</Label>
            </div>
            <Switch checked={enabled} onCheckedChange={onEnabledChange} />
          </div>
          <div className="space-y-2">
            <Label>Backup bot token</Label>
            <Input
              value={botToken}
              onChange={(e) => onPatch({ botToken: e.target.value })}
              placeholder="123456:AA..."
              autoComplete="off"
            />
          </div>
          <div className="space-y-2">
            <Label>Backup chat ID</Label>
            <Input
              value={chatId}
              onChange={(e) => onPatch({ chatId: e.target.value })}
              placeholder="-100..."
              autoComplete="off"
            />
          </div>
          <div className="space-y-2">
            <Label>Thread ID (ixtiyoriy)</Label>
            <Input
              value={threadId ?? ''}
              onChange={(e) => onPatch({ threadId: e.target.value || undefined })}
              placeholder="42"
            />
          </div>
          <div className="space-y-2">
            <Label>Comment thread ID (ixtiyoriy)</Label>
            <Input
              value={commentThreadId ?? ''}
              onChange={(e) => onPatch({ commentThreadId: e.target.value || undefined })}
              placeholder="Masalan: 77"
            />
          </div>
          <div className="space-y-2">
            <Label>Contact thread ID (ixtiyoriy)</Label>
            <Input
              value={contactThreadId ?? ''}
              onChange={(e) => onPatch({ contactThreadId: e.target.value || undefined })}
              placeholder="Masalan: 88"
            />
          </div>
          <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:justify-end">
            <Button
              type="button"
              variant="secondary"
              className="w-full sm:w-auto"
              onClick={() => void onSaveSettings()}
              disabled={savingSettings}
            >
              {savingLabel}
            </Button>
            <Button type="button" className="w-full sm:w-auto" onClick={() => void onSendNow()} disabled={sending}>
              {sending ? 'Yuborilmoqda…' : sendNowLabel}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
