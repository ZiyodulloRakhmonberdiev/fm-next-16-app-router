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
import { UzUzbTranslateControls, type TranslationsState } from '../lib/latin-cyrill-translator'

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
    <Card className='pt-0 md:pt-4 border-none md:border-border'>
      <CardHeader className='px-0 md:px-4'>
        <CardTitle>Tarjimali maydonlar</CardTitle>
        <CardDescription>
          Har bir til uchun sarlavha, tavsif va slug kiriting. uz sarlavha majburiy.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4 px-0 md:px-4">
        <div className="flex flex-wrap gap-1 border-b border-border pb-2">
          {locales.map((loc) => (
            <button
              key={loc}
              type="button"
              onClick={() => onActiveTabChange(loc)}
              className={cn(
                'flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors',
                activeTab === loc ? 'bg-primary text-primary-foreground' : 'hover:bg-muted'
              )}
            >
              <span
                className={cn(
                  'size-2 rounded-full',
                  tabHasData(loc) ? 'bg-green-500' : 'bg-muted-foreground/50'
                )}
                title={tabHasData(loc) ? "To'ldirilgan" : "Bo'sh"}
              />
              {localeLabels[loc]}
            </button>
          ))}
        </div>
        <div className="space-y-4 pt-2">
          <div className="space-y-2">
            <Label htmlFor={`title-${activeTab}`}>
              Sarlavha ({activeTab}) {activeTab === 'uz' && <span className="text-destructive">*</span>}
            </Label>
            <textarea
              id={`title-${activeTab}`}
              value={translations[activeTab]?.title ?? ''}
              onChange={(e) => onChangeTranslation(activeTab, 'title', e.target.value)}
              placeholder={activeTab === 'uz' ? 'Sarlavha (majburiy)' : 'Sarlavha'}
              className="flex min-h-[80px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              rows={2}
            />
            <UzUzbTranslateControls
              activeTab={activeTab}
              translations={translations}
              field="title"
              onChangeTranslation={onChangeTranslation}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor={`desc-${activeTab}`}>Tavsif ({activeTab})</Label>
            <textarea
              id={`desc-${activeTab}`}
              value={translations[activeTab]?.description ?? ''}
              onChange={(e) => onChangeTranslation(activeTab, 'description', e.target.value)}
              placeholder="Qisqa tavsif"
              className="flex min-h-[80px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              rows={3}
            />
            <UzUzbTranslateControls
              activeTab={activeTab}
              translations={translations}
              field="description"
              onChangeTranslation={onChangeTranslation}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor={`slug-${activeTab}`}>Slug ({activeTab})</Label>
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