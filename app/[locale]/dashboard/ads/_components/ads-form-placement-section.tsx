"use client"

import { Label } from "@/shared/common/components/ui/label"
import { Button } from "@/shared/common/components/ui/button"
import { Checkbox } from "@/shared/common/components/ui/checkbox"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/shared/common/components/ui/popover"
import type { AdFormState, AdPlacement } from "./ads-dashboard-types"
import { AD_PLACEMENTS, AD_TYPES } from "./ads-dashboard-types"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/common/components/ui/select"
import { ChevronDown } from "lucide-react"

type AdsFormPlacementSectionProps = {
  form: AdFormState
  setForm: React.Dispatch<React.SetStateAction<AdFormState>>
}

function hasFullPlacement(placements: AdFormState["placements"]) {
  return (
    placements.includes("header_top_full") ||
    placements.includes("home_bottom_full") ||
    placements.includes("article_bottom_full")
  )
}

function placementSummary(placements: AdPlacement[]): string {
  if (placements.length === 0) return "Placement tanlang"
  const labels = placements
    .map((p) => AD_PLACEMENTS.find((x) => x.value === p)?.label ?? p)
    .filter(Boolean)
  return labels.join(", ")
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
        <Label>Joylashuvlar (placements) *</Label>
        <Popover>
          <PopoverTrigger asChild>
            <Button type="button" variant="outline" className="h-auto min-h-9 w-full justify-between gap-2 py-2">
              <span className="line-clamp-2 text-left text-sm font-normal">
                {placementSummary(form.placements)}
              </span>
              <ChevronDown className="size-4 shrink-0 opacity-60" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-80 max-w-[calc(100vw-2rem)] p-3" align="start">
            <p className="mb-3 text-xs font-medium text-muted-foreground">
              Bir yoki bir nechta joyni belgilang
            </p>
            <ul className="flex flex-col gap-3">
              {AD_PLACEMENTS.map((item) => {
                const value = item.value as AdPlacement
                const checked = form.placements.includes(value)
                const id = `ad-placement-${item.value}`
                return (
                  <li key={item.value} className="flex items-start gap-3">
                    <Checkbox
                      id={id}
                      checked={checked}
                      onCheckedChange={(state) => {
                        const nextOn = state === true
                        setForm((p) => {
                          if (nextOn) {
                            if (p.placements.includes(value)) return p
                            return { ...p, placements: [...p.placements, value] }
                          }
                          return { ...p, placements: p.placements.filter((x) => x !== value) }
                        })
                      }}
                    />
                    <Label htmlFor={id} className="cursor-pointer text-sm font-normal leading-snug">
                      {item.label}
                    </Label>
                  </li>
                )
              })}
            </ul>
          </PopoverContent>
        </Popover>
        <p className="text-xs text-muted-foreground">
          {hasFullPlacement(form.placements)
            ? "Full placement: katta media tavsiya etiladi (16:9)."
            : "Sidebar placement: ixcham media tavsiya etiladi."}
        </p>
      </div>
    </>
  )
}
