'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/common/components/ui/card'
import { CreateNewsForm, type CreateNewsFormProps } from '@/features/news/ui/forms/create-news-form'
import { cn } from '@/shared/common/lib/utils'

const stepTitles: Record<1 | 2 | 3, string> = {
  1: "Ma'lumotlar — sarlavha, kategoriya, media",
  2: 'Kontent — matn va bloklar',
  3: 'Sozlamalar — status, Telegram, chop etish',
}

export function CreateNewsPageClient(props: CreateNewsFormProps) {
  const [step, setStep] = useState<1 | 2 | 3>(1)

  return (
    <div className="flex flex-col gap-4">
      <div
        className={cn(
          'sticky top-14 z-30 -mx-3 border-b border-border bg-background/95 px-3 py-3 shadow-sm backdrop-blur-md supports-backdrop-filter:bg-background/90',
          'md:-mx-6 md:px-6'
        )}
      >
        <div className="flex items-center justify-center gap-3 sm:gap-4">
          {([1, 2, 3] as const).map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => setStep(s)}
              title={stepTitles[s]}
              aria-label={`${s}-bosqich: ${stepTitles[s]}`}
              aria-current={step === s ? 'step' : undefined}
              className={cn(
                'flex size-11 shrink-0 items-center justify-center rounded-full text-sm font-semibold shadow-sm ring-offset-background transition-all sm:size-12 sm:text-base',
                step === s
                  ? 'bg-primary text-primary-foreground ring-2 ring-primary ring-offset-2'
                  : 'bg-muted text-muted-foreground hover:bg-muted/80 hover:text-foreground'
              )}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      <Card className="pt-4">
        <CardContent>
          <CreateNewsForm
            {...props}
            controlledStep={step}
            onControlledStepChange={setStep}
            hideStepTabs
          />
        </CardContent>
      </Card>
    </div>
  )
}
