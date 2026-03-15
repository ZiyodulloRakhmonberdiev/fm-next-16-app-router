"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { signIn } from "next-auth/react"
import { useTheme } from "next-themes"
import { useTranslations } from "next-intl"
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

function GoogleIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden>
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
    </svg>
  )
}

function TelegramIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z" />
    </svg>
  )
}

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

  const { resolvedTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])

  const isLogin = mode === "login"
  const title = isLogin ? t("login") : t("register_title")
  const subtitle = isLogin ? t("login_subtitle") : t("register_subtitle")
  const logoSrc =
    mounted && resolvedTheme === "light"
      ? "/images/fm-logo-dark.svg"
      : "/images/fm-logo.svg"

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
            {/* <div className="flex justify-center sm:justify-start">
              {mounted ? (
                <Image
                  src={logoSrc}
                  alt="Logo"
                  width={80}
                  height={28}
                  className="h-7 w-auto object-contain object-left"
                />
              ) : (
                <div className="h-7 w-20 bg-muted rounded" />
              )}
            </div> */}
            <DialogTitle className="text-xl font-semibold">{title}</DialogTitle>
            <p className="text-sm text-muted-foreground">{subtitle}</p>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <div className="space-y-2">
                <Label htmlFor="auth-fullname">{t("full_name")}</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
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
                {isLogin && (
                  <button
                    type="button"
                    className="text-xs text-primary hover:underline"
                  >
                    {t("forgot_password")}
                  </button>
                )}
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

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-border" />
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="bg-background px-2 text-muted-foreground">
                {t("or_sign_in_with")}
              </span>
            </div>
          </div>

          <div className="flex justify-center gap-3">
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
          </div>

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
