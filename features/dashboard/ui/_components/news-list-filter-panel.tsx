'use client'

import type { ReactNode } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/common/components/ui/card'
import { Button } from '@/shared/common/components/ui/button'
import { Input } from '@/shared/common/components/ui/input'
import { Label } from '@/shared/common/components/ui/label'
import type { NewsStatus } from '@/features/news/model'

type NewsListFilterPanelProps = {
  statusFilter: '' | NewsStatus
  isTopFilter: '' | 'yes' | 'no'
  adFilter: '' | 'yes' | 'no'
  typeFilter: '' | 'video' | 'image' | 'text' | 'audio'
  dateFrom: string
  dateTo: string
  onStatusChange: (value: '' | NewsStatus) => void
  onTopChange: (value: '' | 'yes' | 'no') => void
  onAdChange: (value: '' | 'yes' | 'no') => void
  onTypeChange: (value: '' | 'video' | 'image' | 'text' | 'audio') => void
  onDateFromChange: (value: string) => void
  onDateToChange: (value: string) => void
  onClear: () => void
  renderSelect: (input: { kind: 'status' | 'top' | 'ad' | 'type' }) => ReactNode
}

export function NewsListFilterPanel({
  dateFrom,
  dateTo,
  onDateFromChange,
  onDateToChange,
  onClear,
  renderSelect,
}: NewsListFilterPanelProps) {
  return (
    <Card className="gap-3 py-0 md:gap-6 md:py-6">
      <CardHeader className="hidden px-3 md:block md:px-6">
        <CardTitle className="text-base">Filterlar</CardTitle>
        <CardDescription>Status, Top, reklama, tur va sana bo'yicha filtrlash</CardDescription>
      </CardHeader>
      <CardContent className="px-3 pb-4 pt-2 md:px-6 md:pb-6 md:pt-0">
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-2 md:gap-6 lg:grid-cols-3 xl:grid-cols-7">
          {renderSelect({ kind: 'status' })}
          {renderSelect({ kind: 'top' })}
          {renderSelect({ kind: 'ad' })}
          {renderSelect({ kind: 'type' })}
          <div className="space-y-2">
            <Label htmlFor="date-from" className="text-sm font-medium">Sana (dan)</Label>
            <Input id="date-from" type="date" value={dateFrom} onChange={(e) => onDateFromChange(e.target.value)} className="h-9" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="date-to" className="text-sm font-medium">Sana (gacha)</Label>
            <Input id="date-to" type="date" value={dateTo} onChange={(e) => onDateToChange(e.target.value)} className="h-9" />
          </div>
          <div className="flex flex-col justify-end gap-2">
            <p className="hidden md:block text-xs text-muted-foreground opacity-0 pointer-events-none">.</p>
            <Button variant="outline" size="sm" className="mt-2 md:mt-0" onClick={onClear}>Filterlarni tozalash</Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
