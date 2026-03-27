"use client"

import { Input } from "@/shared/common/components/ui/input"
import { Label } from "@/shared/common/components/ui/label"
import type { AdFormState } from "./ads-dashboard-types"

type AdsFormOptionalUrlsProps = {
  form: AdFormState
  setForm: React.Dispatch<React.SetStateAction<AdFormState>>
}

export function AdsFormOptionalUrls({ form, setForm }: AdsFormOptionalUrlsProps) {
  if (form.placement === "sidebar_widget") {
    return (
      <div className="rounded-md border border-dashed p-3 text-xs text-muted-foreground md:col-span-2">
        Sidebar placement tanlanganda qo&apos;shimcha URL maydonlari ko&apos;rsatilmaydi.
      </div>
    )
  }

  return (
    <>
      <div className="space-y-2">
        <Label>Reklama beruvchi haqida (Ixtiyoriy)</Label>
        <Input
          value={form.advertiserUrl}
          onChange={(e) => setForm((p) => ({ ...p, advertiserUrl: e.target.value }))}
          className="min-w-0"
        />
      </div>
      <div className="space-y-2">
        <Label>Reklama haqida (Ixtiyoriy)</Label>
        <Input
          value={form.adInfoUrl}
          onChange={(e) => setForm((p) => ({ ...p, adInfoUrl: e.target.value }))}
          className="min-w-0"
        />
      </div>
      <div className="space-y-2">
        <Label>Bizga reklam berish (Ixtiyoriy)</Label>
        <Input
          value={form.advertiseWithUsUrl}
          onChange={(e) => setForm((p) => ({ ...p, advertiseWithUsUrl: e.target.value }))}
          className="min-w-0"
        />
      </div>
    </>
  )
}
