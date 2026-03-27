'use client'

import { Card, CardDescription, CardHeader, CardTitle } from '@/shared/common/components/ui/card'

export type ConfigsDeliveryRestrictedCardProps = {
  title?: string
  description?: string
}

export function ConfigsDeliveryRestrictedCard({
  title = 'Kirish cheklangan',
  description = "Ma'lumot uzatish va Telegram sozlamalarini faqat CEO o'zgartira oladi.",
}: ConfigsDeliveryRestrictedCardProps) {
  return (
    <Card className="border-muted py-4 md:py-6">
      <CardHeader className="px-4 md:px-6">
        <CardTitle className="text-base">{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
    </Card>
  )
}
