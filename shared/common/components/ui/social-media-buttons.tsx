"use client";

import { Link } from "@/i18n/navigation";
import { seed } from "@/scripts/seed";
import { cn } from "@/shared/common/lib/utils";
import { usePublicSiteSettingsQuery } from "@/shared/common/lib/public-site-settings-query";
import { getSocialStyle, SOCIAL_ICONS } from "@/shared/common/components/ui/social-platform-styles";

export type SocialPlatformName = "facebook" | "instagram" | "telegram" | "youtube";

export { SOCIAL_ICONS, getSocialStyle };

type SocialMediaLink = { slug: string; name: string; href: string };

type SocialMediaButtonsProps = {
  variant?: "button" | "icon-only" | "icon-box";
  links?: readonly SocialMediaLink[] | SocialMediaLink[];
  className?: string;
  linkClassName?: string;
};

function resolveSocialLabel(name: unknown): string {
  if (typeof name === "string") return name;
  if (name && typeof name === "object") {
    const map = name as Record<string, unknown>;
    const firstString = ["uz", "uzb", "ru", "en"]
      .map((k) => map[k])
      .find((v) => typeof v === "string");
    if (typeof firstString === "string") return firstString;
  }
  return "Social";
}

export function SocialMediaButtons({
  variant = "button",
  links,
  className,
  linkClassName,
}: SocialMediaButtonsProps) {
  const { data: settings } = usePublicSiteSettingsQuery();
  const isIconOnly = variant === "icon-only";
  const isIconBox = variant === "icon-box";
  const resolvedLinks = links?.length ? links : settings?.socialMedia ?? seed.socialMedia;

  return (
    <div className={cn("flex flex-wrap items-center gap-1", className)}>
      {resolvedLinks.map(({ slug, name, href }) => {
        const style = getSocialStyle(slug);
        const isExternal = href.startsWith("http");
        const label = resolveSocialLabel(name);

        const baseLinkClass = isIconBox
          ? "group inline-flex items-center justify-center overflow-hidden rounded-2xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          : isIconOnly
            ? "group inline-flex shrink-0 items-center justify-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            : "group inline-flex min-h-[2.75rem] items-center justify-center gap-2 rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2";

        const variantClass = isIconBox
          ? "aspect-square size-[4.25rem] p-2.5 text-white shadow-[0_8px_24px_-6px_rgba(0,0,0,0.35)] ring-1 ring-white/30 transition-all duration-300 [transition-timing-function:cubic-bezier(0.34,1.56,0.64,1)] hover:-translate-y-1 hover:scale-[1.04] hover:shadow-[0_14px_32px_-8px_rgba(0,0,0,0.45)] hover:ring-white/45 active:translate-y-0 active:scale-[0.98] [&_svg]:size-[1.35rem] [&_svg]:drop-shadow-sm"
          : isIconOnly
            ? "size-9 rounded-full p-0 text-white shadow-md ring-1 ring-white/25 transition-all duration-200 hover:scale-110 hover:shadow-lg active:scale-95 [&_svg]:size-3.5 [&_svg]:drop-shadow"
            : "border border-white/15 px-4 py-2.5 text-sm font-semibold tracking-wide text-white shadow-[0_6px_20px_-4px_rgba(0,0,0,0.35)] ring-1 ring-white/20 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_10px_28px_-6px_rgba(0,0,0,0.4)] active:translate-y-0 [&_svg]:size-5 [&_svg]:drop-shadow-sm";

        const surfaceClass = style.gradient;

        return (
          <Link
            key={slug}
            href={href}
            target={isExternal ? "_blank" : undefined}
            rel={isExternal ? "noopener noreferrer" : undefined}
            className={cn(baseLinkClass, variantClass, surfaceClass, linkClassName)}
            aria-label={label}
          >
            {style.icon}
            {!isIconOnly && !isIconBox && <span className="drop-shadow-sm">{label}</span>}
          </Link>
        );
      })}
    </div>
  );
}
