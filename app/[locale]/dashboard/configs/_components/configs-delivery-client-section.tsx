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
import {
  CLIENT_DELIVERY_MODEL_KEYS,
  type ClientDeliveryModelKey,
} from './configs-delivery-constants'

export type ConfigsDeliveryClientSectionProps = {
  title?: string
  description?: string
  cardClassName?: string
  mode: SiteSettingsPayload['clientDelivery']['mode']
  titleValue: string
  descriptionValue: string
  models: SiteSettingsPayload['clientDelivery']['models']
  modelKeys?: readonly ClientDeliveryModelKey[]
  onModeChange: (mode: SiteSettingsPayload['clientDelivery']['mode']) => void
  onTitleChange: (value: string) => void
  onDescriptionChange: (value: string) => void
  onModelToggle: (key: ClientDeliveryModelKey, checked: boolean) => void
  onSave: () => void | Promise<void>
  saving: boolean
  saveButtonLabel?: string
}

export function ConfigsDeliveryClientSection({
  title = "Ma'lumot uzatish boshqaruvi",
  description = "Faqat ommaviy saytga ta'sir qiladi. Admin panel ishlayveradi.",
  cardClassName = 'gap-4 border-destructive/40 bg-destructive/5 py-4 md:gap-6 md:py-6',
  mode,
  titleValue,
  descriptionValue,
  models,
  modelKeys = CLIENT_DELIVERY_MODEL_KEYS,
  onModeChange,
  onTitleChange,
  onDescriptionChange,
  onModelToggle,
  onSave,
  saving,
  saveButtonLabel = "Ma'lumot uzatishni saqlash",
}: ConfigsDeliveryClientSectionProps) {
  return (
    <Card className={cardClassName}>
      <CardHeader className="px-4 md:px-6">
        <CardTitle className="text-base text-destructive">{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4 px-4 md:px-6">
        <div className="space-y-2">
          <Label>Rejim</Label>
          <Select value={mode} onValueChange={(v) => onModeChange(v as SiteSettingsPayload['clientDelivery']['mode'])}>
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
          <Input value={titleValue} onChange={(e) => onTitleChange(e.target.value)} placeholder="Texnik ishlar" />
        </div>
        <div className="space-y-2">
          <Label>Description</Label>
          <Input
            value={descriptionValue}
            onChange={(e) => onDescriptionChange(e.target.value)}
            placeholder="Qisqacha tushuntirish"
          />
        </div>
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {modelKeys.map((key) => (
            <div key={key} className="flex items-center justify-between gap-3 rounded-md border p-3">
              <Label className="min-w-0 shrink capitalize">{key}</Label>
              <Switch
                className="shrink-0"
                checked={models[key] ?? true}
                onCheckedChange={(checked) => onModelToggle(key, checked)}
              />
            </div>
          ))}
        </div>
        <div className="flex justify-end">
          <Button type="button" className="w-full sm:w-auto" onClick={() => void onSave()} disabled={saving}>
            {saveButtonLabel}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
