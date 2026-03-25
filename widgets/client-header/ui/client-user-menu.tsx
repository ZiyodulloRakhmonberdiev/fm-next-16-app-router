"use client"

import { useRef, useState } from "react"
import { signOut, useSession } from "next-auth/react"
import { Link } from "@/i18n/navigation"
import { LiaUserEditSolid } from "react-icons/lia"
import { Bookmark, ImageIcon, Loader2, Lock, LogIn, LogOut, MessageCircle, Smile, Upload, User, UserPlus } from "lucide-react"

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
import { Skeleton } from "@/shared/common/components/ui/skeleton"
import { toast } from "sonner"
import {
  AuthModal,
  clientModalContentClass,
  clientModalOverlayClass,
} from "@/features/auth/ui/auth-modal"
import { cn } from "@/shared/common/lib/utils"
import { useTranslations } from "next-intl"
import { resizeImageToSquareJpeg } from "@/shared/common/lib/resize-profile-avatar"

const AVATAR_SIZE = 100

export function ClientUserMenu() {
  const { data: session } = useSession()
  const t = useTranslations("auth")
  const tc = useTranslations("common")
  const [profileOpen, setProfileOpen] = useState(false)
  const [profileLoading, setProfileLoading] = useState(false)
  const [avatarUploading, setAvatarUploading] = useState(false)
  const [authOpen, setAuthOpen] = useState(false)
  const [authMode, setAuthMode] = useState<"login" | "register">("login")
  const [fullName, setFullName] = useState("")
  const [image, setImage] = useState("")
  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const avatarFileRef = useRef<HTMLInputElement>(null)

  function openProfileDialog() {
    setProfileOpen(true)
    setProfileLoading(true)
    setFullName(session?.user?.name?.trim() ?? "")
    setImage("")
    setCurrentPassword("")
    setNewPassword("")
    void (async () => {
      const res = await fetch("/api/me", { cache: "no-store" })
      if (res.ok) {
        const me = (await res.json()) as { full_name?: string; image?: string | null }
        setFullName(me.full_name ?? "")
        setImage(typeof me.image === "string" ? me.image : "")
      }
      setProfileLoading(false)
    })()
  }

  async function onAvatarFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    e.target.value = ""
    if (!file) return
    setAvatarUploading(true)
    try {
      const blob = await resizeImageToSquareJpeg(file, AVATAR_SIZE)
      const fd = new FormData()
      fd.append("file", new File([blob], "avatar.jpg", { type: "image/jpeg" }))
      const res = await fetch("/api/me/avatar", { method: "POST", body: fd })
      if (!res.ok) {
        const err = await res.json().catch(() => null)
        toast.error(typeof err?.error === "string" ? err.error : t("profile_photo_failed"))
        return
      }
      const data = (await res.json()) as { url?: string }
      if (data.url) setImage(data.url)
      toast.success(tc("saved"))
    } catch {
      toast.error(t("profile_photo_failed"))
    } finally {
      setAvatarUploading(false)
    }
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
      toast.error(typeof err?.error === "string" ? err.error : tc("save_failed"))
      return
    }
    toast.success(t("profile_updated"))
    setCurrentPassword("")
    setNewPassword("")
    setProfileOpen(false)
  }

  return (
    <>
      {session?.user ? (
        <>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button size="icon" variant="ghost" aria-label={t("user_menu_aria")}>
                <User className="size-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={openProfileDialog}>
                <LiaUserEditSolid className="size-4" />
                {t("edit_profile")}
              </DropdownMenuItem>
              <span className="my-1 block h-[0.5px] w-full bg-foreground/10"></span>
              <DropdownMenuItem asChild>
                <Link href="/news/saved" className="flex items-center gap-2">
                  <Bookmark className="size-4" />
                  {t("saved_news")}
                </Link>
              </DropdownMenuItem>
              <span className="my-1 block h-[0.5px] w-full bg-foreground/10"></span>
              <DropdownMenuItem asChild>
                <Link href="/user/comments" className="flex items-center gap-2">
                  <MessageCircle className="size-4" />
                  {t("my_comments")}
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/user/reactions" className="flex items-center gap-2">
                  <Smile className="size-4" />
                  {t("my_reactions")}
                </Link>
              </DropdownMenuItem>
              <span className="my-1 block h-[0.5px] w-full bg-foreground/10"></span>
              <DropdownMenuItem onClick={() => void signOut({ callbackUrl: "/" })}>
                <LogOut className="size-4" />
                {t("logout")}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </>
      ) : (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button size="icon" variant="ghost" aria-label={t("auth_menu_aria")}>
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
                {/* <LogIn className="size-4" /> */}
                {t("login")} / {t("register")}
            </DropdownMenuItem>
            {/* <DropdownMenuItem
              onClick={() => {
                setAuthMode("register")
                setAuthOpen(true)
              }}
            >
              <span className="flex items-center gap-2">
                <UserPlus className="size-4" />
                {t("register")}
              </span>
            </DropdownMenuItem> */}
          </DropdownMenuContent>
        </DropdownMenu>
      )}

      <Dialog
        open={profileOpen}
        onOpenChange={(open) => {
          setProfileOpen(open)
          if (!open) setProfileLoading(false)
        }}
      >
        <DialogContent
          className={cn("max-w-xs gap-0 border-0 p-0", clientModalContentClass)}
          overlayClassName={clientModalOverlayClass}
        >
          <div className="flex min-h-0 flex-col gap-4 overflow-y-auto overscroll-contain p-5 pt-1">
            <DialogHeader className="space-y-1 text-center sm:text-left">
              <DialogTitle className="text-lg font-semibold">{t("edit_profile")}</DialogTitle>
              <p className="text-xs text-muted-foreground">{t("edit_profile_description")}</p>
            </DialogHeader>

            {profileLoading ? (
              <div className="space-y-3">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-24 w-full" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
              </div>
            ) : (
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

                <div className="space-y-2">
                  <Label>{t("image_url")}</Label>
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start">
                    <div className="shrink-0">
                      {image ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={image}
                          alt=""
                          width={AVATAR_SIZE}
                          height={AVATAR_SIZE}
                          className="size-[100px] rounded-md border border-border object-cover"
                        />
                      ) : (
                        <div className="flex size-[100px] items-center justify-center rounded-md border border-dashed border-border bg-muted/40 text-muted-foreground">
                          <ImageIcon className="size-8 opacity-50" aria-hidden />
                        </div>
                      )}
                    </div>
                    <div className="min-w-0 flex-1 space-y-2">
                      <input
                        ref={avatarFileRef}
                        type="file"
                        accept="image/jpeg,image/png,image/webp,image/gif"
                        className="sr-only"
                        onChange={(e) => void onAvatarFileChange(e)}
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="w-full gap-2 sm:w-auto"
                        disabled={avatarUploading}
                        onClick={() => avatarFileRef.current?.click()}
                      >
                        {avatarUploading ? (
                          <Loader2 className="size-4 animate-spin" aria-hidden />
                        ) : (
                          <Upload className="size-4" aria-hidden />
                        )}
                        {t("profile_photo_upload")}
                      </Button>
                      <p className="text-[11px] leading-snug text-muted-foreground">{t("profile_photo_hint")}</p>
                      <div className="relative">
                        <ImageIcon className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                        <Input
                          id="profile-image"
                          value={image}
                          onChange={(e) => setImage(e.target.value)}
                          className="pl-9"
                          placeholder="https://…"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="profile-current-password">{t("current_password")}</Label>
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
                  <Label htmlFor="profile-new-password">{t("new_password")}</Label>
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
                  {tc("save")}
                </Button>
              </div>
            )}
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
