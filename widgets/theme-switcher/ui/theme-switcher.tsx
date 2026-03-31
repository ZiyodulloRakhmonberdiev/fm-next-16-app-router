"use client";

import { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import { useTranslations } from "next-intl";
import { MoonIcon, SunIcon } from "lucide-react";
import { Switch } from "@/shared/common/components/ui/switch";
import { Label } from "@/shared/common/components/ui/label";

export default function ThemeSwitcher() {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  const isDark = resolvedTheme === "dark";

  const handleToggle = () => {
    setTheme(isDark ? "light" : "dark");
  };

  return (
    <button
      type="button"
      onClick={handleToggle}
      aria-label="Toggle theme"
    >
      {isDark ? (
        // <MoonIcon className="size-5" />
        <SunIcon className="size-5 fill-current" />
      ) : (
        <SunIcon className="size-5 fill-current" />
      )}
    </button>
  );
}

export function ThemeSwitcherForSidebar() {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const t = useTranslations("common")
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  const isDark = resolvedTheme === "dark";

  const handleToggle = () => {
    setTheme(isDark ? "light" : "dark");
  };

  return (
    <div className="flex items-center gap-2 justify-between">
      <Label htmlFor="theme-switcher">{t("dark_mode")}</Label> <Switch id="theme-switcher" checked={isDark} onCheckedChange={handleToggle} />
    </div>
  );
}

export function ThemeSwitcherForHeader() {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  const isDark = resolvedTheme === "dark";

  const handleToggle = () => {
    setTheme(isDark ? "light" : "dark");
  };

  return (
    <button
      type="button"
      role="switch"
      aria-checked={isDark}
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
      onClick={handleToggle}
      className="relative inline-flex h-7 w-14 shrink-0 cursor-pointer items-center rounded-full overflow-hidden bg-brand py-0.5 transition-colors"
    >
      <span
        className={`absolute top-1/2 -translate-y-1/2 flex h-6 w-6 items-center justify-center rounded-full  shadow-sm transition-[left] duration-300 ease-in-out ${isDark ? "left-[calc(100%-1.65rem)]" : "left-0.5"
          }`}
        aria-hidden
      >
        {isDark ? (
          <MoonIcon className="size-4 text-white shrink-0" strokeWidth={2} />
        ) : (
          <SunIcon className="size-4 text-white fill-current shrink-0" strokeWidth={2} />
        )}
      </span>
    </button>
  );
}