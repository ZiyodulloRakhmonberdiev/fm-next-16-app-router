'use client'

import { Button } from '@/shared/common/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/shared/common/components/ui/dialog'

type DashboardNewsRemoveConfirmDialogProps = {
  open: boolean
  title: string
  description?: string
  disabled?: boolean
  onClose: () => void
  onConfirm: () => void
}

export function DashboardNewsRemoveConfirmDialog({
  open,
  title,
  description,
  disabled,
  onClose,
  onConfirm,
}: DashboardNewsRemoveConfirmDialogProps) {
  return (
    <Dialog open={open} onOpenChange={(next) => !next && onClose()}>
      <DialogContent showCloseButton>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description ?? ''}</DialogDescription>
        </DialogHeader>
        <DialogFooter className="flex gap-2 sm:gap-2">
          <Button type="button" variant="outline" onClick={onClose}>
            Bekor qilish
          </Button>
          <Button type="button" variant="default" disabled={disabled} onClick={onConfirm}>
            Tasdiqlash
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
