"use client"

import { Input } from "@/shared/common/components/ui/input"
import { Label } from "@/shared/common/components/ui/label"
import { Textarea } from "@/shared/common/components/ui/textarea"
import type { AdFormState } from "./ads-dashboard-types"

type AdsFormMetaFieldsProps = {
  form: AdFormState
  setForm: React.Dispatch<React.SetStateAction<AdFormState>>
}

export function AdsFormMetaFields({ form, setForm }: AdsFormMetaFieldsProps) {
  return (
    <>
      <div className="space-y-2">
        <Label>Reklama nomi *</Label>
        <Input
          value={form.title}
          onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))}
          className="min-w-0"
        />
      </div>
      <div className="space-y-2">
        <Label>Reklama sayt nomi *</Label>
        <Input
          value={form.siteName}
          onChange={(e) => setForm((p) => ({ ...p, siteName: e.target.value }))}
          className="min-w-0"
        />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:col-span-2">
        <div className="space-y-2">
          <Label>Ustuvorlik *</Label>
          <Input
            type="number"
            inputMode="numeric"
            className="min-w-0"
            value={form.priority}
            onChange={(e) => setForm((p) => ({ ...p, priority: Number(e.target.value) }))}
          />
        </div>
        <div className="space-y-2">
          <Label>Davomiylik *</Label>
          <Input
            type="number"
            inputMode="numeric"
            className="min-w-0"
            value={form.displaySeconds}
            onChange={(e) => setForm((p) => ({ ...p, displaySeconds: Number(e.target.value) }))}
            min={3}
            max={120}
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label>Reklama tavsifi *</Label>
        <Textarea
          value={form.description}
          onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
          className="min-h-[100px] min-w-0 resize-y"
        />
      </div>
    </>
  )
}
