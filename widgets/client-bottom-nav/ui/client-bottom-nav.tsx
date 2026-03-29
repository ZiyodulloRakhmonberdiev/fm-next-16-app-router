"use client"

import { Link, usePathname } from "@/i18n/navigation"
import { cn } from "@/shared/common/lib/utils"
import { RiMenuFill } from "react-icons/ri";
import { RiHome5Fill } from "react-icons/ri";
import { HiLightningBolt } from "react-icons/hi";
import { FaRadio } from "react-icons/fa6";
import { IoTv } from "react-icons/io5";
import { BsFillPlayCircleFill } from "react-icons/bs";



const navItems = [
  { key: "home", href: "/", label: "Bosh sahifa", icon: RiHome5Fill },
  { key: "news", href: "/news", label: "Yangiliklar", icon: HiLightningBolt },
  { key: "shows", href: "/news/video", label: "Ko'rsatuvlar", icon: IoTv },
  { key: "audio", href: "/news/audio", label: "Audio", icon: FaRadio },
  { key: "menu", href: "/menu", label: "Menu", icon: RiMenuFill },
] as const

export default function ClientBottomNav() {
  const pathname = usePathname()
  const activeKey = pathname.startsWith("/news/audio/") || pathname === "/news/audio"
    ? "audio"
    : pathname.startsWith("/news/video/") || pathname === "/news/video"
      ? "shows"
      : pathname.startsWith("/menu/") || pathname === "/menu"
        ? "menu"
        : pathname === "/"
          ? "home"
          : pathname === "/news" || pathname.startsWith("/news/")
            ? "news"
            : null

  return (
    <>
      <div className="h-12 md:hidden" aria-hidden />
      <nav className="fixed inset-x-0 bottom-0 z-60 border-t border-border bg-background/95 backdrop-blur md:hidden">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-2 pt-1 pb-[calc(env(safe-area-inset-bottom)+0.3rem)]">
          {navItems.map((item) => {
            const Icon = item.icon
            const active = activeKey === item.key
            return (
              <Link
                key={item.href}

                href={item.href}
                className={cn(
                  "flex min-w-0 flex-1 flex-col items-center justify-center gap-1 rounded-md px-1 py-1.5 text-[11px] transition-colors ",
                  active ? "text-foreground" : "text-muted-foreground"
                )}
              >

                <Icon className={cn("size-4", active && "text-foreground")} />
                <span className="truncate">{item.label}</span>
              </Link>
            )
          })}
        </div>
      </nav>
    </>
  )
}
