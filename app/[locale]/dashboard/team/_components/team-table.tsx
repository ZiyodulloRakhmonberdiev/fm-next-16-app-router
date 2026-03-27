'use client'

import { Button } from '@/shared/common/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/shared/common/components/ui/table'
import type { TeamForm, TeamRow } from './team-types'
import { Pencil, Trash2 } from 'lucide-react'

type TeamTableProps = {
  items: TeamRow[]
  onEdit: (id: string, nextForm: TeamForm) => void
  onDelete: (id: string) => void
}

export function TeamTable({ items, onEdit, onDelete }: TeamTableProps) {
  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Guvohnoma</TableHead>
            <TableHead>Rasm</TableHead>
            <TableHead>Ism</TableHead>
            <TableHead>Lavozim</TableHead>
            <TableHead>QR</TableHead>
            <TableHead>Badge</TableHead>
            <TableHead>Amallar</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {items.map((m) => (
            <TableRow key={m._id}>
              <TableCell>{m.order}</TableCell>
              <TableCell>{m.image ? <span className="text-xs text-muted-foreground">Rasm bor</span> : '-'}</TableCell>
              <TableCell>{m.fullName}</TableCell>
              <TableCell>{m.position}</TableCell>
              <TableCell>{m.qrCode ? 'Bor' : '-'}</TableCell>
              <TableCell>{m.badgeImage ? 'Bor' : '-'}</TableCell>
              <TableCell className="space-x-2">
                <Button
                  size="sm"
                  variant="default"
                  title="Tahrirlash"
                  onClick={() =>
                    onEdit(m._id, {
                      certificateNumber: m.order,
                      image: m.image ?? '',
                      fullName: m.fullName,
                      position: m.position,
                      qrCode: m.qrCode ?? '',
                      badgeImage: m.badgeImage ?? '',
                    })
                  }
                >
                  <Pencil className="size-4" />
                </Button>
                <Button size="sm" variant="default" title="O'chirish" onClick={() => onDelete(m._id)}>
                  <Trash2 className="size-4" />
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
