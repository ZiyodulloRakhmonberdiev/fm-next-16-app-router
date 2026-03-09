"use client";

import { useTranslations } from "next-intl";
import { SocialMediaButtons } from "@/shared/common/components/ui/social-media-buttons";

export default function StayConnected() {
  const t = useTranslations("stayConnected");

  return (
    <section className="w-full border border-border p-4 rounded-xl space-y-4 my-4 max-w-7xl mx-auto px-4 md:px-6 flex items-center justify-center flex-col">
      <h2 className="text-lg font-semibold text-center">{t("title")}</h2>
      <p className="text-sm text-muted-foreground text-center">{t("subtitle")}</p>
      <SocialMediaButtons variant="button" className="grid grid-cols-2 md:grid-cols-4" />
    </section>
  );
}
