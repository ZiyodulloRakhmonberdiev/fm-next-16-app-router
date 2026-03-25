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
import { Button } from '@/shared/common/components/ui/button'
import { Save } from 'lucide-react'

type DescriptionSectionProps = {
  locales: AppLocale[]
  localeLabels: Record<AppLocale, string>
  values: Record<AppLocale, string>
  onChange: (locale: AppLocale, value: string) => void
  onSave: () => void
  saving: boolean
}

export function DescriptionSection({
  locales,
  localeLabels,
  values,
  onChange,
  onSave,
  saving,
}: DescriptionSectionProps) {
  return (
    <Card className="py-4 md:py-6 gap-2 md:gap-4">
      <CardHeader className="px-4 md:px-6">
        <CardTitle className="text-base">Tavsif</CardTitle>
        <CardDescription className="hidden md:block">
          Sayt haqida qisqacha.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4 px-4 md:px-6">
        {locales.map((locale) => (
          <div key={locale} className="space-y-2">
            <Label>{localeLabels[locale]}</Label>
            <textarea
              className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              value={values[locale] ?? ''}
              onChange={(e) => onChange(locale, e.target.value)}
              placeholder={`Description (${locale})`}
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

