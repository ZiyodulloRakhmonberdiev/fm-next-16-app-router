"use client";
import { useEffect, useState } from "react";
import { Button } from "@/shared/common/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem } from "@/shared/common/components/ui/dropdown-menu";
import { DropdownMenuTrigger } from "@/shared/common/components/ui/dropdown-menu";
import { ChevronDownIcon, LanguagesIcon } from "lucide-react";
import { useLocale } from "next-intl";
import { usePathname, useRouter } from "@/i18n/navigation";

const LOCALE_STORAGE_KEY = "preferred-locale";

const localeMeta: Record<
  string,
  { short: string; label: string; flag: string }
> = {
  uz: { short: "Uz", label: "O'zbekcha", flag: "🇺🇿" },
  uzb: { short: "Уз", label: "Узбекча", flag: "🇺🇿" },
  ru: { short: "Ru", label: "Русский", flag: "🇷🇺" },
  en: { short: "En", label: "English", flag: "🇺🇸" },
};

export default function LanguageSwitcher() {
  const router = useRouter();
  const pathname = usePathname();
  const currentLocale = useLocale();
  const [selectedLocale, setSelectedLocale] = useState(currentLocale);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const stored = window.localStorage.getItem(LOCALE_STORAGE_KEY);
    if (stored && stored !== currentLocale) {
      setSelectedLocale(stored);
      router.replace(pathname, { locale: stored as any });
    } else {
      setSelectedLocale(currentLocale);
    }
  }, [currentLocale, pathname, router]);

  const handleSetLocale = (locale: string) => {
    setSelectedLocale(locale);

    if (typeof window !== "undefined") {
      window.localStorage.setItem(LOCALE_STORAGE_KEY, locale);
    }

    router.replace(pathname, { locale: locale as any });
  };

  const meta = localeMeta[selectedLocale] ?? localeMeta[currentLocale];

  return (
    <div>
      <DropdownMenu>
        <DropdownMenuTrigger className="flex items-center gap-2 bg-background px-2 py-0.5 outline-0 rounded-sm">
          <span className="text-base leading-none">{meta?.flag}</span>
          <span>{meta?.label}</span>
          <ChevronDownIcon className="w-4 h-4" />
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem className="flex items-center gap-2" onClick={() => handleSetLocale('uz')}>
            <span>{localeMeta.uz.flag}</span>
            <span>{localeMeta.uz.label}</span>
          </DropdownMenuItem>
          <DropdownMenuItem className="flex items-center gap-2" onClick={() => handleSetLocale('uzb')}>
            <span>{localeMeta.uzb.flag}</span>
            <span>{localeMeta.uzb.label}</span>
          </DropdownMenuItem>
          <DropdownMenuItem className="flex items-center gap-2" onClick={() => handleSetLocale('ru')}>
            <span>{localeMeta.ru.flag}</span>
            <span>{localeMeta.ru.label}</span>
          </DropdownMenuItem>
          <DropdownMenuItem className="flex items-center gap-2" onClick={() => handleSetLocale('en')}>
            <span>{localeMeta.en.flag}</span>
            <span>{localeMeta.en.label}</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}