"use client";

import { useEffect, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { usePathname, useRouter } from "@/i18n/navigation";
import { Button } from "@/shared/common/components/ui/button";
import { cn } from "@/shared/common/lib/utils";

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

export default function LanguageSwitcherForSidebar() {
  const t = useTranslations("common");
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

  const locales = ["uz", "uzb", "ru", "en"] as const;

  return (
    <div className="flex flex-col gap-2">
      <div className="inline-flex items-center justify-center gap-2 rounded-full px-2 py-1.5">
        {locales.map((locale, index) => {
          const meta = localeMeta[locale];
          const isActive = selectedLocale === locale;

          return (
            <div key={locale} className="flex items-center gap-2">
              <Button
                type="button"
                size="sm"
                variant={isActive ? "default" : "ghost"}
                className={cn(
                  "h-7 px-2 rounded-sm",
                  isActive && "bg-brand text-white hover:bg-brand/90 shadow-sm",
                )}
                onClick={() => handleSetLocale(locale)}
              >
                <span className="leading-none">{meta.short}</span>
              </Button>

              {index < locales.length - 1 && (
                <span className="mx-1 text-xs text-border select-none">|</span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}