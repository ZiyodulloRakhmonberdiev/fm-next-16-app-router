'use client'

import type { AppLocale } from '@/shared/common/lib/locale-api'
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from '@/shared/common/components/ui/card'
import { Label } from '@/shared/common/components/ui/label'
import { Input } from '@/shared/common/components/ui/input'
import { Button } from '@/shared/common/components/ui/button'
import { Save } from 'lucide-react'
import { Switch } from '@/shared/common/components/ui/switch'

type HeadlineSectionProps = {
  locales: AppLocale[]
  localeLabels: Record<AppLocale, string>
  enabled: boolean
  values: Record<AppLocale, string>
  onToggleEnabled: (enabled: boolean) => void
  onChange: (locale: AppLocale, value: string) => void
  onSave: () => void
  saving: boolean
}

export function HeadlineSection({
  locales,
  localeLabels,
  enabled,
  values,
  onToggleEnabled,
  onChange,
  onSave,
  saving,
}: HeadlineSectionProps) {
  return (
    <Card className="py-4 md:py-6 gap-2 md:gap-4">
      <CardHeader className="px-4 md:px-6">
        <CardTitle className="text-base">Sarlavha</CardTitle>
        <CardDescription className="hidden md:block">
          Yoqilsa banner ko'rsatiladi, o'chirilsa client saytda yashiriladi.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4 px-4 md:px-6">
        <div className="flex items-center justify-between rounded-md border p-3">
          <div className="space-y-0.5">
            <Label className="text-sm">Sarlavha holati</Label>
            <p className="text-xs text-muted-foreground">
              {enabled ? 'Yoqilgan' : "O'chirilgan"}
            </p>
          </div>
          <Switch checked={enabled} onCheckedChange={onToggleEnabled} />
        </div>
        {locales.map((locale) => (
          <div key={locale} className="space-y-2">
            <Label>{localeLabels[locale]}</Label>
            <Input
              value={values[locale] ?? ''}
              onChange={(e) => onChange(locale, e.target.value)}
              placeholder={`Headline (${locale})`}
              disabled={!enabled}
            />
          </div>
        ))}
        <div className="flex justify-end pt-2">
          <Button type="button" onClick={onSave} disabled={saving} className="gap-2 w-full sm:w-auto">
            <Save className="size-4" />
            Saqlash
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
