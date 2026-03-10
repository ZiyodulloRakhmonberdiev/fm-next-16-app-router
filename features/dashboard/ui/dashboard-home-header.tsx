'use client'

import { ArrowLeft } from 'lucide-react'
import { useRouter } from '@/i18n/navigation'

export function DashboardHomeHeader() {
  const router = useRouter()

  return (
    <div className="flex items-center justify-between gap-3 mb-2">
      <button
        type="button"
        onClick={() => router.back()}
        className="inline-flex items-center gap-2 rounded-md border border-border bg-background px-3 py-1.5 text-xs md:text-sm text-muted-foreground hover:bg-muted transition-colors"
      >
        <ArrowLeft className="size-4" />
        <span>Ortga</span>
      </button>
    </div>
  )
}

