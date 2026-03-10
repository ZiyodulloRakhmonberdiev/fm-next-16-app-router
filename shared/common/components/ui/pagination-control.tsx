'use client'

import { Button } from './button'
import { ChevronLeft, ChevronRight } from 'lucide-react'

type PaginationControlProps = {
  page: number
  totalPages: number
  onPrev: () => void
  onNext: () => void
}

export function PaginationControl({ page, totalPages, onPrev, onNext }: PaginationControlProps) {
  if (totalPages <= 1) return null
  return (
    <div className="flex items-center justify-between gap-2 pt-4 border-t border-border mt-4">
      <Button
        variant="outline"
        size="sm"
        onClick={onPrev}
        disabled={page <= 1}
        className="gap-1"
      >
        <ChevronLeft className="size-4" />
        Oldingi
      </Button>
      <span className="text-sm text-muted-foreground">
        Sahifa {page} / {totalPages}
      </span>
      <Button
        variant="outline"
        size="sm"
        onClick={onNext}
        disabled={page >= totalPages}
        className="gap-1"
      >
        Keyingi
        <ChevronRight className="size-4" />
      </Button>
    </div>
  )
}
