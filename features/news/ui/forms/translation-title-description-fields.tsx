'use client'

import type { AppLocale } from '@/shared/common/lib/locale-api'
import { Label } from '@/shared/common/components/ui/label'
import { UzUzbTranslateControls, type TranslationsState } from '@/features/news/lib/latin-cyrill-translator'
import { applyEmptyLocaleUpdates, TRANSLATION_LOCALES } from '@/features/news/lib/gemini-translate-api'
import { GeminiTranslateButton } from '@/features/news/ui/forms/gemini-translate-button'

type TranslationTitleDescriptionFieldsProps = {
  activeTab: AppLocale
  translations: TranslationsState
  onChangeTranslation: (loc: AppLocale, field: 'title' | 'description', value: string) => void
  idPrefix?: string
}

function titleValues(translations: TranslationsState): Partial<Record<AppLocale, string>> {
  return Object.fromEntries(TRANSLATION_LOCALES.map((l) => [l, translations[l]?.title ?? '']))
}

function descriptionValues(translations: TranslationsState): Partial<Record<AppLocale, string>> {
  return Object.fromEntries(TRANSLATION_LOCALES.map((l) => [l, translations[l]?.description ?? '']))
}

export function TranslationTitleDescriptionFields({
  activeTab,
  translations,
  onChangeTranslation,
  idPrefix = '',
}: TranslationTitleDescriptionFieldsProps) {
  const prefix = idPrefix ? `${idPrefix}-` : ''

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor={`${prefix}title-${activeTab}`}>
          Nom
          {activeTab === 'uz' && <span className="text-destructive">*</span>}
          {activeTab === 'uzb' && <span className="text-destructive">*</span>}
        </Label>
        <textarea
          id={`${prefix}title-${activeTab}`}
          value={translations[activeTab]?.title ?? ''}
          onChange={(e) => onChangeTranslation(activeTab, 'title', e.target.value)}
          placeholder={activeTab === 'uz' ? 'Sarlavha (majburiy)' : 'Sarlavha'}
          className="flex min-h-[80px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          rows={6}
        />
        <div className="flex justify-start gap-2">
          <UzUzbTranslateControls
            activeTab={activeTab}
            translations={translations}
            field="title"
            onChangeTranslation={onChangeTranslation}
          />

          <GeminiTranslateButton
            fieldType="title"
            localeValues={titleValues(translations)}
            preferredLocale={activeTab}
            onTranslated={(updates) => {
              const merged = applyEmptyLocaleUpdates(
                Object.fromEntries(
                  TRANSLATION_LOCALES.map((l) => [l, translations[l]?.title ?? ''])
                ) as Record<AppLocale, string>,
                updates
              )
              for (const loc of TRANSLATION_LOCALES) {
                if (merged[loc] !== (translations[loc]?.title ?? '')) {
                  onChangeTranslation(loc, 'title', merged[loc])
                }
              }
            }}
            className="flex justify-start"
          />
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor={`${prefix}desc-${activeTab}`}>
          Izoh
          {activeTab === 'uz' && <span className="text-destructive">*</span>}
          {activeTab === 'uzb' && <span className="text-destructive">*</span>}
        </Label>
        <textarea
          id={`${prefix}desc-${activeTab}`}
          value={translations[activeTab]?.description ?? ''}
          onChange={(e) => onChangeTranslation(activeTab, 'description', e.target.value)}
          placeholder="Qisqa izoh"
          className="flex min-h-[80px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          rows={8}
        />
        <div className="flex justify-start gap-2">

          <UzUzbTranslateControls
            activeTab={activeTab}
            translations={translations}
            field="description"
            onChangeTranslation={onChangeTranslation}
          />

          <GeminiTranslateButton
            fieldType="description"
            localeValues={descriptionValues(translations)}
            preferredLocale={activeTab}
            onTranslated={(updates) => {
              const merged = applyEmptyLocaleUpdates(
                Object.fromEntries(
                  TRANSLATION_LOCALES.map((l) => [l, translations[l]?.description ?? ''])
                ) as Record<AppLocale, string>,
                updates
              )
              for (const loc of TRANSLATION_LOCALES) {
                if (merged[loc] !== (translations[loc]?.description ?? '')) {
                  onChangeTranslation(loc, 'description', merged[loc])
                }
              }
            }}
            className="flex justify-start"
          />
        </div>
      </div>
    </div>
  )
}
