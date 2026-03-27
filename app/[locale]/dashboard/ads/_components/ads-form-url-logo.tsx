"use client"

import type { RefObject } from "react"
import { Button } from "@/shared/common/components/ui/button"
import { Input } from "@/shared/common/components/ui/input"
import { Label } from "@/shared/common/components/ui/label"
import { Upload } from "lucide-react"
import type { AdFormState } from "./ads-dashboard-types"

type AdsFormUrlLogoProps = {
  form: AdFormState
  setForm: React.Dispatch<React.SetStateAction<AdFormState>>
  logoFileRef: RefObject<HTMLInputElement | null>
  handleLogoFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void
}

export function AdsFormUrlLogo({ form, setForm, logoFileRef, handleLogoFileChange }: AdsFormUrlLogoProps) {
  return (
    <>
      <div className="space-y-2">
        <Label>Reklama URL *</Label>
        <Input
          value={form.adUrl}
          onChange={(e) => setForm((p) => ({ ...p, adUrl: e.target.value }))}
          placeholder="https://..."
          className="min-w-0"
        />
      </div>
      <div className="space-y-2">
        <Label>Reklama logo *</Label>
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <Input
            value={form.logo}
            onChange={(e) => setForm((p) => ({ ...p, logo: e.target.value }))}
            placeholder="URL yoki lokaldan"
            className="min-w-0 flex-1"
          />
          <input ref={logoFileRef} type="file" accept="image/*" className="hidden" onChange={handleLogoFileChange} />
          <Button
            type="button"
            variant="outline"
            className="w-full shrink-0 justify-center gap-2 sm:w-auto sm:justify-center"
            title="Logo yuklash"
            onClick={() => logoFileRef.current?.click()}
          >
            <Upload className="size-4 shrink-0" />
            <span className="sm:hidden">Yuklash</span>
          </Button>
        </div>
      </div>
    </>
  )
}
