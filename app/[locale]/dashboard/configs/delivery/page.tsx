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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/common/components/ui/select'
import type { SiteSettingsPayload } from '@/shared/common/lib/site-settings-types'
import { useSiteSettings } from '@/features/dashboard/configs/site-settings-context'
import { ConfigsLoading, ConfigsPageShell } from '../_components/configs-page-shell'

const MODEL_KEYS = [
  'news',
  'categories',
  'tags',
  'comments',
  'reactions',
  'ads',
  'team',
  'users',
] as const

export default function ConfigsContentDeliveryPage() {
  const {
    loading,
    data,
    isCeo,
    savingDelivery,
    savingTelegram,
    setClientDeliveryField,
    setClientDeliveryModel,
    handleSaveDelivery,
    setTelegramField,
    handleSaveTelegram,
  } = useSiteSettings()
  if (loading || !data) return <ConfigsLoading />

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
          <Card className="border-destructive/40 bg-destructive/5 py-4">
            <CardHeader className="px-4 md:px-6">
              <CardTitle className="text-base text-destructive">Telegram</CardTitle>
              <CardDescription>
                Yangilik chop etilganda Telegram kanalga yuborish.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 px-4 md:px-6">
              <div className="flex items-center justify-between rounded-md border p-3">
                <div>
                  <Label>Telegram yuborishni yoqish</Label>
                </div>
                <Switch
                  checked={data.telegram.enabled}
                  onCheckedChange={(checked) => setTelegramField({ enabled: checked })}
                />
              </div>
              <div className="space-y-2">
                <Label>Bot token</Label>
                <Input
                  value={data.telegram.botToken}
                  onChange={(e) => setTelegramField({ botToken: e.target.value })}
                  placeholder="123456:AA..."
                />
              </div>
              <div className="space-y-2">
                <Label>Chat ID</Label>
                <Input
                  value={data.telegram.chatId}
                  onChange={(e) => setTelegramField({ chatId: e.target.value })}
                  placeholder="-1001234567890"
                />
              </div>
              <div className="space-y-2">
                <Label>Thread ID (ixtiyoriy)</Label>
                <Input
                  value={data.telegram.threadId ?? ''}
                  onChange={(e) => setTelegramField({ threadId: e.target.value || undefined })}
                  placeholder="42"
                />
              </div>
              <div className="flex justify-end">
                <Button
                  type="button"
                  className="w-full sm:w-auto"
                  onClick={() => void handleSaveTelegram()}
                  disabled={savingTelegram}
                >
                  Telegramni saqlash
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card className="gap-4 border-destructive/40 bg-destructive/5 py-4 md:gap-6 md:py-6">
            <CardHeader className="px-4 md:px-6">
              <CardTitle className="text-base text-destructive">Client uzatish boshqaruvi</CardTitle>
              <CardDescription>
                Faqat ommaviy saytga ta&apos;sir qiladi. Admin panel ishlayveradi.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 px-4 md:px-6">
              <div className="space-y-2">
                <Label>Rejim</Label>
                <Select
                  value={data.clientDelivery.mode}
                  onValueChange={(value) =>
                    setClientDeliveryField({
                      mode: value as SiteSettingsPayload['clientDelivery']['mode'],
                    })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="normal">normal</SelectItem>
                    <SelectItem value="nothing">nothing</SelectItem>
                    <SelectItem value="server-off">server-off</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Title</Label>
                <Input
                  value={data.clientDelivery.title}
                  onChange={(e) => setClientDeliveryField({ title: e.target.value })}
                  placeholder="Texnik ishlar"
                />
              </div>
              <div className="space-y-2">
                <Label>Description</Label>
                <Input
                  value={data.clientDelivery.description}
                  onChange={(e) => setClientDeliveryField({ description: e.target.value })}
                  placeholder="Qisqacha tushuntirish"
                />
              </div>
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
                {MODEL_KEYS.map((key) => (
                  <div
                    key={key}
                    className="flex items-center justify-between gap-3 rounded-md border p-3"
                  >
                    <Label className="min-w-0 shrink capitalize">{key}</Label>
                    <Switch
                      className="shrink-0"
                      checked={data.clientDelivery.models[key] ?? true}
                      onCheckedChange={(checked) => setClientDeliveryModel(key, checked)}
                    />
                  </div>
                ))}
              </div>
              <div className="flex justify-end">
                <Button
                  type="button"
                  className="w-full sm:w-auto"
                  onClick={() => void handleSaveDelivery()}
                  disabled={savingDelivery}
                >
                  Ma&apos;lumot uzatishni saqlash
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      ) : (
        <Card className="border-muted py-4 md:py-6">
          <CardHeader className="px-4 md:px-6">
            <CardTitle className="text-base">Kirish cheklangan</CardTitle>
            <CardDescription>
              Ma&apos;lumot uzatish va Telegram sozlamalarini faqat CEO o&apos;zgartira oladi.
            </CardDescription>
          </CardHeader>
        </Card>
      )}
    </ConfigsPageShell>
  )
}
