"use client"

import { Button } from "@/shared/common/components/ui/button"
import { Input } from "@/shared/common/components/ui/input"
import { Label } from "@/shared/common/components/ui/label"
import { Plus, Trash2 } from "lucide-react"
import type { AdFormState } from "./ads-dashboard-types"

type AdsFormLinksSectionProps = {
  form: AdFormState
  setForm: React.Dispatch<React.SetStateAction<AdFormState>>
}

export function AdsFormLinksSection({ form, setForm }: AdsFormLinksSectionProps) {
  return (
    <div className="space-y-2 md:col-span-2">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <Label className="text-base sm:text-sm">Reklama havolalar (Ixtiyoriy)</Label>
        <Button
          type="button"
          size="sm"
          variant="outline"
          className="w-full shrink-0 sm:w-auto"
          onClick={() => setForm((p) => ({ ...p, links: [...p.links, { label: "", href: "" }] }))}
        >
          <Plus className="mr-2 size-4 shrink-0" />
          Havola qo&apos;shish
        </Button>
      </div>
      <div className="space-y-3">
        {form.links.map((link, index) => (
          <div
            key={index}
            className="grid grid-cols-1 gap-2 rounded-md border p-3 sm:grid-cols-[1fr_1fr_auto] sm:items-end"
          >
            <Input
              value={link.label}
              placeholder="Link nomi"
              className="min-w-0"
              onChange={(e) =>
                setForm((p) => ({
                  ...p,
                  links: p.links.map((item, i) => (i === index ? { ...item, label: e.target.value } : item)),
                }))
              }
            />
            <Input
              value={link.href}
              placeholder="Href"
              className="min-w-0"
              onChange={(e) =>
                setForm((p) => ({
                  ...p,
                  links: p.links.map((item, i) => (i === index ? { ...item, href: e.target.value } : item)),
                }))
              }
            />
            <Button
              type="button"
              size="icon"
              variant="outline"
              className="size-10 justify-self-start sm:justify-self-auto"
              onClick={() =>
                setForm((p) => ({
                  ...p,
                  links: p.links.length === 1 ? [{ label: "", href: "" }] : p.links.filter((_, i) => i !== index),
                }))
              }
            >
              <Trash2 className="size-4" />
            </Button>
          </div>
        ))}
      </div>
    </div>
  )
}
