'use client'

import { Card, CardContent } from '@/shared/common/components/ui/card'
import { Label } from '@/shared/common/components/ui/label'
import { Input } from '@/shared/common/components/ui/input'
import { Button } from '@/shared/common/components/ui/button'
import { Database } from 'lucide-react'

export type ConfigsDeliveryDatabaseRestoreSectionProps = {
  restoreFile: File | null
  onRestoreFileChange: (file: File | null) => void
  onRestore: () => void | Promise<void>
  restoring: boolean
}

export function ConfigsDeliveryDatabaseRestoreSection({
  restoreFile,
  onRestoreFileChange,
  onRestore,
  restoring,
}: ConfigsDeliveryDatabaseRestoreSectionProps) {
  return (
    <Card className="bg-background/40">
      <CardContent>
        <div className="space-y-4">
          <div className="flex items-start gap-2">
            <Database className="mt-0.5 size-5 shrink-0 text-muted-foreground" aria-hidden />
            <div className="min-w-0 space-y-1">
              <p className="text-sm font-medium leading-none">MongoDB restore</p>
              <p className="text-xs text-muted-foreground">
                Backup arxivini yuklab, DB ni to&apos;liq almashtiradi.
              </p>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Backup fayl (.json / .json.gz / .gz)</Label>
            <Input
              type="file"
              accept=".json,.gz,.json.gz,application/gzip,application/json"
              onChange={(e) => {
                onRestoreFileChange(e.target.files?.[0] ?? null)
              }}
              autoComplete="off"
              disabled={restoring}
            />
          </div>

          <div className="flex justify-end">
            <Button type="button" onClick={() => void onRestore()} disabled={!restoreFile || restoring}>
              {restoring ? 'Tiklanmoqda…' : 'Backupdan tiklash'}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
