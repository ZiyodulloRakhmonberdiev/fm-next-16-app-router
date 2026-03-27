'use client'

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/shared/common/components/ui/card'
import { Label } from '@/shared/common/components/ui/label'
import { Input } from '@/shared/common/components/ui/input'
import { Button } from '@/shared/common/components/ui/button'
import { Switch } from '@/shared/common/components/ui/switch'

export type ConfigsDeliveryTelegramSectionProps = {
  title?: string
  description?: string
  cardClassName?: string
  enabled: boolean
  botToken: string
  chatId: string
  threadId?: string
  onEnabledChange: (enabled: boolean) => void
  onBotTokenChange: (value: string) => void
  onChatIdChange: (value: string) => void
  onThreadIdChange: (value: string | undefined) => void
  onSave: () => void | Promise<void>
  saving: boolean
  saveButtonLabel?: string
}

export function ConfigsDeliveryTelegramSection({
  title = 'Telegram',
  description = "Yangilik chop etilganda Telegram kanalga yuborish.",
  cardClassName = 'border-destructive/40 bg-destructive/5 py-4',
  enabled,
  botToken,
  chatId,
  threadId,
  onEnabledChange,
  onBotTokenChange,
  onChatIdChange,
  onThreadIdChange,
  onSave,
  saving,
  saveButtonLabel = 'Telegramni saqlash',
}: ConfigsDeliveryTelegramSectionProps) {
  return (
    <Card className={cardClassName}>
      <CardHeader className="px-4 md:px-6">
        <CardTitle className="text-base text-destructive">{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4 px-4 md:px-6">
        <div className="flex items-center justify-between rounded-md border p-3">
          <div>
            <Label>Telegram yuborishni yoqish</Label>
          </div>
          <Switch checked={enabled} onCheckedChange={onEnabledChange} />
        </div>
        <div className="space-y-2">
          <Label>Bot token</Label>
          <Input
            value={botToken}
            onChange={(e) => onBotTokenChange(e.target.value)}
            placeholder="123456:AA..."
          />
        </div>
        <div className="space-y-2">
          <Label>Chat ID</Label>
          <Input
            value={chatId}
            onChange={(e) => onChatIdChange(e.target.value)}
            placeholder="-1001234567890"
          />
        </div>
        <div className="space-y-2">
          <Label>Thread ID (ixtiyoriy)</Label>
          <Input
            value={threadId ?? ''}
            onChange={(e) => onThreadIdChange(e.target.value || undefined)}
            placeholder="42"
          />
        </div>
        <div className="flex justify-end">
          <Button
            type="button"
            className="w-full sm:w-auto"
            onClick={() => void onSave()}
            disabled={saving}
          >
            {saveButtonLabel}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
