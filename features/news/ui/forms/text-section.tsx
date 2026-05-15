'use client'

import type { AppLocale } from '@/shared/common/lib/locale-api'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/shared/common/components/ui/card'
import { Label } from '@/shared/common/components/ui/label'
import { Input } from '@/shared/common/components/ui/input'
import { cn } from '@/shared/common/lib/utils'
import type { TranslationsState } from '@/features/news/lib/latin-cyrill-translator'
import { TranslationTitleDescriptionFields } from '@/features/news/ui/forms/translation-title-description-fields'

type TextFormProps = {
  locales: AppLocale[]
  localeLabels: Record<AppLocale, string>
  activeTab: AppLocale
  translations: TranslationsState
  slugs: Record<AppLocale, string>
  tabHasData: (loc: AppLocale) => boolean
  onActiveTabChange: (loc: AppLocale) => void
  onChangeTranslation: (loc: AppLocale, field: 'title' | 'description', value: string) => void
  onChangeSlug: (loc: AppLocale, value: string) => void
}

export function TextForm({
  locales,
  localeLabels,
  activeTab,
  translations,
  slugs,
  tabHasData,
  onActiveTabChange,
  onChangeTranslation,
  onChangeSlug,
}: TextFormProps) {
  return (
    <Card className='pt-0 md:pt-4 border-none md:border-border bg-transparent shadow-none'>
      <CardHeader className='px-0'>
        <CardTitle>Tarjimali maydonlar</CardTitle>
        <CardDescription>
          Har bir til uchun nom va sarlavha kiriting. Lotin va Krill tillarida nom va sarlavha majburiy.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4 px-0">
        <div className="flex flex-wrap gap-2 rounded-lg border border-border/70 bg-muted/30 p-2">
          {locales.map((loc) => (
            <button
              key={loc}
              type="button"
              onClick={() => onActiveTabChange(loc)}
              className={cn(
                'flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-medium transition-colors',
                activeTab === loc
                  ? 'border-primary/30 bg-primary/10 text-primary'
                  : 'border-transparent bg-background/80 text-muted-foreground hover:bg-background'
              )}
            >
              <span
                className={cn(
                  'size-2 rounded-full',
                  tabHasData(loc) ? 'bg-emerald-500' : 'bg-muted-foreground/40'
                )}
                title={tabHasData(loc) ? "To'ldirilgan" : "Bo'sh"}
              />
              {localeLabels[loc]}
            </button>
          ))}
        </div>
        <div className="space-y-4 pt-2">
          <TranslationTitleDescriptionFields
            activeTab={activeTab}
            translations={translations}
            onChangeTranslation={onChangeTranslation}
          />
          <div className="space-y-2">
            <Label htmlFor={`slug-${activeTab}`}>Slug (Avtomatik yaratiladi) </Label>
            <Input
              id={`slug-${activeTab}`}
              value={slugs[activeTab] ?? ''}
              onChange={(e) => onChangeSlug(activeTab, e.target.value)}
              placeholder="Sarlavhadan avtomatik yoki o'zingiz kiriting"
            />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
