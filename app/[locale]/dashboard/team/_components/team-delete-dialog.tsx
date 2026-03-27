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

type TeamDeleteDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  onConfirm: () => void
}

export function TeamDeleteDialog({ open, onOpenChange, onConfirm }: TeamDeleteDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent showCloseButton>
        <DialogHeader>
          <DialogTitle>O&apos;chirishni tasdiqlaysizmi?</DialogTitle>
          <DialogDescription>
            Bu team a&apos;zosini ro&apos;yxatdan o&apos;chiradi. Amalni qaytarib bo&apos;lmaydi.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter showCloseButton={false}>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Bekor qilish
          </Button>
          <Button variant="destructive" onClick={onConfirm}>
            O&apos;chirish
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
