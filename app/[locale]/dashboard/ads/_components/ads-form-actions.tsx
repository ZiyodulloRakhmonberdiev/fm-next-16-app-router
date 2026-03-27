"use client"

import { Button } from "@/shared/common/components/ui/button"
import { Label } from "@/shared/common/components/ui/label"
import { Switch } from "@/shared/common/components/ui/switch"
import { Loader2 } from "lucide-react"
import type { AdFormState } from "./ads-dashboard-types"

type AdsFormActionsProps = {
  form: AdFormState
  setForm: React.Dispatch<React.SetStateAction<AdFormState>>
  editId: string | null
  loading: boolean
  onSave: () => void | Promise<void>
  onCancelEdit: () => void
}

export function AdsFormActions({ form, setForm, editId, loading, onSave, onCancelEdit }: AdsFormActionsProps) {
  return (
    <>
      <div className="flex min-h-11 items-center justify-between gap-3 rounded-md border px-3 py-2.5 sm:py-2 md:col-span-2">
        <Label htmlFor="ad-active-switch" className="cursor-pointer">
          Faol
        </Label>
        <Switch
          id="ad-active-switch"
          checked={form.active}
          onCheckedChange={(v) => setForm((p) => ({ ...p, active: v }))}
        />
      </div>
      <div className="flex flex-col-reverse gap-2 sm:flex-row sm:flex-wrap md:col-span-2">
        <Button onClick={() => void onSave()} disabled={loading} className="w-full gap-2 sm:w-auto">
          {loading ? <Loader2 className="size-4 animate-spin" /> : null}
          {editId ? "Tahrirlash" : "Qo'shish"}
        </Button>
        {editId ? (
          <Button variant="outline" className="w-full sm:w-auto" onClick={onCancelEdit}>
            Bekor qilish
          </Button>
        ) : null}
      </div>
    </>
  )
}
