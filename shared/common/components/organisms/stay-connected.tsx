"use client";

import * as React from "react";
import { useTranslations } from "next-intl";
import { SocialMediaButtons } from "@/shared/common/components/ui/social-media-buttons";
import { cn } from "@/shared/common/lib/utils";
import { Button } from "../ui/button";
import Image from "next/image";

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

  const buttonsClass = cn(
    isWide
      ? "!inline-flex w-auto max-w-none flex-nowrap items-center justify-end gap-2"
      : "!grid w-full max-w-2xl justify-items-stretch gap-3 grid-cols-2 sm:grid-cols-4",
  );

  return (
    <div className="mx-auto my-0 mb-4 max-w-7xl bg-background px-4 md:my-3 md:px-6">
      <section className="my-8">
          <div className="rounded-lg border border-border px-4 py-3 md:px-6 md:py-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-3">
              <Image src="/images/icons/telegram.png" alt="Telegram" width={48} height={48} />
              <p className="text-sm md:text-base leading-snug">
                {t.rich("news_telegram_card_text", {
                  telegram: (chunks) => (
                    <a
                      href={"/telegram"}
                      target="_blank"
                      rel="noreferrer"
                      className="font-semibold text-[#229ED9] underline-offset-2"
                    >
                      {chunks}
                    </a>
                  ),
                })}
              </p>
            </div>
            <div className="flex justify-end">
              <Button
                asChild
                variant="secondary"
                className="mt-1 md:mt-0 text-white hover:bg-[#229ED9]/90 bg-[#229ED9] rounded-sm "
              >
                <a href={"telegram"} target="_blank" rel="noreferrer">
                  {t("follow")}
                </a>
              </Button>
            </div>
          </div>
        </section>
    </div>
  );
}



export function StayConnectedSidebar() {
  const t = useTranslations("stayConnected")

  return (
    <section className="mb-3 hidden w-full space-y-3 lg:block">
      <div className="rounded-lg border border-border bg-muted/20 p-3 dark:bg-muted/10">
        <h2 className="text-sm font-semibold text-foreground">{t("title")}</h2>
        <p className="mt-0.5 line-clamp-2 text-xs text-muted-foreground">{t("subtitle")}</p>
        <SocialMediaButtons
          variant="icon-only"
          className="mt-3 flex flex-wrap gap-2"
          linkClassName="size-8 [&_svg]:size-[0.85rem]"
        />
      </div>
    </section>
  )
}
