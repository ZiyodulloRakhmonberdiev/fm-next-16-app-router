"use client";

import { useTranslations } from "next-intl";
import { SocialMediaButtons } from "@/shared/common/components/ui/social-media-buttons";

export default function StayConnected() {
  const t = useTranslations("stayConnected");

  return (
    <section className="w-full space-y-4 my-4">
      <h2 className="text-lg font-semibold">{t("title")}</h2>
      <p className="text-sm text-muted-foreground">{t("subtitle")}</p>
      <SocialMediaButtons variant="button" />
    </section>
  );
}
