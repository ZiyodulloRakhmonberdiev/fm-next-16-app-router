"use client";

import { AlertOctagon } from "lucide-react";
import { seed } from "@/scripts/seed";
import { SocialMediaButtons } from "@/shared/common/components/ui/social-media-buttons";
import { LanguageSwitcher } from "@/widgets/language-switcher";
import { useLocale } from "next-intl";
import type { AppLocale } from "@/shared/common/lib/locale-api";

export default function Headline() {
  const locale = useLocale() as AppLocale;
  const headline = seed.headline[locale];
  return (
    <div className="w-full bg-foreground/10 py-2 hidden md:block">
      <div className="max-w-7xl mx-auto flex items-center px-4 md:px-6 justify-between">
        <p className="text-sm text-foreground font-normal flex items-center">
          <AlertOctagon className="w-4 h-4" />
          <span className="ml-2">{headline}</span>
        </p>
        <div className="flex items-center gap-3">
          <SocialMediaButtons variant="icon-only" />
          <LanguageSwitcher />
        </div>
      </div>
    </div>
  );
}