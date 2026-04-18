"use client"

import { useState } from "react"
import { signIn } from "next-auth/react"
import { useTranslations } from "next-intl"
import { Link } from "@/i18n/navigation"
import { Eye, EyeOff, Lock, Mail, User } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/shared/common/components/ui/dialog"
import { Button } from "@/shared/common/components/ui/button"
import { Input } from "@/shared/common/components/ui/input"
import { Label } from "@/shared/common/components/ui/label"
import { toast } from "sonner"
import { cn } from "@/shared/common/lib/utils"
import { FaUser } from "react-icons/fa"

export const clientModalContentClass =
  "fixed top-[50%] left-[50%] z-50 w-full  max-w-xs max-h-[90vh] translate-x-[-50%] translate-y-[-50%] rounded-2xl border border-border dark:bg-background dark:border-border shadow-2xl backdrop-blur-xl outline-none flex flex-col overflow-hidden data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 pt-6"

export const clientModalOverlayClass =
  "fixed inset-0 z-50 bg-black/70 dark:bg-black/60 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0"

export type AuthModalProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  defaultMode?: "login" | "register"
  onSuccess?: () => void
}

export function AuthModal({
  open,
  onOpenChange,
  defaultMode = "login",
  onSuccess,
}: AuthModalProps) {
  const t = useTranslations("auth")
  const [mode, setMode] = useState<"login" | "register">(defaultMode)
  const [fullName, setFullName] = useState("")
  const [login, setLogin] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  const isLogin = mode === "login"
  const title = isLogin ? t("login") : t("register_title")
  const subtitle = isLogin ? t("login_subtitle") : t("register_subtitle")

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (isLogin) {
      setSubmitting(true)
      const result = await signIn("credentials", {
        login: login.trim(),
        password,
        redirect: false,
      })
      setSubmitting(false)
      if (!result?.ok) {
        toast.error(t("login_error") ?? "Login yoki parol noto'g'ri")
        return
      }
      onSuccess?.()
      onOpenChange(false)
      window.location.reload()
      return
    }

    if (password !== confirmPassword) {
      toast.error("Parollar mos emas")
      return
    }
    setSubmitting(true)
    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        full_name: fullName.trim(),
        login: login.trim(),
        password,
        confirmPassword,
      }),
    })
    setSubmitting(false)
    if (!res.ok) {
      const err = await res.json().catch(() => null)
      toast.error(err?.error ?? "Ro'yxatdan o'tib bo'lmadi")
      return
    }
    await signIn("credentials", { login: login.trim(), password, callbackUrl: "/" })
    onSuccess?.()
    onOpenChange(false)
  }

  function handleSocialSignIn(provider: "google" | "telegram") {
    if (provider === "google") {
      void signIn("google", { callbackUrl: "/" })
      return
    }
    void signIn("telegram", { callbackUrl: "/" })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton={true}
        className={cn("border-0 p-0 gap-0 max-w-xs", clientModalContentClass)}
        overlayClassName={clientModalOverlayClass}
      >
        <div className="flex flex-col gap-4 pt-1 p-5 overflow-y-auto min-h-0 overscroll-contain">
          <DialogHeader className="space-y-1 text-center sm:text-left">
            <DialogTitle className="text-xl font-semibold">{title}</DialogTitle>
            <p className="text-sm text-muted-foreground">{subtitle}</p>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <div className="space-y-2">
                <Label htmlFor="auth-fullname">{t("full_name")}</Label>
                <div className="relative">
                  <FaUser className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="auth-fullname"
                    type="text"
                    placeholder={t("full_name")}
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="pl-9"
                    required
                    maxLength={128}
                  />
                </div>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="auth-email">{t("email_or_username_placeholder")}</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="auth-email"
                  type="text"
                  placeholder={t("email_or_username_placeholder")}
                  value={login}
                  onChange={(e) => setLogin(e.target.value)}
                  className="pl-9"
                  required
                  maxLength={128}
                  minLength={3}
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="auth-password">{t("password")}</Label>
                {/* {isLogin && (
                  <button
                    type="button"
                    className="text-xs text-primary hover:underline"
                  >
                    {t("forgot_password")}
                  </button>
                )} */}
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="auth-password"
                  type={showPassword ? "text" : "password"}
                  placeholder={t("password")}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-9 pr-9"
                  required
                  maxLength={128}
                  minLength={6}
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  onClick={() => setShowPassword((p) => !p)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                </button>
              </div>
            </div>

            {!isLogin && (
              <div className="space-y-2">
                <Label htmlFor="auth-confirm">{t("confirm_password")}</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="auth-confirm"
                    type="password"
                    placeholder={t("confirm_password")}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="pl-9"
                    required
                    maxLength={128}
                  />
                </div>
              </div>
            )}

            <Button
              type="submit"
              className="w-full rounded-lg bg-neutral-800 hover:bg-neutral-900 dark:bg-neutral-200 dark:hover:bg-neutral-100 dark:text-neutral-900"
              disabled={submitting}
            >
              {t("get_started")}
            </Button>
          </form>

          {/* <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-border" />
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="bg-background px-2 text-muted-foreground">
                {t("or_sign_in_with")}
              </span>
            </div>
          </div> */}

          {/* <div className="flex justify-center gap-3">
            <button
              type="button"
              disabled
              className="flex size-12 items-center justify-center rounded-full border border-input bg-muted/50 opacity-70 cursor-not-allowed"
              aria-label="Google"
            >
              <GoogleIcon className="size-6" />
            </button>
            <button
              type="button"
              disabled
              className="flex size-12 items-center justify-center rounded-full border border-input bg-muted/50 opacity-70 cursor-not-allowed text-[#0088cc]"
              aria-label="Telegram"
            >
              <TelegramIcon className="size-6" />
            </button>
          </div> */}

          <p className="text-center text-sm text-muted-foreground">
            {isLogin ? (
              <>
                {t("if_no_account")}{" "}
                <button
                  type="button"
                  className="font-medium text-primary underline hover:no-underline"
                  onClick={() => setMode("register")}
                >
                  {t("register")}
                </button>
              </>
            ) : (
              <>
                {t("if_have_account")}{" "}
                <button
                  type="button"
                  className="font-medium text-primary underline hover:no-underline"
                  onClick={() => setMode("login")}
                >
                  {t("login")}
                </button>
              </>
            )}
          </p>
        </div>
      </DialogContent>
    </Dialog>
  )
}
