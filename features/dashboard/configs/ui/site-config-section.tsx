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
import type { SiteConfigSettings } from '@/shared/common/lib/site-settings-types'

type SiteConfigSectionProps = {
  locales: AppLocale[]
  localeLabels: Record<AppLocale, string>
  value: SiteConfigSettings
  onChangeField: <K extends keyof SiteConfigSettings>(key: K, value: SiteConfigSettings[K]) => void
  onChangeAddress: (locale: AppLocale, value: string) => void
  onSave: () => void
  saving: boolean
}

export function SiteConfigSection({
  locales,
  localeLabels,
  value,
  onChangeField,
  onChangeAddress,
  onSave,
  saving,
}: SiteConfigSectionProps) {
  return (
    <Card className="py-4 md:py-6 gap-2 md:gap-4">
      <CardHeader className="px-4 md:px-6">
        <CardTitle className="text-base">Sayt ma'lumotlari</CardTitle>
        <CardDescription>Email, telefon va manzil.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4 px-4 md:px-6">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label>Email</Label>
            <Input
              type="email"
              value={value.email}
              onChange={(e) => onChangeField('email', e.target.value)}
              placeholder="info@example.uz"
            />
          </div>
          <div className="space-y-2">
            <Label>Telefon</Label>
            <Input
              value={value.phone}
              onChange={(e) => onChangeField('phone', e.target.value)}
              placeholder="+998 90 123 45 67"
            />
          </div>
        </div>
        <div className="space-y-2">
          <Label>Manzil (har bir til)</Label>
          {locales.map((locale) => (
            <div key={locale} className="space-y-1">
              <Label className="text-muted-foreground text-xs">
                {localeLabels[locale]}
              </Label>
              <Input
                value={value.address[locale] ?? ''}
                onChange={(e) => onChangeAddress(locale, e.target.value)}
                placeholder={`Manzil (${locale})`}
              />
            </div>
          ))}
        </div>
        <div className="flex justify-end pt-2">
          <Button type="button" onClick={onSave} disabled={saving} className="gap-2">
            <Save className="size-4" />
            Saqlash
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

