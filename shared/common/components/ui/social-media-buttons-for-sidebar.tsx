"use client";

import { Link } from "@/i18n/navigation";
import { seed } from "@/scripts/seed";
import { cn } from "@/shared/common/lib/utils";
import { usePublicSiteSettingsQuery } from "@/shared/server/public-site-settings-query";
import { getSocialStyle } from "@/shared/common/components/ui/social-platform-styles";

export type SocialPlatformName = "facebook" | "instagram" | "telegram" | "youtube";

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

export function SocialMediaButtonsForSidebar({
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
          ? "group inline-flex items-center justify-center overflow-hidden rounded-xl focus-visible:outline-none"
          : isIconOnly
            ? "group inline-flex shrink-0 items-center justify-center focus-visible:outline-none"
            : "group inline-flex min-h-11 items-center justify-center gap-2 rounded-xl px-4 focus-visible:outline-none";

        const variantClass = isIconBox
          ? "aspect-square size-12 p-2 text-white shadow-[0_6px_18px_-5px_rgba(0,0,0,0.35)] transition-all duration-300 [transition-timing-function:cubic-bezier(0.34,1.56,0.64,1)] hover:-translate-y-0.5 hover:scale-[1.06] hover:shadow-[0_10px_24px_-6px_rgba(0,0,0,0.42)] active:scale-100 [&_svg]:size-5 [&_svg]:drop-shadow-sm"
          : isIconOnly
            ? "size-9 rounded-full p-0 text-white shadow-sm transition-transform hover:scale-105 active:scale-100 [&_svg]:size-[0.95rem] [&_svg]:drop-shadow-sm"
            : "px-3 py-2 text-sm font-semibold text-white shadow-md transition-all hover:-translate-y-px hover:shadow-lg [&_svg]:size-5";

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
