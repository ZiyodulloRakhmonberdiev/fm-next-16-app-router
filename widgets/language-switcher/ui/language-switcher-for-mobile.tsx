"use client";
import { useEffect, useState } from "react";
import { Button } from "@/shared/common/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem } from "@/shared/common/components/ui/dropdown-menu";
import { DropdownMenuTrigger } from "@/shared/common/components/ui/dropdown-menu";
import { useLocale } from "next-intl";
import { usePathname, useRouter } from "@/i18n/navigation";
import { ChevronDownIcon } from "lucide-react";

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

export default function LanguageSwitcherForMobile() {
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
        <DropdownMenuTrigger asChild>
          <div className="flex items-center justify-between gap-2">
            <span className="text-sm font-medium">Ilova tili:</span>
            <div className="flex items-center gap-1">
              <span className="text-sm">{meta?.label}</span>
              <ChevronDownIcon className="w-4 h-4" />
            </div>
          </div>
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