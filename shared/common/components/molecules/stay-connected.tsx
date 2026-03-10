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
    <div className="bg-background">
      <section
        ref={sectionRef}
        // className="px-4 md:px-6 space-y-4 my-4 border border-border rounded-xl"
      className="w-full border border-border p-2 py-4 rounded-xl space-y-4 my-4 px-4 md:px-6 flex items-center justify-center flex-col"
      >
        <h2 className="text-lg font-semibold text-center">{t("title")}</h2>
        <p className="text-sm text-muted-foreground text-center">{t("subtitle")}</p>
        <SocialMediaButtons variant="button" className={gridColsClass} />
      </section>
    </div>
  );
}
