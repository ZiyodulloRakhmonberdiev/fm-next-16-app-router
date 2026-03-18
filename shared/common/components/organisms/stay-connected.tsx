"use client";

import * as React from "react";
import { useTranslations } from "next-intl";
import { SocialMediaButtons } from "@/shared/common/components/ui/social-media-buttons";

export default function StayConnected() {
  const t = useTranslations("stayConnected");
  const sectionRef = React.useRef<HTMLElement | null>(null);
  const [isWide, setIsWide] = React.useState(false);

  React.useEffect(() => {
    const el = sectionRef.current;
    if (!el || typeof ResizeObserver === "undefined") return;

    const observer = new ResizeObserver((entries) => {
      const entry = entries[0];
      if (!entry) return;
      const width = entry.contentRect.width;
      setIsWide(width >= 768);
    });

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const gridColsClass = isWide ? "grid grid-cols-4" : "grid grid-cols-2";

  return (
    <div className="bg-background max-w-7xl mx-auto px-4 md:px-6 my-0 mb-4 md:my-3">
      <section
        ref={sectionRef}
        className="w-full border border-border p-2 py-4 rounded-xl space-y-4 my-4 px-4 md:px-6 flex items-center justify-center flex-col"
      >
        <h2 className="text-lg font-semibold text-center">{t("title")}</h2>
        <p className="text-sm text-muted-foreground text-center">{t("subtitle")}</p>
        <SocialMediaButtons variant="button" className={gridColsClass} />
      </section>
    </div>
  );
}



export function StayConnectedSidebar() {
  const t = useTranslations("stayConnected")

  return (
    <section className="hidden lg:block mb-3 w-full space-y-3">
      <h2 className="text-base font-semibold text-foreground">{t("title")}</h2>
      <div className="border-b border-border" aria-hidden />
      <SocialMediaButtons
        variant="icon-box"
        className="grid grid-cols-4 gap-2"
      />
    </section>
  )
}
