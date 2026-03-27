"use client"

import { Label } from "@/shared/common/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/common/components/ui/select"
import type { AdFormState } from "./ads-dashboard-types"
import { AD_PLACEMENTS, AD_TYPES } from "./ads-dashboard-types"

type AdsFormPlacementSectionProps = {
  form: AdFormState
  setForm: React.Dispatch<React.SetStateAction<AdFormState>>
}

function isFullPlacement(placement: AdFormState["placement"]) {
  return (
    placement === "header_top_full" ||
    placement === "home_bottom_full" ||
    placement === "article_bottom_full"
  )
}

export function AdsFormPlacementSection({ form, setForm }: AdsFormPlacementSectionProps) {
  return (
    <>
      <div className="space-y-2">
        <Label>Reklama turi *</Label>
        <Select
          value={form.type}
          onValueChange={(v) =>
            setForm((p) => ({
              ...p,
              type: v as AdFormState["type"],
            }))
          }
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {AD_TYPES.map((item) => (
              <SelectItem key={item.value} value={item.value}>
                {item.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label>Joylashuv (placement) *</Label>
        <Select
          value={form.placement}
          onValueChange={(v) =>
            setForm((p) => ({
              ...p,
              placement: v as AdFormState["placement"],
            }))
          }
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {AD_PLACEMENTS.map((item) => (
              <SelectItem key={item.value} value={item.value}>
                {item.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <p className="text-xs text-muted-foreground">
          {isFullPlacement(form.placement)
            ? "Full placement: katta media tavsiya etiladi (16:9)."
            : "Sidebar placement: ixcham media tavsiya etiladi."}
        </p>
      </div>
    </>
  )
}
