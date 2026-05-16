'use client'

import { useState } from 'react'
import { Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import type { AppLocale } from '@/shared/common/lib/locale-api'
import { Button } from '@/shared/common/components/ui/button'
import {
  applyEmptyLocaleUpdates,
  getEmptyTargetLocales,
  pickTranslationSource,
  requestGeminiTranslation,
  type GeminiTranslateField,
} from '@/features/news/lib/gemini-translate-api'

type GeminiTranslateButtonProps = {
  fieldType: GeminiTranslateField
  localeValues: Partial<Record<AppLocale, string>>
  preferredLocale?: AppLocale
  onTranslated: (updates: Partial<Record<AppLocale, string>>) => void
  className?: string
}

export function GeminiTranslateButton({
  fieldType,
  localeValues,
  preferredLocale,
  onTranslated,
  className,
}: GeminiTranslateButtonProps) {
  const [loading, setLoading] = useState(false)
  const source = pickTranslationSource(localeValues, preferredLocale)
  const targetLocales = source ? getEmptyTargetLocales(localeValues, source.locale) : []
  const disabled = !source || targetLocales.length === 0 || loading

  const handleClick = async () => {
    if (!source) {
      toast.error('Avval kamida bitta tilda matn kiriting')
      return
    }
    if (targetLocales.length === 0) {
      toast.info('Barcha tillar allaqachon to‘ldirilgan')
      return
    }

    setLoading(true)
    try {
      const result = await requestGeminiTranslation({
        sourceLocale: source.locale,
        sourceText: source.text,
        fieldType,
        targetLocales,
      })
      onTranslated(result)
      const filled = targetLocales.filter((l) => result[l]?.trim())
      if (filled.length === 0) {
        toast.error('Tarjima qaytarilmadi')
        return
      }
      toast.success(`${filled.length} ta tilga tarjima qo‘shildi`)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Tarjima amalga oshmadi')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className={className}>
      <Button
        type="button"
        variant="default"
        onClick={() => void handleClick()}
        disabled={disabled}
        className="gap-2"
      >
        {loading ? <Loader2 className="size-4 animate-spin" /> : null}
        AI tarjima
      </Button>
    </div>
  )
}

export function GeminiTranslateContentButton({
  contents,
  preferredLocale,
  onContentsChange,
  className,
}: {
  contents: Record<AppLocale, string>
  preferredLocale?: AppLocale
  onContentsChange: (next: Record<AppLocale, string>) => void
  className?: string
}) {
  return (
    <GeminiTranslateButton
      fieldType="content"
      localeValues={contents}
      preferredLocale={preferredLocale}
      className={className}
      onTranslated={(updates) => {
        onContentsChange(applyEmptyLocaleUpdates(contents, updates))
      }}
    />
  )
}
