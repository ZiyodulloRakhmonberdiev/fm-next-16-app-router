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

type HeadlineSectionProps = {
  locales: AppLocale[]
  localeLabels: Record<AppLocale, string>
  values: Record<AppLocale, string>
  onChange: (locale: AppLocale, value: string) => void
  onSave: () => void
  saving: boolean
}

export function HeadlineSection({
  locales,
  localeLabels,
  values,
  onChange,
  onSave,
  saving,
}: HeadlineSectionProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Sarlavha</CardTitle>
        <CardDescription className="hidden md:block">
          Barcha tillarda banner sarlavha
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {locales.map((locale) => (
          <div key={locale} className="space-y-2">
            <Label>{localeLabels[locale]}</Label>
            <Input
              value={values[locale] ?? ''}
              onChange={(e) => onChange(locale, e.target.value)}
              placeholder={`Headline (${locale})`}
            />
          </div>
        ))}
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

