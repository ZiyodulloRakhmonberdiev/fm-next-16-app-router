"use client";

import { AlertOctagon, Bookmark, LogIn, MessageCircle, Smile, User, UserPlus } from "lucide-react";
import { SocialMediaButtons } from "@/shared/common/components/ui/social-media-buttons";
import { LanguageSwitcher } from "@/widgets/language-switcher";
import { Link } from "@/i18n/navigation";
import { useLocale } from "next-intl";
import type { AppLocale } from "@/shared/common/lib/locale-api";
import { usePublicSiteSettingsQuery } from "@/shared/common/lib/public-site-settings-query";
import { signOut, useSession } from "next-auth/react";
import { Button } from "@/shared/common/components/ui/button";
import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/shared/common/components/ui/dialog";
import { Input } from "@/shared/common/components/ui/input";
import { Label } from "@/shared/common/components/ui/label";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/shared/common/components/ui/dropdown-menu";
import { toast } from "sonner";
import { signIn } from "next-auth/react";

export default function Headline() {
  const locale = useLocale() as AppLocale;
  const { data: session } = useSession()
  const { data: settings } = usePublicSiteSettingsQuery()
  const [savedCount, setSavedCount] = useState(0)
  const [profileOpen, setProfileOpen] = useState(false)
  const [authOpen, setAuthOpen] = useState(false)
  const [authMode, setAuthMode] = useState<"login" | "register">("login")
  const [fullName, setFullName] = useState("")
  const [image, setImage] = useState("")
  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [loginValue, setLoginValue] = useState("")
  const [passwordValue, setPasswordValue] = useState("")
  const [confirmPasswordValue, setConfirmPasswordValue] = useState("")
  const enabled = settings?.headline.enabled ?? true
  const headline =
    settings?.headline.message[locale] ??
    settings?.headline.message.uz ??
    ""

  useEffect(() => {
    void (async () => {
      if (!session?.user?.id) {
        setSavedCount(0)
        return
      }
      const res = await fetch("/api/me/saved-news", { cache: "no-store" })
      if (!res.ok) return
      const payload = (await res.json()) as { meta?: { total?: number }; data?: Array<{ newsSlug: string }> }
      const rows = payload.data ?? []
      if (typeof payload.meta?.total === "number") {
        setSavedCount(payload.meta.total)
        return
      }
      setSavedCount(rows.length)
    })()
  }, [session?.user?.id])

  async function openProfileDialog() {
    const res = await fetch("/api/me", { cache: "no-store" })
    if (res.ok) {
      const me = await res.json()
      setFullName(me.full_name ?? "")
      setImage(me.image ?? "")
    }
    setProfileOpen(true)
  }

  async function saveProfile() {
    const res = await fetch("/api/me", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        full_name: fullName,
        image: image || null,
        currentPassword: currentPassword || undefined,
        newPassword: newPassword || undefined,
      }),
    })
    if (!res.ok) {
      const err = await res.json().catch(() => null)
      toast.error(err?.error ?? "Saqlab bo'lmadi")
      return
    }
    toast.success("Profil yangilandi")
    setCurrentPassword("")
    setNewPassword("")
    setProfileOpen(false)
  }

  async function submitAuth() {
    if (authMode === "login") {
      const result = await signIn("credentials", {
        login: loginValue,
        password: passwordValue,
        redirect: false,
      })
      if (!result?.ok) {
        toast.error("Login yoki parol noto'g'ri")
        return
      }
      setAuthOpen(false)
      window.location.reload()
      return
    }

    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        full_name: fullName,
        login: loginValue,
        password: passwordValue,
        confirmPassword: confirmPasswordValue,
      }),
    })
    if (!res.ok) {
      const err = await res.json().catch(() => null)
      toast.error(err?.error ?? "Ro'yxatdan o'tib bo'lmadi")
      return
    }
    await signIn("credentials", { login: loginValue, password: passwordValue, callbackUrl: "/" })
  }

  return (
    <div className="w-full bg-foreground/10 py-2 hidden md:block space-y-2">
      <div className="max-w-7xl mx-auto flex items-center px-4 md:px-6 justify-between">
        <div className="min-h-5">
          {enabled && headline.trim() ? (
            <p className="text-sm text-foreground font-normal flex items-center">
              <AlertOctagon className="w-4 h-4" />
              <span className="ml-2">{headline}</span>
            </p>
          ) : null}
        </div>
        <div className="flex items-center gap-3">
          <SocialMediaButtons variant="icon-only" />
          {session?.user ? (
            <>
              <Link href="/news/saved" className="relative inline-flex items-center rounded-md border px-2 py-1 text-xs hover:bg-muted">
                <Bookmark className="size-4" />
                {savedCount > 0 ? (
                  <span className="absolute -right-2 -top-2 rounded-full bg-primary px-1.5 text-[10px] text-primary-foreground">
                    {savedCount}
                  </span>
                ) : null}
              </Link>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button size="icon" variant="outline" aria-label="User menu">
                    <User className="size-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => void openProfileDialog()}>Profilni tahrirlash</DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/user/comments" className="flex items-center gap-2"><MessageCircle className="size-4" />Mening izohlarim</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/user/reactions" className="flex items-center gap-2"><Smile className="size-4" />Mening reaksiyalarim</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => void signOut({ callbackUrl: "/auth/login" })}>
                    Chiqish
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          ) : (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button size="icon" variant="outline" aria-label="Auth menu">
                  <User className="size-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => { setAuthMode("login"); setAuthOpen(true) }}>
                  <span className="flex items-center gap-2"><LogIn className="size-4" />Kirish</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => { setAuthMode("register"); setAuthOpen(true) }}>
                  <span className="flex items-center gap-2"><UserPlus className="size-4" />Ro&apos;yxatdan o&apos;tish</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
          <LanguageSwitcher />
        </div>
      </div>
      <Dialog open={profileOpen} onOpenChange={setProfileOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Profil ma&apos;lumotlari</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div className="space-y-1">
              <Label>Full name</Label>
              <Input value={fullName} onChange={(e) => setFullName(e.target.value)} />
            </div>
            <div className="space-y-1">
              <Label>Image URL</Label>
              <Input value={image} onChange={(e) => setImage(e.target.value)} />
            </div>
            <div className="space-y-1">
              <Label>Current password</Label>
              <Input type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} />
            </div>
            <div className="space-y-1">
              <Label>New password</Label>
              <Input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} />
            </div>
            <Button onClick={() => void saveProfile()}>Saqlash</Button>
          </div>
        </DialogContent>
      </Dialog>
      <Dialog open={authOpen} onOpenChange={setAuthOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>{authMode === "login" ? "Kirish" : "Ro'yxatdan o'tish"}</DialogTitle></DialogHeader>
          <div className="space-y-3">
            {authMode === "register" ? (
              <div className="space-y-1">
                <Label>Full name</Label>
                <Input value={fullName} onChange={(e) => setFullName(e.target.value)} />
              </div>
            ) : null}
            <div className="space-y-1">
              <Label>Login</Label>
              <Input value={loginValue} onChange={(e) => setLoginValue(e.target.value)} />
            </div>
            <div className="space-y-1">
              <Label>Password</Label>
              <Input type="password" value={passwordValue} onChange={(e) => setPasswordValue(e.target.value)} />
            </div>
            {authMode === "register" ? (
              <div className="space-y-1">
                <Label>Confirm password</Label>
                <Input type="password" value={confirmPasswordValue} onChange={(e) => setConfirmPasswordValue(e.target.value)} />
              </div>
            ) : null}
            <Button onClick={() => void submitAuth()}>Davom etish</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}