"use client"

import { useEffect, useState } from "react"
import { signOut, useSession } from "next-auth/react"
import { Link } from "@/i18n/navigation"
import { LiaUserEditSolid } from "react-icons/lia";
import { Bookmark, LogOut } from "lucide-react";
import {
  ImageIcon,
  Lock,
  LogIn,
  MessageCircle,
  Smile,
  User,
  UserPlus,
} from "lucide-react"

import { Button } from "@/shared/common/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/shared/common/components/ui/dialog"
import { Input } from "@/shared/common/components/ui/input"
import { Label } from "@/shared/common/components/ui/label"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/shared/common/components/ui/dropdown-menu"
import { toast } from "sonner"
import {
  AuthModal,
  clientModalContentClass,
  clientModalOverlayClass,
} from "@/features/auth/ui/auth-modal"
import { cn } from "@/shared/common/lib/utils"
import { useTranslations } from "next-intl"

export function ClientUserMenu() {
  const { data: session } = useSession()
  const t = useTranslations("auth")
  const [savedCount, setSavedCount] = useState(0)
  const [profileOpen, setProfileOpen] = useState(false)
  const [authOpen, setAuthOpen] = useState(false)
  const [authMode, setAuthMode] = useState<"login" | "register">("login")
  const [fullName, setFullName] = useState("")
  const [image, setImage] = useState("")
  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")

  useEffect(() => {
    void (async () => {
      if (!session?.user?.id) {
        setSavedCount(0)
        return
      }
      const res = await fetch("/api/me/saved-news", { cache: "no-store" })
      if (!res.ok) return
      const payload = (await res.json()) as {
        meta?: { total?: number }
        data?: Array<{ newsSlug: string }>
      }
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

  return (
    <>
      {session?.user ? (
        <>
          <Button size="icon" variant="ghost" aria-label="Saved news">
            <Link
              href="/news/saved"
              className="relative inline-flex items-center rounded-md px-2 py-1 text-xs"
            >
              <Bookmark className="size-5" />
              {savedCount > 0 ? (
                <span className="absolute -right-1 -top-1 py-0.5 rounded-full bg-brand px-1.5 text-[10px] text-primary-foreground text-white">
                  {savedCount}
                </span>
              ) : null}
            </Link>
          </Button>
          <span className="block w-[0.5px] h-5 bg-muted"></span>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button size="icon" variant="ghost" aria-label="User menu">
                <User className="size-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => void openProfileDialog()}>
                <LiaUserEditSolid className="size-5" />
                {t("edit_profile")}
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/user/comments" className="flex items-center gap-2">
                  <MessageCircle className="size-4" />{t("my_comments")}
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/user/reactions" className="flex items-center gap-2">
                  <Smile className="size-4" />{t("my_reactions")}
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => void signOut({ callbackUrl: "/" })}>
                <LogOut className="size-4" />{t("logout")}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </>
      ) : (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button size="icon" variant="ghost" aria-label="Auth menu">
              <User className="size-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem
              onClick={() => {
                setAuthMode("login")
                setAuthOpen(true)
              }}
            >
              <span className="flex items-center gap-2">
                <LogIn className="size-4" />{t("login")}
              </span>
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => {
                setAuthMode("register")
                setAuthOpen(true)
              }}
            >
              <span className="flex items-center gap-2">
                <UserPlus className="size-4" />{t("register")}</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )}

      <Dialog open={profileOpen} onOpenChange={setProfileOpen}>
        <DialogContent
          className={cn("border-0 p-0 gap-0 max-w-xs", clientModalContentClass)}
          overlayClassName={clientModalOverlayClass}
        >
          <div className="flex flex-col gap-4 pt-1 p-5 overflow-y-auto min-h-0 overscroll-contain">
            <DialogHeader className="space-y-1 text-center sm:text-left">
              <DialogTitle className="text-lg font-semibold">
                {t("edit_profile")}
              </DialogTitle>
              <p className="text-xs text-muted-foreground">
                {t("edit_profile_description")}
              </p>
            </DialogHeader>
            <div className="space-y-3">
              <div className="space-y-1.5">
                <Label htmlFor="profile-fullname">{t("full_name")}</Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="profile-fullname"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="pl-9"
                  />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="profile-image">{t("image_url")}</Label>
                <div className="relative">
                  <ImageIcon className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="profile-image"
                    value={image}
                    onChange={(e) => setImage(e.target.value)}
                    className="pl-9"
                  />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="profile-current-password">Joriy parol</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="profile-current-password"
                    type="password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    className="pl-9"
                  />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="profile-new-password">Yangi parol</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="profile-new-password"
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="pl-9"
                  />
                </div>
              </div>
              <Button
                onClick={() => void saveProfile()}
                className="w-full rounded-lg bg-neutral-800 hover:bg-neutral-900 dark:bg-neutral-200 dark:hover:bg-neutral-100 dark:text-neutral-900"
              >
                Saqlash
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
      <AuthModal
        open={authOpen}
        onOpenChange={setAuthOpen}
        defaultMode={authMode}
        onSuccess={() => setAuthOpen(false)}
      />
    </>
  )
}
