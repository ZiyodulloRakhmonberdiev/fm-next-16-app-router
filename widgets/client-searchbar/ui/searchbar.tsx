"use client"

import {
  Command,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/shared/common/components/ui/command"
import {
  CalculatorIcon,
  CalendarIcon,
  SmileIcon,
} from "lucide-react"
import { useTranslations } from "next-intl"

export function SearchBar({ open, onClose }: { open: boolean, onClose: () => void }) {
  const t = useTranslations("common")
  return (
    <div className="flex flex-col gap-4">
      <CommandDialog open={open} onOpenChange={onClose}>
        <Command>
          <CommandInput placeholder={t("search_placeholder")} />
          <CommandList>
            <CommandEmpty>{t("search_results_empty")}</CommandEmpty>
            <CommandGroup heading={t("results")}>
              <CommandItem>
                <CalendarIcon />
                <span>Calendar</span>
              </CommandItem>
              <CommandItem>
                <SmileIcon />
                <span>Search Emoji</span>
              </CommandItem>
              <CommandItem>
                <CalculatorIcon />
                <span>Calculator</span>
              </CommandItem>
            </CommandGroup>
            <CommandSeparator />
          </CommandList>
        </Command>
      </CommandDialog>
    </div>
  )
}
